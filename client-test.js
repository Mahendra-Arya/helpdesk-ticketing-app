// Jalankan dengan: node client-test.js
const { io } = require('socket.io-client');

// Salin JWT Token dari hasil Login di Postman
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzkxMTk2NTQzLCJleHAiOjE3OTEyODI5NDN9.Zs_OykkH_xPt51WKJ6lK1kkTDHbG9e5ti-iKScmRH-I';
const EMPLOYEE_TOKEN = 'TOKEN_JWT_EMPLOYEE_DARI_POSTMAN';

// Client 1: Socket Admin
const adminSocket = io('http://localhost:3000', {
  auth: { token: ADMIN_TOKEN }
});

adminSocket.on('connect', () => console.log('✅ Admin berhasil terkoneksi ke Socket.IO'));
adminSocket.on('ticket:created', (data) => console.log('🔔 [ADMIN EVENT] Tiket Baru Dibuat:', data));
adminSocket.on('ticket:updated', (data) => console.log('🔔 [ADMIN EVENT] Status Tiket Diupdate:', data));
adminSocket.on('comment:created', (data) => console.log('🔔 [ADMIN EVENT] Komentar Baru:', data));

// Client 2: Socket Employee
const employeeSocket = io('http://localhost:3000', {
  auth: { token: EMPLOYEE_TOKEN }
});

employeeSocket.on('connect', () => console.log('✅ Employee berhasil terkoneksi ke Socket.IO'));
employeeSocket.on('ticket:updated', (data) => console.log('📩 [EMPLOYEE EVENT] Tiket Anda Diupdate:', data));
employeeSocket.on('comment:created', (data) => console.log('📩 [EMPLOYEE EVENT] Ada Komentar Baru:', data));