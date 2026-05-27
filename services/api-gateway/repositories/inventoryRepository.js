const { Pool } = require('pg');

const pool = new Pool({
  user:     process.env.PRODUCTS_DB_USER     || 'novalink_user',
  host:     process.env.PRODUCTS_DB_HOST     || 'localhost',
  database: process.env.PRODUCTS_DB_NAME     || 'products_db',
  password: process.env.PRODUCTS_DB_PASSWORD || 'novalink_pass',
  port:     process.env.PRODUCTS_DB_PORT     || 5432,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
});
pool.on('error', (err) => console.error('[gateway] products-db error:', err.message));

class InventoryRepository {
  async findAll() {
    const result = await pool.query(
      'SELECT id, name, difficulty, xp_points, price, stock, is_activated, created_at FROM products ORDER BY created_at ASC'
    );
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, difficulty, xp_points, price, stock, is_activated, created_at FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = InventoryRepository;