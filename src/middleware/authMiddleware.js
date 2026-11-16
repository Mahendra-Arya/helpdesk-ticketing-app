const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token akses tidak ditemukan. Silakan login ulang.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Akses ditolak: Sesi pengguna tidak memiliki role.' });
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRole = req.user.role.toLowerCase();
    const normalizedAllowedRoles = rolesArray.map(r => r.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Akses ditolak: Hak akses tidak mencukupi.' });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRole };