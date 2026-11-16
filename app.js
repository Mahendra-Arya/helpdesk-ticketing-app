require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

// Import Error Handlers modular dari folder middleware
const {
  initProcessErrorHandlers,
  notFoundHandler,
  globalErrorHandler
} = require('./src/middleware/errorHandler');

// Aktifkan Process-Level Error Handler paling awal
initProcessErrorHandlers();

// Import Koneksi Database & Middleware Auth
const db = require('./src/config/db');
const { authenticateToken } = require('./src/middleware/authMiddleware');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const commentRoutes = require('./src/routes/commentRoutes');

// Import Socket Handler
const { initSocket } = require('./src/socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Inisialisasi Socket.IO
initSocket(server);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan folder uploads secara statis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint (berguna untuk memastikan server hidup saat fresh clone)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Helpdesk API berjalan normal' });
});

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets/:id/comments', commentRoutes);

// Endpoint Statistik Dashboard (menggunakan COALESCE agar nilai default 0, bukan null)
app.get('/api/stats', authenticateToken, async (req, res, next) => {
  try {
    let query = `
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END), 0) AS open,
        COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) AS in_progress,
        COALESCE(SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END), 0) AS resolved,
        COALESCE(SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END), 0) AS closed
      FROM tickets
    `;
    const queryParams = [];

    if (req.user.role === 'employee') {
      query += ` WHERE user_id = ?`;
      queryParams.push(req.user.id);
    }

    const [rows] = await db.query(query, queryParams);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Daftarkan 404 Handler & Global Error Handler di bagian paling bawah
app.use(notFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server Helpdesk berjalan di http://localhost:${PORT}`);
});