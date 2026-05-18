const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'products-db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
});

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

  async create({ name, difficulty, xp_points, price, stock }) {
    const result = await pool.query(
      'INSERT INTO products (name, difficulty, xp_points, price, stock, is_activated) VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *',
      [name, difficulty, xp_points, price, stock]
    );
    return result.rows[0];
  }

  async update(id, { name, difficulty, xp_points, stock, is_activated }) {
    const result = await pool.query(
      `UPDATE products SET name = $1, difficulty = $2, xp_points = $3, stock = $4, is_activated = $5
       WHERE id = $6 RETURNING *`,
      [name, difficulty, xp_points, stock, is_activated, id]
    );
    return result.rows[0] || null;
  }

  async updateStock(id, newStock) {
    const result = await pool.query(
      'UPDATE products SET stock = $1 WHERE id = $2 RETURNING *',
      [newStock, id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = InventoryRepository;
