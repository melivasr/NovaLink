const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        console.log('Pedidos: no hay db.json, creo uno nuevo.');
        this.save({ orders: [] });
      }

      const fileData = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(fileData);
    } catch (error) {
      console.error('Pedidos: error leyendo datos:', error.message);
      return { orders: [] };
    }
  }

  save(data = null) {
    try {
      const content = data || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(content, null, 2), 'utf8');
      console.log('Pedidos: datos guardados.');
    } catch (error) {
      console.error('Pedidos: error guardando datos:', error.message);
    }
  }

  getOrders() {
    return this.data.orders || [];
  }

  getOrder(id) {
    const orderId = Number(id);
    const orders = this.getOrders();

    for (const item of orders) {
      if (item.id == orderId) {
        return item;
      }
    }

    return null;
  }

  addOrder(order) {
    const orders = this.getOrders();
    const ids = [];

    for (const item of orders) {
      ids.push(item.id);
    }

    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    const newOrder = {
      id: newId,
      userId: order.userId,
      items: order.items,
      status: order.status || 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    orders.push(newOrder);
    this.data.orders = orders;
    this.save();
    return newOrder;
  }

  updateOrder(id, updates) {
    const orders = this.getOrders();
    const orderId = Number(id);
    const index = orders.findIndex(item => item.id == orderId);
    if (index < 0) return null;

    const existingOrder = orders[index];

    if (updates.userId !== undefined) {
      existingOrder.userId = updates.userId;
    }
    if (updates.items !== undefined) {
      existingOrder.items = updates.items;
    }
    if (updates.status !== undefined) {
      existingOrder.status = updates.status;
    }
    if (updates.completedAt !== undefined) {
      existingOrder.completedAt = updates.completedAt;
    }

    orders[index] = existingOrder;
    this.data.orders = orders;
    this.save();
    return existingOrder;
  }

  deleteOrder(id) {
    const orders = this.getOrders();
    const orderId = Number(id);
    const index = orders.findIndex(item => item.id == orderId);
    if (index < 0) return false;

    orders.splice(index, 1);
    this.data.orders = orders;
    this.save();
    return true;
  }

  getUserOrders(userId) {
    const result = [];
    const orders = this.getOrders();
    const numericUserId = Number(userId);

    for (const order of orders) {
      if (order.userId == numericUserId) {
        result.push(order);
      }
    }

    return result;
  }
}

module.exports = new Database();