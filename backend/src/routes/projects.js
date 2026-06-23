const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(projectController.getProjects).post(projectController.createProject);
router.route('/:id').get(projectController.getProject).put(projectController.updateProject).delete(projectController.deleteProject);
router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:userId', projectController.removeMember);
router.get('/:id/stats', projectController.getProjectStats);
router.route('/:projectId/tasks').get(taskController.getTasks).post(taskController.createTask);

module.exports = router;
