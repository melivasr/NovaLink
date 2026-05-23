const express = require('express');
const router = express.Router();
const axios = require('axios');

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3005';

router.post('/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_URL}/api/v1/auth/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { error: 'Error en autenticación' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_URL}/api/v1/auth/verify`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { error: 'Error verificando token' });
  }
});

module.exports = router;