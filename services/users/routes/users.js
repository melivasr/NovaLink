const express = require('express');
const router = express.Router();
const {getAllUsers, getUserById, createUser, updateUser, deleteUser, getUserSkills,
  addSkillToUser, removeSkillFromUser} = require('../controllers/usersController');

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/:id/skills', getUserSkills);
router.put('/:id/skills', addSkillToUser);
router.delete('/:id/skills', removeSkillFromUser);

module.exports = router;
