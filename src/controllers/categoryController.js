const db = require('../config/db');
const { sanitizeText } = require('../utils/sanitizer');

exports.getCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const cleanName = sanitizeText(req.body.name, 100);
    const cleanDesc = req.body.description ? sanitizeText(req.body.description, 255) : null;

    if (!cleanName) return res.status(400).json({ message: 'Nama kategori wajib diisi' });

    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [cleanName, cleanDesc]
    );
    res.status(201).json({
      message: 'Kategori berhasil dibuat',
      data: { id: result.insertId, name: cleanName, description: cleanDesc }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanName = sanitizeText(req.body.name, 100);
    const cleanDesc = req.body.description ? sanitizeText(req.body.description, 255) : null;

    if (!cleanName) return res.status(400).json({ message: 'Nama kategori wajib diisi' });

    const [result] = await db.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [cleanName, cleanDesc, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

    res.json({ message: 'Kategori berhasil diperbarui' });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};