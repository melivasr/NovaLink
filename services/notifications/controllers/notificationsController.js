const NotificationService = require('../services/notificationService');

const service = new NotificationService();

const handleError = (res, error) => {
  const status = error.status || 500;
  res.status(status).json({ success: false, message: error.message || 'Error interno del servidor' });
};

const createNotification = async (req, res) => {
  try {
    const data = await service.createNotification(req.body);
    res.status(201).json({ success: true, data, message: 'Notificación creada exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const data = await service.getUserNotifications(req.params.userId);
    res.status(200).json({ success: true, data, message: `Notificaciones del usuario ${req.params.userId}` });
  } catch (error) {
    handleError(res, error);
  }
};

const markAsRead = async (req, res) => {
  try {
    const data = await service.markAsRead(req.params.id);
    res.status(200).json({ success: true, data, message: 'Notificación marcada como leída' });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteNotification = async (req, res) => {
  try {
    await service.deleteNotification(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { createNotification, getUserNotifications, markAsRead, deleteNotification };
