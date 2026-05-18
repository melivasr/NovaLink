const bcryptjs = require('bcryptjs');
const UserRepository = require('../repositories/userRepository');

class UserService {
  constructor() {
    this.repo = new UserRepository();
  }

  async getAllUsers() {
    return this.repo.findAll();
  }

  async getUserById(id) {
    const user = await this.repo.findById(id);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };
    return user;
  }

  async createUser({ name, email, password }) {
    if (!name || !email || !password) {
      throw { status: 400, message: 'Nombre, email y password son requeridos' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw { status: 400, message: 'Email inválido' };
    }
    const passwordHash = await bcryptjs.hash(password, 10);
    return this.repo.create({ name, email, passwordHash });
  }

  async updateUser(id, { name, email, password }) {
    const current = await this.repo.findById(id);
    if (!current) throw { status: 404, message: 'Usuario no encontrado' };

    const updatedName = name !== undefined ? name : current.name;
    const updatedEmail = email !== undefined ? email : current.email;
    const updatedPasswordHash = password !== undefined
      ? await bcryptjs.hash(password, 10)
      : current.password_hash;

    return this.repo.update(id, {
      name: updatedName,
      email: updatedEmail,
      passwordHash: updatedPasswordHash
    });
  }

  async deleteUser(id) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw { status: 404, message: 'Usuario no encontrado' };
  }

  async getUserSkills(userId) {
    const user = await this.repo.findById(userId);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };
    const skills = await this.repo.findSkills(userId);
    return { user, skills };
  }

  async addSkillToUser(userId, { skillId, xp }) {
    if (!skillId) throw { status: 400, message: 'skillId es requerido' };
    const user = await this.repo.findById(userId);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };
    const xpToAdd = xp && xp > 0 ? xp : 0;
    await this.repo.upsertSkill(userId, skillId, xpToAdd);
    const skills = await this.repo.findSkills(userId);
    return { user, skills };
  }

  async removeSkillFromUser(userId, { skillId }) {
    if (!skillId) throw { status: 400, message: 'skillId es requerido' };
    const user = await this.repo.findById(userId);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };
    const removed = await this.repo.removeSkill(userId, skillId);
    if (!removed) throw { status: 404, message: 'Usuario no posee esta habilidad' };
    const skills = await this.repo.findSkills(userId);
    return { user, skills };
  }
}

module.exports = UserService;
