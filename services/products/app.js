const express = require('express');
const cors = require('cors');
const app = express();
const port = Number(process.env.PORT) || 3002;

app.use(cors());
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