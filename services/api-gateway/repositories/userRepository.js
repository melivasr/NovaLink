const { Pool } = require('pg');

const pool = new Pool({
  user:     process.env.USERS_DB_USER     || 'novalink_user',
  host:     process.env.USERS_DB_HOST     || 'localhost',
  database: process.env.USERS_DB_NAME     || 'users_db',
  password: process.env.USERS_DB_PASSWORD || 'novalink_pass',
  port:     process.env.USERS_DB_PORT     || 5432
});

class UserRepository {
  async findAll() {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at ASC'
    );
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByIdFull(id) {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findSkills(userId) {
    const result = await pool.query(
      `SELECT product_id, xp_accumulated, acquired_at
       FROM user_skills WHERE user_id = $1 ORDER BY acquired_at ASC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = UserRepository;