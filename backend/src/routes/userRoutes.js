const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validation = require('../middleware/validation');
const uploadMiddleware = require('../config/multer');
const { protect } = require('../middleware/auth');
const { adminOnly, teacherOrAdmin } = require('../middleware/roleCheck');

router.use(protect);

router.route('/profile')
  .get(userController.getProfile)
  .put(validation.validateProfileUpdate, userController.updateProfile);

router.post('/avatar', uploadMiddleware.avatar, userController.uploadAvatar);

router.put('/change-password', userController.changePassword);

router.get('/teachers', validation.validatePagination, userController.getTeachers);

router.get('/students', teacherOrAdmin, validation.validatePagination, userController.getStudents);

router.route('/:id')
  .get(validation.validateMongoId('id'), userController.getUserById)
  .delete(adminOnly, validation.validateMongoId('id'), userController.deleteUser);

router.patch('/:id/status', adminOnly, validation.validateMongoId('id'), userController.updateUserStatus);

module.exports = router;
