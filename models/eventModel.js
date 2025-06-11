const pool = require('../config/db');

const Event = {
  async create({ title, description, event_date, location_address, user_id }) {
    const [result] = await pool.query(
      `INSERT INTO events (title, description, event_date, location_address, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, event_date, location_address, user_id]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT e.*, u.name as organizer_name, u.email as organizer_email, u.phone as organizer_phone
       FROM events e
       JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findAll() {
    const [rows] = await pool.query(
      `SELECT e.*, u.name as organizer_name 
       FROM events e
       JOIN users u ON e.user_id = u.id
       ORDER BY e.event_date DESC`
    );
    return rows;
  },

  async search(keyword) {
    const [rows] = await pool.query(
      `SELECT e.*, u.name as organizer_name 
       FROM events e
       JOIN users u ON e.user_id = u.id
       WHERE e.title LIKE ? OR e.description LIKE ? OR e.location_address LIKE ?
       ORDER BY e.event_date DESC`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return rows;
  }
};

module.exports = Event;