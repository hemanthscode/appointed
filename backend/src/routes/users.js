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
const { 
  adminOnly, 
  teacherOrAdmin,
  checkResourceOwnership 
} = require('../middleware/roleCheck');
const {
  validateProfileUpdate,
  validateMongoId,
  validatePagination
} = require('../middleware/validation');
const uploadMiddleware = require('../config/multer');

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.route('/profile')
  .get(getProfile)
  .put(validateProfileUpdate, updateProfile);

// Avatar upload
router.post('/avatar', uploadMiddleware.avatar, uploadAvatar);

// Password change
router.put('/change-password', changePassword);

// Get teachers (available to all authenticated users)
router.get('/teachers', validatePagination, getTeachers);

// Get students (teachers and admins only)
router.get('/students', teacherOrAdmin, validatePagination, getStudents);

// User management by ID
router.route('/:id')
  .get(validateMongoId('id'), getUserById)
  .delete(adminOnly, validateMongoId('id'), deleteUser);

// Update user status (admin only)
router.patch('/:id/status', adminOnly, validateMongoId('id'), updateUserStatus);

module.exports = router;
