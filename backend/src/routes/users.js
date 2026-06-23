const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', userController.getUsers);
router.route('/:id')
  .get(userController.getUser)
  .put(authorize('admin'), userController.updateUser)
  .delete(authorize('admin'), userController.deleteUser);

module.exports = router;
