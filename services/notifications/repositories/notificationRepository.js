const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'notifications-db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
});

class NotificationRepository {
  async create({ userId, orderId, message }) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, order_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, order_id, message, is_read, created_at`,
      [userId, orderId || null, message]
    );
    return result.rows[0];
  }

  async findByUser(userId) {
    const result = await pool.query(
      `SELECT id, user_id, order_id, message, is_read, created_at
       FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async markAsRead(id) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1
       RETURNING id, user_id, order_id, message, is_read, created_at`,
      [id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = NotificationRepository;
