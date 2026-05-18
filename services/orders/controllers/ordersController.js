const orderService = require('../services/orderService');

const handleError = (res, error) => {
  const status = error.status || 500;
  res.status(status).json({ success: false, message: error.message || 'Error interno del servidor' });
};

const getOrderById = async (req, res) => {
  try {
    const data = await orderService.getOrderById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { handleError(res, error); }
};

const createOrder = async (req, res) => {
  try {
    const data = await orderService.createOrder(req.user.user_id, req.body.items);
    res.status(201).json({ success: true, data, message: 'Pedido creado exitosamente' });
  } catch (error) { handleError(res, error); }
};

const checkoutOrder = async (req, res) => {
  try {
    const data = await orderService.checkoutOrder(req.params.id, req.user);
    res.status(202).json({ success: true, data, message: data.message });
  } catch (error) { handleError(res, error); }
};

const cancelOrder = async (req, res) => {
  try {
    await orderService.cancelOrder(req.params.id);
    res.status(204).send();
  } catch (error) { handleError(res, error); }
};

const getUserOrders = async (req, res) => {
  try {
    const data = await orderService.getUserOrders(req.params.userId);
    res.status(200).json({ success: true, data, message: `Pedidos del usuario ${req.params.userId}` });
  } catch (error) { handleError(res, error); }
};

module.exports = { getOrderById, createOrder, checkoutOrder, cancelOrder, getUserOrders };
