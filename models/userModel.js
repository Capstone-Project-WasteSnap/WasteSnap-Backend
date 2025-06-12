const pool = require('../config/db');

const User = {
  async create({ name, email, password, address = null, phone = null }) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, address, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, address, phone]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    return rows[0];
  },
  async update(id, { name, email, address, phone }) {
    try {
      const [result] = await pool.query(
        `UPDATE users 
         SET name = ?, email = ?, address = ?, phone = ?
         WHERE id = ?`,
        [name, email, address, phone, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('User tidak ditemukan');
      }
      
      // Ambil data terbaru tanpa kolom updated_at
      const [updatedUser] = await pool.query(
        'SELECT id, name, email, address, phone FROM users WHERE id = ?',
        [id]
      );
      
      return updatedUser[0];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, email, address, phone, created_at 
       FROM users WHERE id = ?`, 
      [id]
    );
    return rows[0];
  }
};

module.exports = User;