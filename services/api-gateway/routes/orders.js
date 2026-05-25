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
    const data = await repo.findByUser(req.params.userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await repo.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    const userId = req.user.user_id;
    const issued_by = req.user.username || req.user.email;
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