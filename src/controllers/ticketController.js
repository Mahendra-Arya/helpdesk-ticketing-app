const db = require('../config/db');
const { getIO } = require('../socket/socketHandler');
const { sanitizeText } = require('../utils/sanitizer');
const { BASE_TICKET_QUERY, findTicketById } = require('../utils/ticketHelper');

const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

exports.getTickets = async (req, res, next) => {
  try {
    const { status, category_id, q } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const whereConditions = [];
    const queryParams = [];

    if (req.user.role === 'employee') {
      whereConditions.push('t.user_id = ?');
      queryParams.push(req.user.id);
    }

    if (status && VALID_STATUSES.includes(status)) {
      whereConditions.push('t.status = ?');
      queryParams.push(status);
    }

    if (category_id) {
      whereConditions.push('t.category_id = ?');
      queryParams.push(category_id);
    }

    if (q) {
      const cleanSearch = sanitizeText(q, 100);
      whereConditions.push('t.title LIKE ?');
      queryParams.push(`%${cleanSearch}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM tickets t ${whereClause}`, queryParams);
    const [rows] = await db.query(
      `${BASE_TICKET_QUERY} ${whereClause} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    res.json({
      pagination: {
        total_items: total,
        total_pages: Math.ceil(total / limit),
        current_page: page,
        limit
      },
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.getTicketById = async (req, res, next) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) {
    return res.status(400).json({ code: 400, message: 'ID Tiket tidak valid' });
  }

  try {
    const ticket = await findTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ code: 404, message: 'Tiket tidak ditemukan' });
    }

    if (req.user.role === 'employee' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: 'Akses ditolak: Anda tidak memiliki akses ke tiket ini' });
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

exports.createTicket = async (req, res, next) => {
  try {
    const { category_id, title, description, priority } = req.body;
    const user_id = req.user.id;
    const attachment = req.file ? req.file.filename : null;

    const cleanTitle = sanitizeText(title, 150);
    const cleanDescription = sanitizeText(description, 2000);
    const cleanPriority = VALID_PRIORITIES.includes(priority) ? priority : 'low';

    if (!category_id || !cleanTitle || !cleanDescription) {
      return res.status(400).json({
        code: 400,
        message: 'Kategori, judul, dan deskripsi wajib diisi dengan lengkap'
      });
    }

    const [categoryCheck] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (categoryCheck.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Kategori yang dipilih tidak valid atau sudah dihapus.'
      });
    }

    const [result] = await db.query(
      'INSERT INTO tickets (user_id, category_id, title, description, priority, status, attachment, created_at, updated_at) VALUES (?, ?, ?, ?, ?, "open", ?, NOW(), NOW())',
      [user_id, category_id, cleanTitle, cleanDescription, cleanPriority, attachment]
    );

    const newTicket = await findTicketById(result.insertId);

    const io = getIO();
    if (io) io.to('admins').emit('ticket:created', newTicket);

    res.status(201).json({
      code: 201,
      message: 'Tiket berhasil dibuat',
      data: newTicket
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTicketStatus = async (req, res, next) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) {
    return res.status(400).json({ code: 400, message: 'ID Tiket tidak valid' });
  }

  const { status, comment } = req.body;
  const attachment = req.file ? req.file.filename : null;

  try {
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        code: 400,
        message: `Status tidak valid. Nilai yang diizinkan: ${VALID_STATUSES.join(', ')}`
      });
    }

    const existingTicket = await findTicketById(ticketId);
    if (!existingTicket) {
      return res.status(404).json({ code: 404, message: 'Tiket tidak ditemukan' });
    }

    const cleanComment = comment ? sanitizeText(comment, 1000) : existingTicket.admin_note;
    const finalAttachment = attachment || existingTicket.attachment;

    await db.query(
      'UPDATE tickets SET status = ?, admin_note = ?, attachment = ?, updated_at = NOW() WHERE id = ?',
      [status, cleanComment, finalAttachment, ticketId]
    );

    const updatedData = await findTicketById(ticketId);

    const io = getIO();
    if (io) {
      io.to('admins').to(`user:${existingTicket.user_id}`).emit('ticket:updated', updatedData);
    }

    res.json({
      code: 200,
      message: 'Status tiket berhasil diperbarui',
      data: updatedData
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTicket = async (req, res, next) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) {
    return res.status(400).json({ code: 400, message: 'ID Tiket tidak valid' });
  }

  try {
    const [result] = await db.query('DELETE FROM tickets WHERE id = ?', [ticketId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: 'Tiket tidak ditemukan' });
    }

    res.json({ code: 200, message: 'Tiket berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let notifications = [];

    if (userRole === 'admin') {
      const [ticketNotifs] = await db.query(`
        SELECT 
          CONCAT('ticket-', t.id) AS id, 
          t.id AS ticket_id, 
          'membuat tiket baru' AS message, 
          t.created_at,
          u.name AS user_name, 
          t.title AS ticket_title, 
          'ticket_created' AS type
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        WHERE u.role = 'employee'
      `);

      const [commentNotifs] = await db.query(`
        SELECT 
          CONCAT('comment-', tc.id) AS id, 
          tc.ticket_id, 
          CONCAT('mengirim pesan: "', LEFT(tc.comment, 30), '"') AS message, 
          tc.created_at,
          u.name AS user_name, 
          t.title AS ticket_title, 
          'comment_created' AS type
        FROM ticket_comments tc
        JOIN users u ON tc.user_id = u.id
        JOIN tickets t ON tc.ticket_id = t.id
        WHERE u.role = 'employee' AND tc.user_id != ?
      `, [userId]);

      notifications = [...ticketNotifs, ...commentNotifs];
    } else {
      const [statusNotifs] = await db.query(`
        SELECT 
          CONCAT('status-', t.id, '-', UNIX_TIMESTAMP(t.updated_at)) AS id, 
          t.id AS ticket_id, 
          CONCAT('memperbarui status tiket menjadi "', UPPER(t.status), '"') AS message, 
          t.updated_at AS created_at,
          'Admin IT' AS user_name, 
          t.title AS ticket_title, 
          'ticket_updated' AS type
        FROM tickets t
        WHERE t.user_id = ? AND t.created_at != t.updated_at
      `, [userId]);

      const [commentNotifs] = await db.query(`
        SELECT 
          CONCAT('comment-', tc.id) AS id, 
          tc.ticket_id, 
          CONCAT('mengirim pesan: "', LEFT(tc.comment, 30), '"') AS message, 
          tc.created_at,
          u.name AS user_name, 
          t.title AS ticket_title, 
          'comment_created' AS type
        FROM ticket_comments tc
        JOIN users u ON tc.user_id = u.id
        JOIN tickets t ON tc.ticket_id = t.id
        WHERE t.user_id = ? AND u.role = 'admin' AND tc.user_id != ?
      `, [userId, userId]);

      notifications = [...statusNotifs, ...commentNotifs];
    }

    notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(notifications.slice(0, 15));
  } catch (error) {
    next(error);
  }
};