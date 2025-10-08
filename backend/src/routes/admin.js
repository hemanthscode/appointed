const express = require('express');
const {
  getUsers,
  getApprovals,
  approveUser,
  rejectUser,
  getSystemStats,
  updateSettings,
  getSettings,
  bulkUserOperation
} = require('../controllers/adminController');

const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const {
  validateMongoId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// All routes are admin only
router.use(protect, adminOnly);

// User management
router.get('/users', validatePagination, getUsers);
router.patch('/users/bulk', bulkUserOperation);

// Approval system
router.get('/approvals', validatePagination, getApprovals);
router.patch('/approvals/:id/approve', validateMongoId('id'), approveUser);
router.patch('/approvals/:id/reject', validateMongoId('id'), rejectUser);

// System statistics
router.get('/stats', getSystemStats);

// System settings
router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

module.exports = router;
