const express = require('express');
const router = express.Router();
const { publish } = require('../events/broker');
const NotificationRepository = require('../repositories/notificationRepository');

const repo = new NotificationRepository();

// GET — directo al repo
router.get('/user/:userId', async (req, res) => {
  try {
    const data = await repo.findByUser(req.params.userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST — publica al broker
router.post('/', async (req, res) => {
  try {
    const { userId, message, orderId } = req.body;
    await publish('notificacion.creada', { userId, message, orderId, timestamp: new Date().toISOString() });
    res.status(202).json({ message: 'Notificación en proceso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — publica al broker
router.put('/:id/read', async (req, res) => {
  try {
    await publish('notificacion.leida', { notificationId: req.params.id, timestamp: new Date().toISOString() });
    res.status(202).json({ message: 'Marcado en proceso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — publica al broker
router.delete('/:id', async (req, res) => {
  try {
    await publish('notificacion.eliminada', { notificationId: req.params.id, timestamp: new Date().toISOString() });
    res.status(202).json({ message: 'Eliminación en proceso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;