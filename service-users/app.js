const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

const usersRoutes = require('./routes/users');
app.use('/api/v1/users', usersRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Users Service',
    status: 'running',
    port: port
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Servicio de Usuarios',
    endpoints: {
      users: '/api/v1/users',
      health: '/health'
    }
  });
});

app.listen(port, () => {
  console.log(`Servicio de Usuarios corriendo en puerto ${port}`);
});