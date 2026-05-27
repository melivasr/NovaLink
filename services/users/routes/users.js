const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getUserSkills,
addSkillToUser, removeSkillFromUser } = require('../controllers/usersController');
const { verifyTokenMiddleware } = require('../middleware/authMiddleware');

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ success: false, message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

router.get('/',        verifyTokenMiddleware, requireAdmin, getAllUsers);
router.post('/',       createUser); // público — registro
router.get('/:id',     verifyTokenMiddleware, getUserById);
router.put('/:id',     verifyTokenMiddleware, updateUser);
router.delete('/:id',  verifyTokenMiddleware, requireAdmin, deleteUser);
router.get('/:id/skills',    verifyTokenMiddleware, getUserSkills);
router.put('/:id/skills',    verifyTokenMiddleware, addSkillToUser);
router.delete('/:id/skills', verifyTokenMiddleware, removeSkillFromUser);

module.exports = router;