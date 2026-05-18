const OrderRepository = require('../repositories/orderRepository');
const { publish } = require('../events/broker');

const repo = new OrderRepository();

const getOrderById = async (id) => {
  const order = await repo.findById(id);
  if (!order) throw { status: 404, message: 'Pedido no encontrado' };
  return _format(order);
};

const getUserOrders = async (userId) => {
  const orders = await repo.findByUser(userId);
  return orders.map(_format);
};

const createOrder = async (userId, items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: 'items es requerido' };
  }
  for (const item of items) {
    if (!item.skillId || !item.quantity || item.quantity < 1) {
      throw { status: 400, message: 'Cada item debe tener skillId y quantity mayor a 0' };
    }
  }
  const order = await repo.create(userId, items);
  return _format({ ...order, items });
};

const checkoutOrder = async (id, tokenUser = {}) => {
  const order = await repo.findById(id);
  if (!order) throw { status: 404, message: 'Pedido no encontrado' };
  if (order.status !== 'Pendiente') throw { status: 400, message: 'El pedido ya fue procesado' };

  await repo.updateStatus(id, 'Procesando');

  await publish('pedido.creado', {
    orderId: order.id,
    userId: order.user_id,
    issued_by: tokenUser.issued_by || 'auth-service',
    items: order.items,
    timestamp: new Date().toISOString()
  });

  return { id: order.id, status: 'Procesando', message: 'Pedido en procesamiento asíncrono' };
};

const cancelOrder = async (id) => {
  const deleted = await repo.delete(id);
  if (!deleted) throw { status: 404, message: 'Pedido no encontrado' };
};

const _format = (order) => ({
  id: order.id,
  userId: order.user_id,
  status: order.status,
  totalAmount: order.total_amount,
  createdAt: order.created_at,
  items: order.items || []
});

module.exports = { getOrderById, getUserOrders, createOrder, checkoutOrder, cancelOrder };
