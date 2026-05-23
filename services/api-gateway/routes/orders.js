const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { publish } = require('../events/broker');
const OrderRepository = require('../repositories/orderRepository');
const verifyToken = require('../middleware/verifyToken');

const repo = new OrderRepository();

// GET — directo al repo
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await repo.findByUser(req.params.userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await repo.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — publica al broker
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Se requieren items para la orden' });
    }
    const orderId = uuidv4();
    const userId = req.user.id;
    const issued_by = req.user.name || req.user.email;
    await publish('orden.creada', { orderId, userId, issued_by, items, timestamp: new Date().toISOString() });
    res.status(202).json({ id: orderId, status: 'Procesando', message: 'Pedido en procesamiento asíncrono' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — publica al broker
router.delete('/:id', async (req, res) => {
  try {
    await publish('orden.cancelada', { orderId: req.params.id });
    res.status(202).json({ message: 'Cancelación en proceso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;