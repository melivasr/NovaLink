const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  getOrderById, createOrder, checkoutOrder, cancelOrder, getUserOrders
} = require('../controllers/ordersController');

router.post('/', verifyToken, createOrder);
router.get('/user/:userId', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id', verifyToken, checkoutOrder);
router.delete('/:id', cancelOrder);

module.exports = router;
