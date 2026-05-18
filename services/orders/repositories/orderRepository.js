const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'orders-db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
});

class OrderRepository {
  async findById(id) {
    const orderResult = await pool.query(
      'SELECT id, user_id, status, total_amount, created_at FROM orders WHERE id = $1',
      [id]
    );
    if (orderResult.rows.length === 0) return null;

    const itemsResult = await pool.query(
      'SELECT product_id AS "skillId", quantity FROM cart_items WHERE order_id = $1',
      [id]
    );
    return { ...orderResult.rows[0], items: itemsResult.rows };
  }

  async findByUser(userId) {
    const ordersResult = await pool.query(
      'SELECT id, user_id, status, total_amount, created_at FROM orders WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    const orders = [];
    for (const order of ordersResult.rows) {
      const itemsResult = await pool.query(
        'SELECT product_id AS "skillId", quantity FROM cart_items WHERE order_id = $1',
        [order.id]
      );
      orders.push({ ...order, items: itemsResult.rows });
    }
    return orders;
  }

  async create(userId, items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, status) VALUES ($1, $2)
         RETURNING id, user_id, status, created_at`,
        [userId, 'Pendiente']
      );
      const order = orderResult.rows[0];
      for (const item of items) {
        await client.query(
          'INSERT INTO cart_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
          [order.id, item.skillId, item.quantity]
        );
      }
      await client.query('COMMIT');
      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, user_id, status, total_amount, created_at',
      [status, id]
    );
    return result.rows[0] || null;
  }

  async complete(id, totalAmount) {
    const result = await pool.query(
      `UPDATE orders SET status = $1, total_amount = $2 WHERE id = $3
       RETURNING id, user_id, status, total_amount, created_at`,
      ['Completada', totalAmount, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM cart_items WHERE order_id = $1', [id]);
      const result = await client.query('DELETE FROM orders WHERE id = $1', [id]);
      await client.query('COMMIT');
      return result.rowCount > 0;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = OrderRepository;
