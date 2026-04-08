const express = require('express');
const router = express.Router();
const {getUserById, createUser, updateUser, deleteUser, getUserSkills,
  addSkillToUser, removeSkillFromUser} = require('../controllers/usersController');

router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

router.get('/:id/skill', getUserSkills);
router.put('/:id/skill', addSkillToUser);
router.delete('/:id/skill', removeSkillFromUser);

module.exports = router;