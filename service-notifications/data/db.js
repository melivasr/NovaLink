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
        console.log('Notificaciones: no hay db.json, creo uno nuevo.');
        this.save({ notifications: [] });
      }

      const fileData = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(fileData);
    } catch (error) {
      console.error('Notificaciones: error leyendo datos:', error.message);
      return { notifications: [] };
    }
  }

  save(data = null) {
    try {
      const content = data || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(content, null, 2), 'utf8');
      console.log('Notificaciones: datos guardados.');
    } catch (error) {
      console.error('Notificaciones: error guardando datos:', error.message);
    }
  }

  getNotifications() {
    return this.data.notifications || [];
  }

  getNotification(id) {
    const notificationId = Number(id);
    const notifications = this.getNotifications();

    for (const item of notifications) {
      if (item.id == notificationId) {
        return item;
      }
    }

    return null;
  }

  addNotification(notification) {
    const notifications = this.getNotifications();
    const ids = [];

    for (const item of notifications) {
      ids.push(item.id);
    }

    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    const newNotification = {
      id: newId,
      userId: notification.userId,
      message: notification.message,
      read: notification.read || false,
      createdAt: new Date().toISOString(),
    };

    notifications.push(newNotification);
    this.data.notifications = notifications;
    this.save();
    return newNotification;
  }

  updateNotification(id, updates) {
    const notifications = this.getNotifications();
    const notificationId = Number(id);
    const index = notifications.findIndex(item => item.id == notificationId);
    if (index < 0) return null;

    const existingNotification = notifications[index];

    if (updates.userId !== undefined) {
      existingNotification.userId = updates.userId;
    }
    if (updates.message !== undefined) {
      existingNotification.message = updates.message;
    }
    if (updates.read !== undefined) {
      existingNotification.read = updates.read;
    }

    notifications[index] = existingNotification;
    this.data.notifications = notifications;
    this.save();
    return existingNotification;
  }

  deleteNotification(id) {
    const notifications = this.getNotifications();
    const notificationId = Number(id);
    const index = notifications.findIndex(item => item.id == notificationId);
    if (index < 0) return false;

    notifications.splice(index, 1);
    this.data.notifications = notifications;
    this.save();
    return true;
  }

  getUserNotifications(userId) {
    const notifications = this.getNotifications();
    const result = [];
    const numericUserId = Number(userId);

    for (const item of notifications) {
      if (item.userId == numericUserId) {
        result.push(item);
      }
    }

    return result;
  }

  markAsRead(id) {
    return this.updateNotification(id, { read: true });
  }
}

module.exports = new Database();