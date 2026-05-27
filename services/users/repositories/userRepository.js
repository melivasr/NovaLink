const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'users-db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
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

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, is_admin FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async create({ name, email, passwordHash }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );
    return result.rows[0];
  }

  async update(id, { name, email, passwordHash }) {
    const result = await pool.query(
      `UPDATE users SET name = $1, email = $2, password_hash = $3
       WHERE id = $4
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash, id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    await pool.query('DELETE FROM user_skills WHERE user_id = $1', [id]);
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async findSkills(userId) {
    const result = await pool.query(
      `SELECT product_id, xp_accumulated, acquired_at
       FROM user_skills WHERE user_id = $1 ORDER BY acquired_at ASC`,
      [userId]
    );
    return result.rows;
  }

  async upsertSkill(userId, skillId, xp) {
    await pool.query(
      `INSERT INTO user_skills (user_id, product_id, xp_accumulated)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET xp_accumulated = user_skills.xp_accumulated + EXCLUDED.xp_accumulated`,
      [userId, skillId, xp]
    );
  }

  async removeSkill(userId, skillId) {
    const result = await pool.query(
      'DELETE FROM user_skills WHERE user_id = $1 AND product_id = $2',
      [userId, skillId]
    );
    return result.rowCount > 0;
  }
}

module.exports = UserRepository;
