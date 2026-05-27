const { Pool } = require('pg');

const pool = new Pool({
  user:     process.env.NOTIF_DB_USER     || 'novalink_user',
  host:     process.env.NOTIF_DB_HOST     || 'localhost',
  database: process.env.NOTIF_DB_NAME     || 'notifications_db',
  password: process.env.NOTIF_DB_PASSWORD || 'novalink_pass',
  port:     process.env.NOTIF_DB_PORT     || 5432,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
});
pool.on('error', (err) => console.error('[gateway] notifications-db error:', err.message));

class NotificationRepository {
  async findByUser(userId) {
    const result = await pool.query(
      `SELECT id, user_id, order_id, message, is_read AS read, created_at AS "createdAt"
       FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = NotificationRepository;