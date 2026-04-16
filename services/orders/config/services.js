const ensureApiPath = (baseUrl, pathSuffix) => {
  if (!baseUrl) {
    return pathSuffix;
  }

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  if (normalizedBase.includes('/api/')) {
    return normalizedBase;
  }

  return `${normalizedBase}${pathSuffix}`;
};

const services = {
  usersBaseUrl: ensureApiPath(process.env.USERS_SERVICE_URL || 'http://localhost:3001', '/api/v1/users'),
  inventoryBaseUrl: ensureApiPath(
    process.env.PRODUCTS_SERVICE_URL || process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002',
    '/api/v1/inventory'
  ),
  notificationsBaseUrl: ensureApiPath(process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3004', '/api/v1/noti'),
};

module.exports = services;
