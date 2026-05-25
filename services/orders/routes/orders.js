const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getOrderById, checkout, cancelOrder, getUserOrders } = require('../controllers/ordersController');

router.post('/', verifyToken, checkout);
router.get('/user/:userId', getUserOrders);
router.get('/:id', getOrderById);
router.delete('/:id', cancelOrder);

module.exports = router;