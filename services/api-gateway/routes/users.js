const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const { publish } = require('../events/broker');
const UserRepository = require('../repositories/userRepository');

const repo = new UserRepository();

// GET — directo al repo
router.get('/', async (req, res) => {
  try {
    const data = await repo.findAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await repo.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/skills', async (req, res) => {
  try {
    const user = await repo.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    const data = await repo.findSkills(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST — publica al broker
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y password son requeridos' });
    }
    const passwordHash = await bcryptjs.hash(password, 10);
    await publish('usuario.registrado', { name, email, passwordHash, timestamp: new Date().toISOString() });
    res.status(202).json({ message: 'Registro en proceso, tu cuenta estará lista en breve.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — publica al broker
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const passwordHash = password ? await bcryptjs.hash(password, 10) : undefined;
    await publish('usuario.actualizado', { userId: req.params.id, name, email, passwordHash, timestamp: new Date().toISOString() });
    res.status(202).json({ message: 'Actualización en proceso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — publica al broker
router.delete('/:id', async (req, res) => {
  try {
    await publish('usuario.eliminado', { userId: req.params.id, timestamp: new Date().toISOString() });
    res.status(202).json({ message: 'Eliminación en proceso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;