const axios = require('axios');

class UsersClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getUserById(userId) {
    return axios.get(`${this.baseUrl}/${userId}`);
  }

  async addSkillToUser(userId, skill) {
    return axios.put(`${this.baseUrl}/${userId}/skills`, skill);
  }
}

module.exports = UsersClient;