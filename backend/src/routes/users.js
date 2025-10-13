const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getTeachers,
  getStudents,
  getUserById,
  updateUserStatus,
  deleteUser,
  changePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { adminOnly, teacherOrAdmin } = require('../middleware/roleCheck');
const { validateProfileUpdate, validateMongoId, validatePagination } = require('../middleware/validation');
const uploadMiddleware = require('../config/multer');

const router = express.Router();

router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(validateProfileUpdate, updateProfile);

router.post('/avatar', uploadMiddleware.avatar, uploadAvatar);

router.put('/change-password', changePassword);

router.get('/teachers', validatePagination, getTeachers);

router.get('/students', teacherOrAdmin, validatePagination, getStudents);

router.route('/:id')
  .get(validateMongoId('id'), getUserById)
  .delete(adminOnly, validateMongoId('id'), deleteUser);

router.patch('/:id/status', adminOnly, validateMongoId('id'), updateUserStatus);

module.exports = router;
