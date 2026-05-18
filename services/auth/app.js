const express = require('express');
const cors = require('cors');
const app = express();
const port = Number(process.env.PORT) || 3005;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        service: 'Auth Service',
        status: 'running',
        port: port
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Servicio de Autenticación',
        endpoints: {
        login: '/api/v1/auth/login',
        health: '/health'
        }
    });
});

app.listen(port, () => {
    console.log(`Servicio de Autenticación corriendo en puerto ${port}`);
});// test precommit
