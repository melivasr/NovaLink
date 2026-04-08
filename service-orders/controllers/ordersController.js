const getServiceError = (error, fallbackMessage) => {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || fallbackMessage
    };
  }

  return {
    status: 500,
    message: fallbackMessage
  };
};

const createOrdersController = (deps) => {
  const db = deps.db;
  const usersClient = deps.usersClient;
  const inventoryClient = deps.inventoryClient;
  const notificationsClient = deps.notificationsClient;

  const getOrderById = (req, res) => {
    const id = req.params.id;
    const order = db.getOrder(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Pedido no encontrado'
    });
  }

    res.status(200).json({
      success: true,
      data: order
    });
  };

  const createOrder = (req, res) => {
    const { userId, items } = req.body;

  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'userId y items son requeridos'
    });
  }

  for (const item of items) {
    if (!item.skillId || !item.quantity || item.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Cada item debe tener skillId y quantity mayor a 0'
      });
    }
  }

    const newOrder = db.addOrder({ userId, items, status: 'pending' });

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Pedido creado exitosamente'
    });
  };

  const checkoutOrder = async (req, res) => {
    const id = req.params.id;
    const order = db.getOrder(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Pedido no encontrado'
    });
  }

  if (order.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'El pedido ya fue procesado'
    });
  }

    try {
      await usersClient.getUserById(order.userId);

    const checkedSkills = [];

    // Verificar stock para cada item
    for (const item of order.items) {
      const skillResponse = await inventoryClient.getSkillById(item.skillId);

      const skill = skillResponse.data.data;
      if (skill.stock < item.quantity) {
        return res.status(409).json({
          success: false,
          message: `Stock insuficiente para ${skill.name}`
        });
      }

      checkedSkills.push({
        skillId: item.skillId,
        quantity: item.quantity,
        skillName: skill.name,
        newStock: skill.stock - item.quantity
      });
    }

    for (const item of checkedSkills) {
      await inventoryClient.updateSkill(item.skillId, {
        stock: item.newStock
      });
    }

    for (const item of checkedSkills) {
      await usersClient.addSkillToUser(order.userId, {
        skillId: item.skillId,
        name: item.skillName
      });
    }

    // Actualizar pedido
    const updatedOrder = db.updateOrder(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    // Enviar notificación
    await notificationsClient.createNotification({
      userId: order.userId,
      message: `Tu pedido ${id} ha sido completado exitosamente`
    });

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Pedido completado exitosamente'
    });

    } catch (error) {
      const serviceError = getServiceError(error, 'Error interno del servidor');
      console.error('Error procesando pedido:', serviceError.message);
      return res.status(serviceError.status).json({
        success: false,
        message: serviceError.message
      });
    }
  };

  const cancelOrder = (req, res) => {
    const id = req.params.id;
    const deleted = db.deleteOrder(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Pedido no encontrado'
    });
  }

    res.status(204).send();
  };

  const getUserOrders = (req, res) => {
    const userId = req.params.userId;
    const orders = db.getUserOrders(userId);

    res.status(200).json({
      success: true,
      data: orders,
      message: `Pedidos del usuario ${userId}`
    });
  };

  return {
    getOrderById,
    createOrder,
    checkoutOrder,
    cancelOrder,
    getUserOrders
  };
};

module.exports = createOrdersController;