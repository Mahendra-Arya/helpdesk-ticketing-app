const db = require('../config/db');
const { getIO } = require('../socket/socketHandler');
const { sanitizeText } = require('../utils/sanitizer');

exports.getComments = async (req, res, next) => {
  const { id: ticket_id } = req.params;

  try {
    const [tickets] = await db.query('SELECT user_id FROM tickets WHERE id = ?', [ticket_id]);
    if (tickets.length === 0) return res.status(404).json({ message: 'Tiket tidak ditemukan' });

    if (req.user.role === 'employee' && tickets[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak ke komentar tiket ini' });
    }

    const sql = `
      SELECT ticket_comments.*, users.name as user_name, users.role as user_role
      FROM ticket_comments 
      JOIN users ON ticket_comments.user_id = users.id 
      WHERE ticket_id = ? 
      ORDER BY created_at ASC
    `;
    const [comments] = await db.query(sql, [ticket_id]);

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

exports.createComment = async (req, res, next) => {
  const { id: ticket_id } = req.params;
  const cleanComment = sanitizeText(req.body.comment, 2000);
  const user_id = req.user.id;
  const attachment = req.file ? req.file.filename : null;

  if (!cleanComment && !attachment) {
    return res.status(400).json({ message: 'Pesan atau lampiran tidak boleh kosong' });
  }

  try {
    const [tickets] = await db.query('SELECT user_id, title FROM tickets WHERE id = ?', [ticket_id]);
    if (tickets.length === 0) return res.status(404).json({ message: 'Tiket tidak ditemukan' });

    const ticketOwnerId = tickets[0].user_id;
    const ticketTitle = tickets[0].title;

    if (req.user.role === 'employee' && ticketOwnerId !== user_id) {
      return res.status(403).json({ message: 'Akses ditolak: Tidak bisa berkomentar di tiket milik orang lain' });
    }

    const [result] = await db.query(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment, attachment, created_at) VALUES (?, ?, ?, ?, NOW())',
      [ticket_id, user_id, cleanComment, attachment]
    );

    const [newCommentRows] = await db.query(`
      SELECT ticket_comments.*, users.name as user_name, users.role as user_role 
      FROM ticket_comments 
      JOIN users ON ticket_comments.user_id = users.id 
      WHERE ticket_comments.id = ?
    `, [result.insertId]);

    const newComment = { ...newCommentRows[0], ticket_title: ticketTitle };

    const io = getIO();
    if (io) {
      // Kirim hanya ke room admins & pemilik tiket (mencegah kebocoran pesan antar karyawan)
      io.to('admins').to(`user:${ticketOwnerId}`).emit('comment:created', newComment);
    }

    res.status(201).json({ message: 'Komentar terkirim', comment: newComment });
  } catch (error) {
    next(error);
  }
};