const db = require('../data/db');

const getAllSkills = (req, res) => {
  const skills = db.getInventory();

  res.status(200).json({
    success: true,
    data: skills
  });
};

const getSkillById = (req, res) => {
  const id = req.params.id;
  const skill = db.getSkill(id);

  if (!skill) {
    return res.status(404).json({
      success: false,
      message: 'Habilidad no encontrada'
    });
  }

  res.status(200).json({
    success: true,
    data: skill
  });
};

const createSkill = (req, res) => {
  const { name, description, stock, points } = req.body;

  if (!name || !description || stock === undefined || points === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Nombre, descripción, stock y puntos son requeridos'
    });
  }

  if (stock < 0 || points < 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock y puntos deben ser positivos'
    });
  }

  const newSkill = db.addSkill({ name, description, stock, points });

  res.status(201).json({
    success: true,
    data: newSkill,
    message: 'Habilidad creada exitosamente'
  });
};

const updateSkill = (req, res) => {
  const id = req.params.id;
  const { name, description, stock, points } = req.body;

  const skill = db.updateSkill(id, { name, description, stock, points });

  if (!skill) {
    return res.status(404).json({
      success: false,
      message: 'Habilidad no encontrada'
    });
  }

  res.status(200).json({
    success: true,
    data: skill,
    message: 'Habilidad actualizada exitosamente'
  });
};

const deleteSkill = (req, res) => {
  const id = req.params.id;
  const deleted = db.deleteSkill(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Habilidad no encontrada'
    });
  }

  res.status(204).send();
};

module.exports = {getAllSkills, getSkillById,
  createSkill, updateSkill, deleteSkill};