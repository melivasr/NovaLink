const InventoryRepository = require('../repositories/inventoryRepository');

class InventoryService {
  constructor() {
    this.repo = new InventoryRepository();
  }

  async getAllSkills() {
    return this.repo.findAll();
  }

  async getSkillById(id) {
    const skill = await this.repo.findById(id);
    if (!skill) throw { status: 404, message: 'Habilidad no encontrada' };
    return skill;
  }

  async createSkill({ name, difficulty, stock, points, price }) {
    if (!name || !difficulty || stock === undefined || points === undefined || price === undefined) {
      throw { status: 400, message: 'Faltan datos' };
    }
    return this.repo.create({ name, difficulty, xp_points: points, price, stock });
  }

  async updateSkill(id, body) {
    const current = await this.repo.findById(id);
    if (!current) throw { status: 404, message: 'Habilidad no encontrada' };

    return this.repo.update(id, {
      name: body.name !== undefined ? body.name : current.name,
      difficulty: body.difficulty !== undefined ? body.difficulty : current.difficulty,
      xp_points: body.points !== undefined ? body.points : current.xp_points,
      stock: body.stock !== undefined ? body.stock : current.stock,
      is_activated: body.is_activated !== undefined ? body.is_activated : current.is_activated
    });
  }

  async deleteSkill(id) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw { status: 404, message: 'Habilidad no encontrada' };
  }
}

module.exports = InventoryService;
