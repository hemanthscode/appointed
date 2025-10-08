const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const fileService = require('../services/fileService');
const path = require('path');

// @desc    Upload user avatar
// @route   POST /api/uploads/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please select an image to upload'
    });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    // Delete uploaded file
    await fileService.deleteFile(req.file.filename, 'avatars');
    
    return res.status(400).json({
      success: false,
      message: 'Please upload a valid image file (JPEG, PNG, GIF)'
    });
  }

  // Validate file size (5MB max)
  if (req.file.size > 5 * 1024 * 1024) {
    await fileService.deleteFile(req.file.filename, 'avatars');
    
    return res.status(400).json({
      success: false,
      message: 'Image size should be less than 5MB'
    });
  }

  try {
    // Delete old avatar if exists
    if (req.user.avatar) {
      await fileService.deleteFile(req.user.avatar, 'avatars');
    }

    // Update user avatar in database
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.filename },
      { new: true }
    ).select('-password -refreshToken');

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        user,
        avatarUrl: `/uploads/avatars/${req.file.filename}`
      }
    });
  } catch (error) {
    // Delete uploaded file if database update fails
    await fileService.deleteFile(req.file.filename, 'avatars');
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update avatar'
    });
  }
});

// @desc    Upload documents (for admin approvals)
// @route   POST /api/uploads/documents
// @access  Private
const uploadDocuments = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please select documents to upload'
    });
  }

  // Validate files
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const uploadedFiles = [];
  const errors = [];

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    
    // Validate file type
    if (!allowedTypes.includes(file.mimetype)) {
      await fileService.deleteFile(file.filename, 'documents');
      errors.push(`${file.originalname}: Invalid file type`);
      continue;
    }

    // Validate file size
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
    return res.status(400).json({
      success: false,
      message: 'No valid files were uploaded',
      errors
    });
  }

  // In a real application, you might want to associate these documents
  // with the user or a specific application/request

  res.status(200).json({
    success: true,
    message: `${uploadedFiles.length} document(s) uploaded successfully`,
    data: {
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined
    }
  });
});

// @desc    Delete uploaded file
// @route   DELETE /api/uploads/:type/:filename
// @access  Private
const deleteFile = asyncHandler(async (req, res) => {
  const { type, filename } = req.params;

  // Validate type
  const allowedTypes = ['avatars', 'documents'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type'
    });
  }

  // Check if user owns the file (for avatars) or is admin (for documents)
  if (type === 'avatars') {
    if (req.user.avatar !== filename) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own avatar'
      });
    }

    // Remove avatar from user profile
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { avatar: 1 }
    });
  } else if (type === 'documents') {
    // Only admin can delete documents
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete documents'
      });
    }
  }

  // Delete file from filesystem
  const deleted = await fileService.deleteFile(filename, type);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'File deleted successfully'
  });
});

// @desc    Get file info
// @route   GET /api/uploads/:type/:filename/info
// @access  Private
const getFileInfo = asyncHandler(async (req, res) => {
  const { type, filename } = req.params;

  const fileInfo = await fileService.getFileInfo(filename, type);

  if (!fileInfo) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  res.status(200).json({
    success: true,
    data: fileInfo
  });
});

// @desc    Serve uploaded files (with access control)
// @route   GET /api/uploads/:type/:filename
// @access  Private
const serveFile = asyncHandler(async (req, res) => {
  const { type, filename } = req.params;

  // Build file path
  const filePath = path.join(__dirname, '../../uploads', type, filename);

  // Check if file exists
  const fileExists = await fileService.fileExists(filename, type);
  if (!fileExists) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  // Access control
  if (type === 'avatars') {
    // Avatars can be viewed by anyone (logged in)
    // No additional checks needed
  } else if (type === 'documents') {
    // Documents can only be viewed by admin or the owner
    if (req.user.role !== 'admin') {
      // Additional logic would be needed to check if user owns the document
      // For now, we'll allow access
    }
  }

  // Get file info for proper headers
  const fileInfo = await fileService.getFileInfo(filename, type);

  // Set appropriate headers
  res.set({
    'Content-Type': fileInfo.mimetype,
    'Content-Length': fileInfo.size,
    'Content-Disposition': `inline; filename="${fileInfo.originalName || filename}"`
  });

  // Send file
  res.sendFile(filePath);
});

module.exports = {
  uploadAvatar,
  uploadDocuments,
  deleteFile,
  getFileInfo,
  serveFile
};
