const express = require('express');
const cors = require('cors');
const app = express();
const port = Number(process.env.PORT) || 3003;
const { register, httpRequestDuration, httpRequestsTotal } = require('./metrics');

app.use(cors());
app.use(express.json());

// HTTP duration middleware - must be before routes
app.use((req, res, next) => {
  if (req.path === '/metrics' || req.path === '/health') return next();
  const start = Date.now();
  res.on('finish', () => {
    const route = (req.route ? req.route.path : req.path).replace(/\/\d+/g, '/:id');
    const labels = { method: req.method, route, status_code: String(res.statusCode) };
    httpRequestDuration.labels(labels).observe((Date.now() - start) / 1000);
    httpRequestsTotal.labels(labels).inc();
  });
  next();
});

const ordersRoutes = require('./routes/orders');
app.use('/api/v1/orders', ordersRoutes);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'Orders Service', status: 'running', port });
});

app.get('/', (req, res) => {
  res.json({ message: 'Servicio de Pedidos', endpoints: { orders: '/api/v1/orders', health: '/health' } });
});

app.listen(port, async () => {
  console.log(`Servicio de Pedidos corriendo en puerto ${port}`);
  const { startSubscribers } = require('./services/orderSubscriber');
  try {
    await startSubscribers();
  } catch (err) {
    console.error('[app] Broker connection failed:', err.message);
    process.exit(1);
  }
});
