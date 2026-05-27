const { Pool } = require('pg');

const pool = new Pool({
  user:     process.env.ORDERS_DB_USER     || 'novalink_user',
  host:     process.env.ORDERS_DB_HOST     || 'localhost',
  database: process.env.ORDERS_DB_NAME     || 'orders_db',
  password: process.env.ORDERS_DB_PASSWORD || 'novalink_pass',
  port:     process.env.ORDERS_DB_PORT     || 5432,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
});
pool.on('error', (err) => console.error('[gateway] orders-db error:', err.message));

class OrderRepository {
  async findById(id) {
    const orderResult = await pool.query(
      `SELECT id, user_id, status, total_amount AS "totalAmount", created_at AS "createdAt" FROM orders WHERE id = $1`,
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
      `SELECT id, user_id, status, total_amount AS "totalAmount", created_at AS "createdAt" FROM orders WHERE user_id = $1 ORDER BY created_at ASC`,
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
}

module.exports = OrderRepository;