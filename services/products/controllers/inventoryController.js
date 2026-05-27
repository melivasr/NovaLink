const InventoryService = require('../services/inventoryService');

const service = new InventoryService();

const handleError = (res, error) => {
  const status = error.status || 500;
  const message = error.message || 'Error interno del servidor';
  if (error.code === '23505') {
    return res.status(400).json({ success: false, message: 'Nombre duplicado' });
  }
  res.status(status).json({ success: false, message });
};

const getAllSkills = async (req, res) => {
  try {
    const data = await service.getAllSkills();
    res.status(200).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

const getSkillById = async (req, res) => {
  try {
    const data = await service.getSkillById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

const createSkill = async (req, res) => {
  try {
    const data = await service.createSkill(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

const updateSkill = async (req, res) => {
  try {
    const data = await service.updateSkill(req.params.id, req.body);
    res.status(200).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

const deleteSkill = async (req, res) => {
  try {
    await service.deleteSkill(req.params.id);
    res.status(200).json({ success: true, message: 'Habilidad eliminada' });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {getAllSkills, getSkillById,
  createSkill, updateSkill, deleteSkill };
