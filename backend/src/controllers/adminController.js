const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// User management with pagination
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const query = {};
  const users = await User.find(query).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).select('-password -refreshToken');
  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

// Bulk user operations: activate, deactivate, suspend, delete
exports.bulkUserOperation = asyncHandler(async (req, res) => {
  const { ids, operation } = req.body;
  let result;

  switch (operation) {
    case 'activate':
      result = await User.updateMany({ _id: { $in: ids } }, { status: 'active' });
      break;
    case 'deactivate':
      result = await User.updateMany({ _id: { $in: ids } }, { status: 'inactive' });
      break;
    case 'suspend':
      result = await User.updateMany({ _id: { $in: ids } }, { status: 'suspended' });
      break;
    case 'delete':
      result = await User.deleteMany({ _id: { $in: ids } });
      break;
    default:
      return res.status(400).json({ success: false, message: 'Invalid operation' });
  }

  res.status(200).json({ success: true, message: `Operation ${operation} completed`, data: result });
});

// Approval system listing
exports.getApprovals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const query = { status: 'pending' };
  const users = await User.find(query).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).select('-password -refreshToken');
  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

// Approve user account
exports.approveUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.status(200).json({ success: true, message: 'User approved', data: user });
});

// Reject user account
exports.rejectUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.status = 'inactive';
  await user.save();

  res.status(200).json({ success: true, message: 'User rejected', data: user });
});

// System stats placeholder
exports.getSystemStats = asyncHandler(async (req, res) => {
  // Implement statistics aggregation as needed
  res.status(200).json({ success: true, data: { userCount: await User.countDocuments() } });
});

// Get system settings placeholder
exports.getSettings = asyncHandler(async (req, res) => {
  // Return app settings from config or DB
  res.status(200).json({ success: true, data: {} });
});

// Update system settings placeholder
exports.updateSettings = asyncHandler(async (req, res) => {
  // Save settings to DB or config
  res.status(200).json({ success: true, message: 'Settings updated' });
});
