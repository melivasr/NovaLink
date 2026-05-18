const express = require('express');
const cors = require('cors');
const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

const usersRoutes = require('./routes/users');
app.use('/api/v1/users', usersRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'Users Service', status: 'running', port });
});

app.get('/', (req, res) => {
  res.json({ message: 'Servicio de Usuarios', endpoints: { users: '/api/v1/users', health: '/health' } });
});

app.listen(port, async () => {
  console.log(`Servicio de Usuarios corriendo en puerto ${port}`);
  const { startSubscribers } = require('./events/userSubscriber');
  await startSubscribers();
});
