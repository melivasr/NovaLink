const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'orders-db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
});

const createNotification = async (req, res) => {
  const { userId, orderId, message } = req.body;

  if (!userId || !orderId || !message) {
    return res.status(400).json({
      success: false,
      message: 'userId, orderId y message son requeridos'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, order_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, order_id, message, is_read, created_at`,
      [userId, orderId, message]
    );

    console.log(`Notificación enviada a usuario ${userId}: ${message}`);

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        userId: result.rows[0].user_id,
        orderId: result.rows[0].order_id,
        message: result.rows[0].message,
        read: result.rows[0].is_read,
        createdAt: result.rows[0].created_at
      },
      message: 'Notificación creada exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creando notificación'
    });
  }
};

const getUserNotifications = async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query(
      `SELECT id, user_id, order_id, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const notifications = result.rows.map(item => ({
      id: item.id,
      userId: item.user_id,
      orderId: item.order_id,
      message: item.message,
      read: item.is_read,
      createdAt: item.created_at
    }));

    res.status(200).json({
      success: true,
      data: notifications,
      message: `Notificaciones del usuario ${userId}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo notificaciones'
    });
  }
};

const markAsRead = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1
       RETURNING id, user_id, order_id, message, is_read, created_at`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    const notification = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: notification.id,
        userId: notification.user_id,
        orderId: notification.order_id,
        message: notification.message,
        read: notification.is_read,
        createdAt: notification.created_at
      },
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando notificación'
    });
  }
};

const deleteNotification = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando notificación'
    });
  }
};

module.exports = {createNotification, getUserNotifications,
  markAsRead, deleteNotification
};