const express = require('express');
const cors = require('cors');
const app = express();
const port = Number(process.env.PORT) || 3004;

app.use(cors());
app.use(express.json());

const notificationsRoutes = require('./routes/notifications');
app.use('/api/v1/noti', notificationsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'Notifications Service', status: 'running', port });
});

app.get('/', (req, res) => {
  res.json({ message: 'Servicio de Notificaciones', endpoints: { notifications: '/api/v1/noti', health: '/health' } });
});

app.listen(port, async () => {
  console.log(`Servicio de Notificaciones corriendo en puerto ${port}`);
  const { startSubscribers } = require('./events/notificationSubscriber');
  try {
    await startSubscribers();
  } catch (err) {
    console.error('[app] Broker connection failed:', err.message);
    process.exit(1);
  }
});
