const initProcessErrorHandlers = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.name, err.message, err.stack);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    code: 404,
    message: `Endpoint API tidak ditemukan: ${req.method} ${req.originalUrl}`
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error('Server Error Catch:', err.stack || err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan internal server';

  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Operasi gagal: Kategori atau data relasi terkait tidak valid/sedang digunakan.';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'Data duplikat terdeteksi di database.';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Koneksi ke database terputus. Silakan coba beberapa saat lagi.';
  } else if (err.name === 'MulterError' || message.includes('Format file tidak didukung')) {
    statusCode = 400;
    message = `Gagal mengunggah file: ${err.message}`;
  }

  res.status(statusCode).json({
    code: statusCode,
    message
  });
};

module.exports = {
  initProcessErrorHandlers,
  notFoundHandler,
  globalErrorHandler
};