const UserService = require('../services/userService');

const service = new UserService();

const handleError = (res, error) => {
  const status = error.status || 500;
  const message = error.message || 'Error interno del servidor';
  if (error.code === '23505') {
    return res.status(400).json({ success: false, message: 'El email ya existe' });
  }
  res.status(status).json({ success: false, message });
};

const getAllUsers = async (req, res) => {
  try {
    const data = await service.getAllUsers();
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

const getUserById = async (req, res) => {
  try {
    const data = await service.getUserById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

const createUser = async (req, res) => {
  try {
    const data = await service.createUser(req.body);
    res.status(202).json({ success: true, data, message: 'Usuario creado exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    const data = await service.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, data, message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    await service.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};

const getUserSkills = async (req, res) => {
  try {
    const { user, skills } = await service.getUserSkills(req.params.id);
    res.status(200).json({
      success: true,
      data: skills,
      message: `Habilidades del usuario ${user.name}`
    });
  } catch (error) {
    handleError(res, error);
  }
};

const addSkillToUser = async (req, res) => {
  try {
    const { user, skills } = await service.addSkillToUser(req.params.id, req.body);
    res.status(200).json({ success: true, data: { user, skills }, message: 'Habilidad actualizada exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

const removeSkillFromUser = async (req, res) => {
  try {
    const { user, skills } = await service.removeSkillFromUser(req.params.id, req.body);
    res.status(200).json({ success: true, data: { user, skills }, message: 'Habilidad removida exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {getAllUsers, getUserById, createUser, updateUser,
  deleteUser, getUserSkills, addSkillToUser, removeSkillFromUser
};
