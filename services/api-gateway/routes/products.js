const express = require('express');
const router = express.Router();
const { publish } = require('../events/broker');
const InventoryRepository = require('../repositories/inventoryRepository');

const repo = new InventoryRepository();

// GET — directo al repo
router.get('/', async (req, res) => {
  try {
    const products = await repo.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await repo.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — publica al broker
router.put('/:id', async (req, res) => {
  try {
    await publish('producto.actualizado', { productId: req.params.id, ...req.body, timestamp: new Date().toISOString() });
    res.status(202).json({ message: 'Actualización en proceso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
