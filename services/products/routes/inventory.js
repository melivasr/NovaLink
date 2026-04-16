const express = require('express');
const router = express.Router();

const {getAllSkills, getSkillById, createSkill, updateSkill,
     deleteSkill} = require('../controllers/inventoryController');

router.post('/', createSkill);
router.get('/', getAllSkills);
router.get('/:id', getSkillById);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

module.exports = router;