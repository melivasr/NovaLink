const { subscribe, connectWithRetry } = require('./broker');
const NotificationService = require('../services/notificationService');

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

async function startSubscribers() {
  await connectWithRetry();
  await subscribe('notifications.inventario.confirmado', 'inventario.confirmado', handleInventarioConfirmado);
  await subscribe('notifications.inventario.fallido', 'inventario.fallido', handleInventarioFallido);
}

module.exports = { startSubscribers };
