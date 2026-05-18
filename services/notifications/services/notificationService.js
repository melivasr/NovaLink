const NotificationRepository = require('../repositories/notificationRepository');

class NotificationService {
  constructor() {
    this.repo = new NotificationRepository();
  }

  async createNotification({ userId, orderId, message }) {
    if (!userId || !message) {
      throw { status: 400, message: 'userId y message son requeridos' };
    }
    const row = await this.repo.create({ userId, orderId, message });
    console.log(`[usuario.actualizado] Notificación enviada a usuario ${userId}: ${message}`);
    return {
      id: row.id,
      userId: row.user_id,
      orderId: row.order_id,
      message: row.message,
      read: row.is_read,
      createdAt: row.created_at
    };
  }

  async getUserNotifications(userId) {
    const rows = await this.repo.findByUser(userId);
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      orderId: row.order_id,
      message: row.message,
      read: row.is_read,
      createdAt: row.created_at
    }));
  }

  async markAsRead(id) {
    const row = await this.repo.markAsRead(id);
    if (!row) throw { status: 404, message: 'Notificación no encontrada' };
    return {
      id: row.id,
      userId: row.user_id,
      orderId: row.order_id,
      message: row.message,
      read: row.is_read,
      createdAt: row.created_at
    };
  }

  async deleteNotification(id) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw { status: 404, message: 'Notificación no encontrada' };
  }
}

module.exports = NotificationService;
