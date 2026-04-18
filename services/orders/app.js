const express = require('express');
const app = express();
const port = Number(process.env.PORT) || 3003;

app.use(express.json());

const ordersRoutes = require('./routes/orders');
app.use('/api/v1/orders', ordersRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Orders Service',
    status: 'running',
    port: port
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Servicio de Pedidos',
    endpoints: {
      orders: '/api/v1/orders',
      health: '/health'
    }
  });
});

app.listen(port, () => {
  console.log(`Servicio de Pedidos corriendo en puerto ${port}`);
});