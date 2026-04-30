const express = require('express');
const router = express.Router();

const createOrdersController = require('../controllers/ordersController');
const UsersClient = require('../clients/usersClient');
const InventoryClient = require('../clients/inventoryClient');
const NotificationsClient = require('../clients/notificationsClient');
const services = require('../config/services');
const verifyToken = require('../middleware/verifyToken');

const usersClient = new UsersClient(services.usersBaseUrl);
const inventoryClient = new InventoryClient(services.inventoryBaseUrl);
const notificationsClient = new NotificationsClient(services.notificationsBaseUrl);

const {
  getOrderById,
  createOrder,
  checkoutOrder,
  cancelOrder,
  getUserOrders
} = createOrdersController({
  usersClient,
  inventoryClient,
  notificationsClient,
});

router.post('/', verifyToken, createOrder);
router.get('/user/:userId', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id', checkoutOrder);
router.delete('/:id', cancelOrder);

module.exports = router;