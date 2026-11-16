const db = require('../config/db');

const BASE_TICKET_QUERY = `
  SELECT 
    t.id, t.title, t.description, t.status, t.priority, 
    t.attachment, t.admin_note, t.created_at, t.updated_at,
    u.id AS user_id, u.name AS user_name, u.email AS user_email,
    c.id AS category_id, c.name AS category_name
  FROM tickets t
  JOIN users u ON t.user_id = u.id
  JOIN categories c ON t.category_id = c.id
`;

const findTicketById = async (ticketId) => {
  const [rows] = await db.query(`${BASE_TICKET_QUERY} WHERE t.id = ?`, [ticketId]);
  return rows[0] || null;
};

module.exports = {
  BASE_TICKET_QUERY,
  findTicketById
};