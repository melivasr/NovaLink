const db = require('../data/db');

const getUserById = (req, res) => {
  const id = req.params.id;
  const user = db.getUser(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
};

const createUser = (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Nombre y email son requeridos'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email inválido'
    });
  }

  const newUser = db.addUser({ name, email });

  res.status(201).json({
    success: true,
    data: newUser,
    message: 'Usuario creado exitosamente'
  });
};

const updateUser = (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;

  const user = db.updateUser(id, { name, email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: user,
    message: 'Usuario actualizado exitosamente'
  });
};

const deleteUser = (req, res) => {
  const id = req.params.id;
  const deleted = db.deleteUser(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  res.status(204).send();
};

const getUserSkills = (req, res) => {
  const id = req.params.id;
  const user = db.getUser(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: user.acquiredSkills,
    message: `Habilidades del usuario ${user.name}`
  });
};

const addSkillToUser = (req, res) => {
  const id = req.params.id;
  const { skillId, name } = req.body;

  if (!skillId || !name) {
    return res.status(400).json({
      success: false,
      message: 'skillId y name son requeridos'
    });
  }

  const user = db.addSkillToUser(id, { skillId, name });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: db.getUser(id) ? 'El usuario ya posee esta habilidad' : 'Usuario no encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: user,
    message: 'Habilidad agregada exitosamente'
  });
};

const removeSkillFromUser = (req, res) => {
  const id = req.params.id;
  const { skillId } = req.body;

  if (!skillId) {
    return res.status(400).json({
      success: false,
      message: 'skillId es requerido'
    });
  }

  const user = db.removeSkillFromUser(id, skillId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado o no posee esta habilidad'
    });
  }

  res.status(200).json({
    success: true,
    data: user,
    message: 'Habilidad removida exitosamente'
  });
};

module.exports = {getUserById, createUser, updateUser,
  deleteUser, getUserSkills, addSkillToUser, removeSkillFromUser};