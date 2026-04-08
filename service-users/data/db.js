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
        console.log('Usuarios: no hay db.json, creo uno nuevo.');
        this.save({ users: [] });
      }

      const fileData = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(fileData);
    } catch (error) {
      console.error('Usuarios: error leyendo datos:', error.message);
      return { users: [] };
    }
  }

  save(data = null) {
    try {
      const content = data || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(content, null, 2), 'utf8');
      console.log('Usuarios: datos guardados.');
    } catch (error) {
      console.error('Usuarios: error guardando datos:', error.message);
    }
  }

  getUsers() {
    return this.data.users || [];
  }

  getUser(id) {
    const userId = Number(id);
    const users = this.getUsers();

    for (const currentUser of users) {
      if (currentUser.id == userId) {
        return currentUser;
      }
    }

    return null;
  }

  addUser(user) {
    const users = this.getUsers();
    const ids = [];

    for (const item of users) {
      ids.push(item.id);
    }

    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    const newUser = {
      id: newId,
      name: user.name,
      email: user.email,
      acquiredSkills: [],
    };

    users.push(newUser);
    this.data.users = users;
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const userId = Number(id);
    const index = users.findIndex(currentUser => currentUser.id == userId);
    if (index < 0) return null;

    const existingUser = users[index];

    if (updates.name) {
      existingUser.name = updates.name;
    }
    if (updates.email) {
      existingUser.email = updates.email;
    }

    users[index] = existingUser;
    this.data.users = users;
    this.save();
    return existingUser;
  }

  deleteUser(id) {
    const users = this.getUsers();
    const userId = Number(id);
    const index = users.findIndex(currentUser => currentUser.id == userId);
    if (index < 0) return false;

    users.splice(index, 1);
    this.data.users = users;
    this.save();
    return true;
  }

  addSkillToUser(userId, skill) {
    const user = this.getUser(userId);
    if (!user) return null;

    const alreadyHasSkill = user.acquiredSkills.some(currentSkill => currentSkill.skillId == skill.skillId);
    if (alreadyHasSkill) return null;

    const newSkill = {
      skillId: skill.skillId,
      name: skill.name,
      level: skill.level,
      acquiredAt: new Date().toISOString(),
    };

    user.acquiredSkills.push(newSkill);
    this.save();
    return user;
  }

  removeSkillFromUser(userId, skillId) {
    const user = this.getUser(userId);
    if (!user) return null;

    const skillIndex = user.acquiredSkills.findIndex(currentSkill => currentSkill.skillId == skillId);
    if (skillIndex < 0) return null;

    user.acquiredSkills.splice(skillIndex, 1);
    this.save();
    return user;
  }
}

module.exports = new Database();