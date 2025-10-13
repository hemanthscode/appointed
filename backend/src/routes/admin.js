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
const { validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users', validatePagination, getUsers);
router.patch('/users/bulk', bulkUserOperation);

router.get('/approvals', validatePagination, getApprovals);
router.patch('/approvals/:id/approve', validateMongoId('id'), approveUser);
router.patch('/approvals/:id/reject', validateMongoId('id'), rejectUser);

router.get('/stats', getSystemStats);

router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

module.exports = router;
