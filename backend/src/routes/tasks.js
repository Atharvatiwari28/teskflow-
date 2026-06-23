const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/my-tasks', taskController.getMyTasks);
router.route('/').get(taskController.getTasks);
router.route('/:id').get(taskController.getTask).put(taskController.updateTask).delete(taskController.deleteTask);
router.post('/:id/comments', taskController.addComment);
router.delete('/:id/comments/:commentId', taskController.deleteComment);

module.exports = router;
