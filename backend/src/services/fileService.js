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
  }
};

module.exports = fileService;
