const { subscribe, connectWithRetry } = require('../events/broker');
const NotificationService = require('./notificationService');

const service = new NotificationService();

async function handleInventarioConfirmado({ orderId, userId }) {
  await service.createNotification({
    userId,
    orderId,
    message: '¡Tu pedido fue procesado! Las habilidades han sido añadidas a tu perfil.'
  });
}

async function handleInventarioFallido({ orderId, userId, reason }) {
  await service.createNotification({
    userId,
    orderId: orderId || null,
    message: `Tu pedido no pudo ser procesado: ${reason}`
  });
}

async function handleNotificacionCreada({ userId, message, orderId }) {
  await service.createNotification({ userId, orderId: orderId || null, message });
  console.log(`[notifications] Notificación creada para usuario ${userId}`);
}

async function handleNotificacionLeida({ notificationId }) {
  await service.markAsRead(notificationId);
  console.log(`[notifications] Notificación ${notificationId} → marcada como leída`);
}

async function handleNotificacionEliminada({ notificationId }) {
  await service.deleteNotification(notificationId);
  console.log(`[notifications] Notificación ${notificationId} → eliminada`);
}

async function startSubscribers() {
  await connectWithRetry();
  await subscribe('notifications.inventario.confirmado', 'inventario.confirmado', handleInventarioConfirmado);
  await subscribe('notifications.inventario.fallido', 'inventario.fallido', handleInventarioFallido);
  await subscribe('notifications.notificacion.creada', 'notificacion.creada', handleNotificacionCreada);
  await subscribe('notifications.notificacion.leida', 'notificacion.leida', handleNotificacionLeida);
  await subscribe('notifications.notificacion.eliminada', 'notificacion.eliminada', handleNotificacionEliminada);
}

module.exports = { startSubscribers };
