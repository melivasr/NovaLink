const express = require('express');
const router = express.Router();
const {getOrderById, createOrder, checkoutOrder, cancelOrder,
  getUserOrders} = require('../controllers/ordersController');

router.post('/', createOrder);
router.get('/:id', getOrderById);
router.put('/:id', checkoutOrder);
router.delete('/:id', cancelOrder);

router.get('/user/:userId', getUserOrders);

module.exports = router;