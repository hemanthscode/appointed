const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const validation = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');

router.use(protect, adminOnly);

router.get('/users', validation.validatePagination, adminController.getUsers);
router.patch('/users/bulk', adminController.bulkUserOperation);

router.get('/approvals', validation.validatePagination, adminController.getApprovals);
router.patch('/approvals/:id/approve', validation.validateMongoId('id'), adminController.approveUser);
router.patch('/approvals/:id/reject', validation.validateMongoId('id'), adminController.rejectUser);

router.get('/stats', adminController.getSystemStats);

router.route('/settings')
  .get(adminController.getSettings)
  .put(adminController.updateSettings);

module.exports = router;
