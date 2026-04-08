const express = require('express');
const app = express();
const port = 3004;

app.use(express.json());

const notificationsRoutes = require('./routes/notifications');
app.use('/api/v1/noti', notificationsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Notifications Service',
    status: 'running',
    port: port
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Servicio de Notificaciones',
    endpoints: {
      notifications: '/api/v1/noti',
      health: '/health'
    }
  });
});

app.listen(port, () => {
  console.log(`Servicio de Notificaciones corriendo en puerto ${port}`);
});