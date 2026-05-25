const OrderRepository = require('../repositories/orderRepository');
const { publish } = require('../events/broker');
const { v4: uuidv4 } = require('uuid');
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

const checkout = async (userId, items, tokenUser = {}) => {
  if (!items || !Array.isArray(items) || items.length === 0)
    throw { status: 400, message: 'items es requerido' };
  for (const item of items) {
    if (!item.skillId || !item.quantity || item.quantity < 1)
      throw { status: 400, message: 'Cada item debe tener skillId y quantity mayor a 0' };
  }

  const orderId = uuidv4();
  await publish('orden.creada', {
    orderId,
    userId,
    issued_by: tokenUser.issued_by || 'auth-service',
    items,
    timestamp: new Date().toISOString()
  });

  return { id: orderId, status: 'Procesando', message: 'Pedido en procesamiento asíncrono' };
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

module.exports = { getOrderById, getUserOrders, checkout, cancelOrder };