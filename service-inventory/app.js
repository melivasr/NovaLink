const express = require('express');
const app = express();
const port = 3002;

app.use(express.json());

const inventoryRoutes = require('./routes/inventory');
app.use('/api/v1/inventory', inventoryRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Inventory Service',
    status: 'running',
    port: port
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Servicio de Inventario',
    endpoints: {
      inventory: '/api/v1/inventory',
      health: '/health'
    }
  });
});

app.listen(port, () => {
  console.log(`Servicio de Inventario corriendo en puerto ${port}`);
});