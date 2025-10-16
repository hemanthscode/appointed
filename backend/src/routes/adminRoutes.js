const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const validation = require('../middleware/validation');

router.use(protect, adminOnly);

// User management
router.get('/users', validation.validatePagination, adminController.getUsers);
router.patch('/users/bulk', adminController.bulkUserOperation);

// User approvals
router.get('/approvals', validation.validatePagination, adminController.getApprovals);
router.patch('/approvals/:id/approve', validation.validateMongoId('id'), adminController.approveUser);
router.patch('/approvals/:id/reject', validation.validateMongoId('id'), adminController.rejectUser);

// System stats
router.get('/stats', adminController.getSystemStats);

// System settings
router.route('/settings')
  .get(adminController.getSettings)
  .put(adminController.updateSettings);

module.exports = router;
