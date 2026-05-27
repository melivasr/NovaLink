const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const { publish } = require('../events/broker');
const UserRepository = require('../repositories/userRepository');
const { verifyToken, requireAdmin } = require('../middleware/verifyToken');
const repo = new UserRepository();

// GET all — solo admin
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const data = await repo.findAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET by id — autenticado
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const data = await repo.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET skills — autenticado
router.get('/:id/skills', verifyToken, async (req, res) => {
  try {
    const user = await repo.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    const data = await repo.findSkills(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST — público (registro)
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

// PUT — autenticado
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const passwordHash = password ? await bcryptjs.hash(password, 10) : undefined;
    await publish('usuario.actualizado', { userId: req.params.id, name, email, passwordHash, timestamp: new Date().toISOString() });
    res.status(202).json({ message: 'Actualización en proceso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — solo admin
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await publish('usuario.eliminado', { userId: req.params.id, timestamp: new Date().toISOString() });
    res.status(202).json({ message: 'Eliminación en proceso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;