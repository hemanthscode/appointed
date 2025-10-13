const fs = require('fs').promises;
const path = require('path');

const fileService = {
  async deleteFile(filename, folder = '') {
    try {
      const filePath = path.join(__dirname, '../../uploads', folder, filename);
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.info(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.warn(`File deletion error: ${error.message}`);
      return false;
    }
  },

  async fileExists(filename, folder = '') {
    try {
      const filePath = path.join(__dirname, '../../uploads', folder, filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  async getFileInfo(filename, folder = '') {
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
        mimetype: this.getFileType(filename)
      };
    } catch {
      return null;
    }
  },

  getFileType(filename) {
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

  async cleanupOldFiles(folder = '', olderThanDays = 30) {
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

      console.info(`Cleaned up ${deletedCount} old files from ${folder || 'uploads'}`);
      return deletedCount;
    } catch (error) {
      console.warn(`File cleanup error: ${error.message}`);
      return 0;
    }
  },

  async getDirectorySize(folder = '') {
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
      console.warn(`Get directory size error: ${error.message}`);
      return 0;
    }
  },

  async backupFile(filename, folder = '') {
    try {
      const sourcePath = path.join(__dirname, '../../uploads', folder, filename);
      const backupFolder = path.join(__dirname, '../../uploads', 'backups');
      await fs.mkdir(backupFolder, { recursive: true });
      const backupPath = path.join(backupFolder, `${Date.now()}_${filename}`);
      await fs.copyFile(sourcePath, backupPath);
      console.info(`File backed up: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.warn(`File backup error: ${error.message}`);
      return null;
    }
  }
};

module.exports = fileService;
