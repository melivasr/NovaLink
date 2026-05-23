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

async function handleUsuarioActualizado({ userId, name, email, passwordHash }) {
  const current = await repo.findByIdFull(userId);
  if (!current) { console.warn(`[users] usuario.actualizado: user ${userId} not found`); return; }
  await repo.update(userId, {
    name: name ?? current.name,
    email: email ?? current.email,
    passwordHash: passwordHash ?? current.password_hash
  });
  console.log(`[users] Usuario ${userId} → actualizado en DB`);
}

async function startSubscribers() {
  await connectWithRetry();
  await subscribe('users.usuario.registrado', 'usuario.registrado', handleUsuarioRegistrado);
  await subscribe('users.inventario.confirmado', 'inventario.confirmado', handleInventarioConfirmado);
  await subscribe('users.usuario.actualizado', 'usuario.actualizado', handleUsuarioActualizado);
}

module.exports = { startSubscribers };