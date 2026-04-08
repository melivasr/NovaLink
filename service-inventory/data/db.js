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
        console.log('Inventario: no hay db.json, creo uno nuevo.');
        this.save({ inventory: [] });
      }

      const fileData = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(fileData);
    } catch (error) {
      console.error('Inventario: error leyendo datos:', error.message);
      return { inventory: [] };
    }
  }

  save(data = null) {
    try {
      const content = data || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(content, null, 2), 'utf8');
      console.log('Inventario: datos guardados.');
    } catch (error) {
      console.error('Inventario: error guardando datos:', error.message);
    }
  }

  getInventory() {
    return this.data.inventory || [];
  }

  getSkill(id) {
    const skillId = Number(id);
    const inventory = this.getInventory();

    for (const item of inventory) {
      if (item.id == skillId) {
        return item;
      }
    }

    return null;
  }

  addSkill(skill) {
    const inventory = this.getInventory();
    const ids = [];

    for (const item of inventory) {
      ids.push(item.id);
    }

    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    const newSkill = {
      id: newId,
      name: skill.name,
      description: skill.description,
      stock: skill.stock,
      points: skill.points,
    };

    inventory.push(newSkill);
    this.data.inventory = inventory;
    this.save();
    return newSkill;
  }

  updateSkill(id, updates) {
    const inventory = this.getInventory();
    const skillId = Number(id);
    const index = inventory.findIndex(item => item.id == skillId);
    if (index < 0) return null;

    const existingSkill = inventory[index];

    if (updates.name !== undefined) {
      existingSkill.name = updates.name;
    }
    if (updates.description !== undefined) {
      existingSkill.description = updates.description;
    }
    if (updates.stock !== undefined) {
      existingSkill.stock = updates.stock;
    }
    if (updates.points !== undefined) {
      existingSkill.points = updates.points;
    }

    inventory[index] = existingSkill;
    this.data.inventory = inventory;
    this.save();
    return existingSkill;
  }

  deleteSkill(id) {
    const inventory = this.getInventory();
    const skillId = Number(id);
    const index = inventory.findIndex(item => item.id == skillId);
    if (index < 0) return false;

    inventory.splice(index, 1);
    this.data.inventory = inventory;
    this.save();
    return true;
  }

  reserveStock(skillId, quantity) {
    const skill = this.getSkill(skillId);
    if (!skill) return null;

    if (skill.stock < quantity) {
      return false;
    }

    skill.stock = skill.stock - quantity;
    this.save();
    return skill;
  }
}

module.exports = new Database();