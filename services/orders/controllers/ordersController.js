const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'orders-db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
});

const getServiceError = (error, fallbackMessage) => {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || fallbackMessage
    };
  }

  return {
    status: 500,
    message: fallbackMessage
  };
};

const createOrdersController = (deps) => {
  const usersClient = deps.usersClient;
  const inventoryClient = deps.inventoryClient;
  const notificationsClient = deps.notificationsClient;

  const getOrderById = async (req, res) => {
    const id = req.params.id;

    try {
      const orderResult = await pool.query(
        `SELECT id, user_id, status, total_amount, created_at
         FROM orders
         WHERE id = $1`,
        [id]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      const itemsResult = await pool.query(
        `SELECT product_id AS "skillId", quantity
         FROM cart_items
         WHERE order_id = $1`,
        [id]
      );

      const order = orderResult.rows[0];

      res.status(200).json({
        success: true,
        data: {
          id: order.id,
          userId: order.user_id,
          status: order.status,
          totalAmount: order.total_amount,
          createdAt: order.created_at,
          items: itemsResult.rows
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo pedido'
      });
    }
  };

  const createOrder = async (req, res) => {
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userId y items son requeridos'
      });
    }

    for (const item of items) {
      if (!item.skillId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Cada item debe tener skillId y quantity mayor a 0'
        });
      }
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `INSERT INTO orders (user_id, status)
         VALUES ($1, $2)
         RETURNING id, user_id, status, created_at`,
        [userId, 'Pendiente']
      );

      const order = orderResult.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO cart_items (order_id, product_id, quantity)
           VALUES ($1, $2, $3)`,
          [order.id, item.skillId, item.quantity]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: {
          id: order.id,
          userId: order.user_id,
          status: order.status,
          createdAt: order.created_at,
          items: items
        },
        message: 'Pedido creado exitosamente'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error creando pedido'
      });
    } finally {
      client.release();
    }
  };

  const checkoutOrder = async (req, res) => {
    const id = req.params.id;

    try {
      const orderResult = await pool.query(
        `SELECT id, user_id, status, created_at
         FROM orders
         WHERE id = $1`,
        [id]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      const order = orderResult.rows[0];

      if (order.status !== 'Pendiente') {
        return res.status(400).json({
          success: false,
          message: 'El pedido ya fue procesado'
        });
      }

      const itemsResult = await pool.query(
        `SELECT product_id AS "skillId", quantity
         FROM cart_items
         WHERE order_id = $1`,
        [id]
      );

      await usersClient.getUserById(order.user_id);

      const checkedSkills = [];

      for (const item of itemsResult.rows) {
        const skillResponse = await inventoryClient.getSkillById(item.skillId);
        const skill = skillResponse.data.data || skillResponse.data;

        if (skill.stock < item.quantity) {
          return res.status(409).json({
            success: false,
            message: `Stock insuficiente para ${skill.name}`
          });
        }

        checkedSkills.push({
          skillId: item.skillId,
          quantity: item.quantity,
          skillName: skill.name || `skill-${item.skillId}`,
          newStock: skill.stock - item.quantity,
          xp_points: skill.xp_points || 0,
          price: skill.price || 0
        });
      }

      for (const item of checkedSkills) {
        await inventoryClient.updateSkill(item.skillId, {
          stock: item.newStock
        });
      }

      for (const item of checkedSkills) {
        await usersClient.addSkillToUser(order.user_id, {
          skillId: item.skillId,
          xp: item.quantity * item.xp_points
        });
      }

      const totalAmount = checkedSkills.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const updatedOrderResult = await pool.query(
        `UPDATE orders
         SET status = $1, total_amount = $2
         WHERE id = $3
         RETURNING id, user_id, status, total_amount, created_at`,
        ['Completada', totalAmount, id]
      );

      await notificationsClient.createNotification({
        userId: order.user_id,
        orderId: id,
        message: `Tu pedido ${id} ha sido completado exitosamente`
      });

      const updatedOrder = updatedOrderResult.rows[0];

      res.status(200).json({
        success: true,
        data: {
          id: updatedOrder.id,
          userId: updatedOrder.user_id,
          status: updatedOrder.status,
          createdAt: updatedOrder.created_at,
          items: itemsResult.rows
        },
        message: 'Pedido completado exitosamente'
      });
    } catch (error) {
      const serviceError = getServiceError(error, 'Error interno del servidor');
      console.error('Error procesando pedido:', serviceError.message);
      if (error.response?.data) {
        console.error('Detalle servicio externo:', error.response.data);
      } else {
        console.error(error);
      }

      return res.status(serviceError.status).json({
        success: false,
        message: serviceError.message
      });
    }
  };

  const cancelOrder = async (req, res) => {
    const id = req.params.id;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        'DELETE FROM cart_items WHERE order_id = $1',
        [id]
      );

      const result = await client.query(
        'DELETE FROM orders WHERE id = $1',
        [id]
      );

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      await client.query('COMMIT');
      res.status(204).send();
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando pedido'
      });
    } finally {
      client.release();
    }
  };

  const getUserOrders = async (req, res) => {
    const userId = req.params.userId;

    try {
      const ordersResult = await pool.query(
        `SELECT id, user_id, status, total_amount, created_at
         FROM orders
         WHERE user_id = $1
         ORDER BY created_at ASC`,
        [userId]
      );

      const orders = [];

      for (const order of ordersResult.rows) {
        const itemsResult = await pool.query(
          `SELECT product_id AS "skillId", quantity
           FROM cart_items
           WHERE order_id = $1`,
          [order.id]
        );

        orders.push({
          id: order.id,
          userId: order.user_id,
          status: order.status,
          totalAmount: order.total_amount,
          createdAt: order.created_at,
          items: itemsResult.rows
        });
      }

      res.status(200).json({
        success: true,
        data: orders,
        message: `Pedidos del usuario ${userId}`
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo pedidos del usuario'
      });
    }
  };

  return {
    getOrderById,
    createOrder,
    checkoutOrder,
    cancelOrder,
    getUserOrders
  };
};

module.exports = createOrdersController;