const fs = require('fs').promises;
const path = require('path');

const fileService = {
  // Delete file from filesystem
  deleteFile: async (filename, folder = '') => {
    try {
      const filePath = path.join(__dirname, '../../uploads', folder, filename);
      
      // Check if file exists
      await fs.access(filePath);
      
      // Delete file
      await fs.unlink(filePath);
      
      console.log(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
      return false;
    }
  },

  // Check if file exists
  fileExists: async (filename, folder = '') => {
    try {
      const filePath = path.join(__dirname, '../../uploads', folder, filename);
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get file information
  getFileInfo: async (filename, folder = '') => {
    try {
      const filePath = path.join(__dirname, '../../uploads', folder, filename);
      const stats = await fs.stat(filePath);
      
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        path: filePath,
        url: `/uploads/${folder}/${filename}`,
        mimetype: getFileType(filename)
      };
    } catch (error) {
      return null;
    }
  },

  // Get file type based on extension
  getFileType: (filename) => {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };

    return mimeTypes[ext] || 'application/octet-stream';
  },

  // Clean up old files (for maintenance)
  cleanupOldFiles: async (folder = '', olderThanDays = 30) => {
    try {
      const uploadsPath = path.join(__dirname, '../../uploads', folder);
      const files = await fs.readdir(uploadsPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(uploadsPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.birthtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      console.log(`Cleaned up ${deletedCount} old files from ${folder || 'uploads'}`);
      return deletedCount;
    } catch (error) {
      console.error(`Error cleaning up files: ${error.message}`);
      return 0;
    }
  },

  // Get directory size
  getDirectorySize: async (folder = '') => {
    try {
      const uploadsPath = path.join(__dirname, '../../uploads', folder);
      const files = await fs.readdir(uploadsPath);
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(uploadsPath, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      return totalSize;
    } catch (error) {
      console.error(`Error getting directory size: ${error.message}`);
      return 0;
    }
  },

  // Create backup of file
  backupFile: async (filename, folder = '') => {
    try {
      const sourcePath = path.join(__dirname, '../../uploads', folder, filename);
      const backupPath = path.join(__dirname, '../../uploads', 'backups', `${Date.now()}_${filename}`);
      
      // Ensure backup directory exists
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      
      // Copy file
      await fs.copyFile(sourcePath, backupPath);
      
      console.log(`File backed up: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error(`Error backing up file: ${error.message}`);
      return null;
    }
  }
};

// Helper function for getting file type (exported separately)
const getFileType = fileService.getFileType;

module.exports = fileService;
