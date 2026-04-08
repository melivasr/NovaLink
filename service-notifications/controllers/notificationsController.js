const db = require('../data/db');

const createNotification = (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({
      success: false,
      message: 'userId y message son requeridos'
    });
  }

  const newNotification = db.addNotification({ userId, message });

  console.log(`Notificación enviada a usuario ${userId}: ${message}`);

  res.status(201).json({
    success: true,
    data: newNotification,
    message: 'Notificación creada exitosamente'
  });
};

const getUserNotifications = (req, res) => {
  const userId = req.params.userId;
  const notifications = db.getUserNotifications(userId);

  res.status(200).json({
    success: true,
    data: notifications,
    message: `Notificaciones del usuario ${userId}`
  });
};

const markAsRead = (req, res) => {
  const id = req.params.id;
  const notification = db.markAsRead(id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notificación no encontrada'
    });
  }

  res.status(200).json({
    success: true,
    data: notification,
    message: 'Notificación marcada como leída'
  });
};

const deleteNotification = (req, res) => {
  const id = req.params.id;
  const deleted = db.deleteNotification(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Notificación no encontrada'
    });
  }

  res.status(204).send();
};

module.exports = {createNotification, getUserNotifications,
  markAsRead, deleteNotification
};