const services = {
  usersBaseUrl: process.env.USERS_SERVICE_URL || 'http://localhost:3001/api/v1/users',
  inventoryBaseUrl: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002/api/v1/inventory',
  notificationsBaseUrl: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3004/api/v1/noti',
};

module.exports = services;
