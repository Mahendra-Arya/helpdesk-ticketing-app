const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { createUploader } = require('../middleware/uploadMiddleware');

const upload = createUploader('ticket');

router.get('/', authenticateToken, ticketController.getTickets);
router.get('/notifications/list', authenticateToken, ticketController.getNotifications);
router.get('/:id', authenticateToken, ticketController.getTicketById);
router.post('/', authenticateToken, upload.single('attachment'), ticketController.createTicket);
router.put('/:id/status', authenticateToken, authorizeRole(['admin']), upload.single('attachment'), ticketController.updateTicketStatus);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), ticketController.deleteTicket);

module.exports = router;