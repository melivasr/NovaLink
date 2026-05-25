const { subscribe, connectWithRetry } = require('./broker');
const { publish } = require('./broker');
const OrderRepository = require('../repositories/orderRepository');
const repo = new OrderRepository();

async function handleOrdenCreada({ orderId, userId, issued_by, items, timestamp }) {
  await repo.createWithId(orderId, userId, items);
  console.log(`[orders] Order ${orderId} → creada en DB como Procesando`);

  await publish('pedido.creado', {
    orderId,
    userId,
    issued_by: issued_by || 'auth-service',
    items,
    timestamp
  });
  console.log(`[orders] Published pedido.creado para ${orderId}`);
}

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
  await subscribe('orders.orden.creada', 'orden.creada', handleOrdenCreada);
  await subscribe('orders.inventario.confirmado', 'inventario.confirmado', handleInventarioConfirmado);
  await subscribe('orders.inventario.fallido', 'inventario.fallido', handleInventarioFallido);
}

module.exports = { startSubscribers };