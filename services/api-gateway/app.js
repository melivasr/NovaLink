const express = require('express');
const cors = require('cors');
const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/orders',        require('./routes/orders'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/v1/auth',       require('./routes/auth'));

app.get('/health', (req, res) => {
  res.json({ service: 'API Gateway', status: 'running', port });
});

app.listen(port, () => {
  console.log(`[gateway] API Gateway corriendo en puerto ${port}`);
});