const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Koneksi ditolak: Token tidak ditemukan'));
    }

    jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY', (err, user) => {
      if (err) return next(new Error('Koneksi ditolak: Token tidak valid'));
      socket.user = user;
      next();
    });
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;

    if (role && role.toLowerCase() === 'admin') {
      socket.join('admins');
    }

    socket.join(`user:${id}`);
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io belum diinisialisasi!');
  }
  return io;
};

module.exports = { initSocket, getIO };