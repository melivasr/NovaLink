const express = require('express');
const cors = require('cors');
const app = express();
const port = Number(process.env.PORT) || 3002;
const { register, httpRequestDuration, httpRequestsTotal } = require('./metrics');

app.use(cors());
app.use(express.json());

// HTTP duration middleware — must be before routes
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const route = (req.route ? req.route.path : req.path).replace(/\/\d+/g, '/:id');
    const labels = { method: req.method, route, status_code: String(res.statusCode) };
    httpRequestDuration.labels(labels).observe((Date.now() - start) / 1000);
    httpRequestsTotal.labels(labels).inc();
  });
  next();
});

const inventoryRoutes = require('./routes/inventory');
app.use('/api/v1/inventory', inventoryRoutes);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'Inventory Service', status: 'running', port });
});

app.get('/', (req, res) => {
  res.json({ message: 'Servicio de Inventario', endpoints: { inventory: '/api/v1/inventory', health: '/health' } });
});

app.listen(port, async () => {
  console.log(`Servicio de Inventario corriendo en puerto ${port}`);
  const { startSubscribers } = require('./services/inventorySubscriber');
  try {
    await startSubscribers();
  } catch (err) {
    console.error('[app] Broker connection failed:', err.message);
    process.exit(1);
  }
});
