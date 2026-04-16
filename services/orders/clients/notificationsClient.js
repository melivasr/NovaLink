const axios = require('axios');

class NotificationsClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async createNotification(payload) {
    return axios.post(this.baseUrl, payload);
  }
}

module.exports = NotificationsClient;
