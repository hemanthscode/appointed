const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const fileService = require('../services/fileService');

// Upload avatar
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please select an image to upload' });

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    await fileService.deleteFile(req.file.filename, 'avatars');
    return res.status(400).json({ success: false, message: 'Please upload a valid image file (JPEG, PNG, GIF)' });
  }

  if (req.file.size > 5 * 1024 * 1024) {
    await fileService.deleteFile(req.file.filename, 'avatars');
    return res.status(400).json({ success: false, message: 'Image size should be less than 5MB' });
  }

  if (req.user.avatar) {
    await fileService.deleteFile(req.user.avatar, 'avatars');
  }

  const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.file.filename }, { new: true });
  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: { user: user.toJSON(), avatarUrl: `/uploads/avatars/${req.file.filename}` }
  });
});

// Upload documents (multiple files)
exports.uploadDocuments = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please select documents to upload' });
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  const maxFileSize = 10 * 1024 * 1024;
  const uploadedFiles = [];
  const errors = [];

  for (const file of req.files) {
    if (!allowedTypes.includes(file.mimetype)) {
      await fileService.deleteFile(file.filename, 'documents');
      errors.push(`${file.originalname}: Invalid file type`);
      continue;
    }

    if (file.size > maxFileSize) {
      await fileService.deleteFile(file.filename, 'documents');
      errors.push(`${file.originalname}: File size exceeds 10MB`);
      continue;
    }

    uploadedFiles.push({
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
      url: `/uploads/documents/${file.filename}`
    });
  }

  if (uploadedFiles.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid files were uploaded', errors });
  }

  res.status(200).json({
    success: true,
    message: `${uploadedFiles.length} document(s) uploaded successfully`,
    data: { uploadedFiles, errors: errors.length > 0 ? errors : undefined }
  });
});

// Delete uploaded file
exports.deleteFile = asyncHandler(async (req, res) => {
  const { type, filename } = req.params;
  const allowedTypes = ['avatars', 'documents'];

  if (!allowedTypes.includes(type)) return res.status(400).json({ success: false, message: 'Invalid file type' });

  if (type === 'avatars' && req.user.avatar !== filename) {
    return res.status(403).json({ success: false, message: 'You can only delete your own avatar' });
  }

  if (type === 'avatars') {
    await User.findByIdAndUpdate(req.user._id, { $unset: { avatar: 1 } });
  }

  // For documents, only admin allowed - implement check here if required

  const deleted = await fileService.deleteFile(filename, type);

  if (!deleted) return res.status(404).json({ success: false, message: 'File not found' });

  res.status(200).json({ success: true, message: 'File deleted successfully' });
});

// Get file info
exports.getFileInfo = asyncHandler(async (req, res) => {
  const { type, filename } = req.params;
  const fileInfo = await fileService.getFileInfo(filename, type);

  if (!fileInfo) return res.status(404).json({ success: false, message: 'File not found' });

  res.status(200).json({ success: true, data: fileInfo });
});

// Serve uploaded files w/ access control
exports.serveFile = asyncHandler(async (req, res) => {
  const { type, filename } = req.params;
  const filePath = require('path').join(__dirname, '../../uploads', type, filename);
  const exists = await fileService.fileExists(filename, type);

  if (!exists) return res.status(404).json({ success: false, message: 'File not found' });

  // Access controls can be implemented here - avatars open, documents restricted

  const fileInfo = await fileService.getFileInfo(filename, type);

  res.set({
    'Content-Type': fileInfo.mimetype,
    'Content-Length': fileInfo.size,
    'Content-Disposition': `inline; filename="${fileInfo.originalName || filename}"`
  });

  res.sendFile(filePath);
});
