const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const { publish } = require('../events/broker');
const UserRepository = require('../repositories/userRepository');

const repo = new UserRepository();

// GET — directo al repo
router.get('/', async (req, res) => {
  try {
    const users = await repo.findAll();
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await repo.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/skills', async (req, res) => {
  try {
    const user = await repo.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const skills = await repo.findSkills(req.params.id);
    res.json({ user, skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
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