const { subscribe, connectWithRetry } = require('./broker');
const OrderRepository = require('../repositories/orderRepository');

const repo = new OrderRepository();

async function handleInventarioConfirmado({ orderId, totalAmount }) {
  await repo.complete(orderId, totalAmount);
  console.log(`[orders] Order ${orderId} → Completada (total: ${totalAmount})`);
}

async function handleInventarioFallido({ orderId }) {
  await repo.updateStatus(orderId, 'Cancelada');
  console.log(`[orders] Order ${orderId} → Cancelada`);
}

async function startSubscribers() {
  await connectWithRetry();
  await subscribe('orders.inventario.confirmado', 'inventario.confirmado', handleInventarioConfirmado);
  await subscribe('orders.inventario.fallido', 'inventario.fallido', handleInventarioFallido);
}

module.exports = { startSubscribers };
