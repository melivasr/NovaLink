const axios = require('axios');

class InventoryClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getSkillById(skillId) {
    return axios.get(`${this.baseUrl}/${skillId}`);
  }

  async updateSkill(skillId, payload) {
    return axios.put(`${this.baseUrl}/${skillId}`, payload);
  }
}

module.exports = InventoryClient;
