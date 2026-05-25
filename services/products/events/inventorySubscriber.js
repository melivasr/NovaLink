const { subscribe, publish, connectWithRetry } = require('./broker');
const InventoryRepository = require('../repositories/inventoryRepository');

const repo = new InventoryRepository();

async function handlePedidoCreado({ orderId, userId, items }) {
  console.log(`[inventory] Processing pedido.creado for order ${orderId}`);

  const checkedItems = [];
  for (const item of items) {
    const skill = await repo.findById(item.skillId);
    if (!skill) {
      await publish('inventario.fallido', { orderId, userId, reason: `Habilidad ${item.skillId} no encontrada` });
      return;
    }
    if (skill.stock < item.quantity) {
      await publish('inventario.fallido', { orderId, userId, reason: `Stock insuficiente para ${skill.name}` });
      return;
    }
    checkedItems.push({ skillId: item.skillId, quantity: item.quantity, xp_points: skill.xp_points, price: skill.price, currentStock: skill.stock });
  }

  for (const item of checkedItems) {
    await repo.updateStock(item.skillId, item.currentStock - item.quantity);
  }

  const totalAmount = parseFloat(
    checkedItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
  );

  await publish('inventario.confirmado', {
    orderId,
    userId,
    items: checkedItems.map(({ skillId, quantity, xp_points, price }) => ({ skillId, quantity, xp_points, price })),
    totalAmount
  });

  console.log(`[inventory] inventario.confirmado for order ${orderId}, total: ${totalAmount}`);
}

async function handleProductoActualizado({ productId, name, difficulty, xp_points, stock, is_activated }) {
  const current = await repo.findById(productId);
  if (!current) { console.warn(`[inventory] producto.actualizado: product ${productId} not found`); return; }
  await repo.update(productId, {
    name:         name         ?? current.name,
    difficulty:   difficulty   ?? current.difficulty,
    xp_points:    xp_points    ?? current.xp_points,
    stock:        stock        ?? current.stock,
    is_activated: is_activated ?? current.is_activated
  });
  console.log(`[inventory] Producto ${productId} → actualizado en DB`);
}

async function startSubscribers() {
  await connectWithRetry();
  await subscribe('products.pedido.creado', 'pedido.creado', handlePedidoCreado);
  await subscribe('products.producto.actualizado', 'producto.actualizado', handleProductoActualizado);
}

module.exports = { startSubscribers };
