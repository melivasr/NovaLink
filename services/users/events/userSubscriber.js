const { subscribe, connectWithRetry } = require('./broker');
const UserService = require('../services/userService');
const UserRepository = require('../repositories/userRepository');

const service = new UserService();
const repo = new UserRepository();

async function handleUsuarioRegistrado({ name, email, passwordHash }) {
  await repo.create({ name, email, passwordHash });
  console.log(`[users] Usuario ${email} → creado en DB`);
}

async function handleInventarioConfirmado({ userId, items }) {
  console.log(`[users] Processing inventario.confirmado for user ${userId}`);
  for (const item of items) {
    await service.addSkillToUser(userId, { skillId: item.skillId, xp: item.quantity * item.xp_points });
  }
  console.log(`[users] Skills updated for user ${userId}`);
}

async function startSubscribers() {
  await connectWithRetry();
  await subscribe('users.usuario.registrado', 'usuario.registrado', handleUsuarioRegistrado);
  await subscribe('users.inventario.confirmado', 'inventario.confirmado', handleInventarioConfirmado);
}

module.exports = { startSubscribers };