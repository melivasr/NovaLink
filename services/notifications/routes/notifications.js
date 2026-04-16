const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationsController');

router.post('/', createNotification);
router.get('/user/:userId', getUserNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;