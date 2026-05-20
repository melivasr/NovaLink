const { subscribe, connectWithRetry } = require('./broker');
const UserService = require('../services/userService');

const service = new UserService();

async function handleInventarioConfirmado({ userId, items }) {
  console.log(`[users] Processing inventario.confirmado for user ${userId}`);
  for (const item of items) {
    await service.addSkillToUser(userId, { skillId: item.skillId, xp: item.quantity * item.xp_points });
  }
  console.log(`[users] Skills updated for user ${userId}`);
}

async function startSubscribers() {
  await connectWithRetry();
  await subscribe('users.inventario.confirmado', 'inventario.confirmado', handleInventarioConfirmado);
}

module.exports = { startSubscribers };
