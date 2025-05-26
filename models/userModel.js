const pool = require('../config/db');

const User = {
  // Buat user baru (address dan phone opsional)
  async create({ name, email, password, address = null, phone = null }) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, address, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, address, phone]
    );
    return result.insertId;
  },

  // Cari user by email (untuk login)
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    return rows[0];
  },

  // Cari user by ID (untuk profil)
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