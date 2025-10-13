const crypto = require('crypto');

const helpers = {
  formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const formats = {
      'YYYY-MM-DD': `${year}-${month}-${day}`,
      'DD/MM/YYYY': `${day}/${month}/${year}`,
      'MM/DD/YYYY': `${month}/${day}/${year}`,
      'YYYY-MM-DD HH:mm': `${year}-${month}-${day} ${hours}:${minutes}`,
      'DD MMM YYYY': d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    return formats[format] || formats['YYYY-MM-DD'];
  },

  formatTime(date, format12Hour = true) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    return d.toLocaleTimeString('en-US', {
      hour12: format12Hour,
      hour: 'numeric',
      minute: '2-digit'
    });
  },

  getRelativeTime(date) {
    if (!date) return null;
    const now = new Date();
    const target = new Date(date);
    const diffSeconds = Math.floor((now - target) / 1000);

    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;

    return helpers.formatDate(date, 'DD MMM YYYY');
  },

  isToday(date) {
    if (!date) return false;
    const today = new Date();
    const target = new Date(date);
    return today.toDateString() === target.toDateString();
  },

  isTomorrow(date) {
    if (!date) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const target = new Date(date);
    return tomorrow.toDateString() === target.toDateString();
  },

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  capitalizeWords(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  },

  slugify(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  },

  truncate(str, length = 100, suffix = '...') {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  },

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  unique(array) {
    return [...new Set(array)];
  },

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  sortBy(array, key, direction = 'asc') {
    return array.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  paginate(array, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return {
      data: array.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: array.length,
        totalPages: Math.ceil(array.length / limit),
        hasNext: endIndex < array.length,
        hasPrev: page > 1,
        showing: `${startIndex + 1}-${Math.min(endIndex, array.length)} of ${array.length}`
      }
    };
  },

  pick(obj, keys) {
    return keys.reduce((res, key) => {
      if (key in obj) res[key] = obj[key];
      return res;
    }, {});
  },

  omit(obj, keys) {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
  },

  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = helpers.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  },

  generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  },

  generateHash(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(data).digest('hex');
  },

  maskEmail(email) {
    if (!email) return '';
    const [username, domain] = email.split('@');
    return username.substring(0, 2) + '*'.repeat(username.length - 2) + '@' + domain;
  },

  maskPhone(phone) {
    if (!phone) return '';
    if (phone.length <= 4) return phone;
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
  },

  getFileExtension(filename) {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  },

  getFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  isImageFile(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(this.getFileExtension(filename));
  },

  isDocumentFile(filename) {
    const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    return docExtensions.includes(this.getFileExtension(filename));
  },

  searchInString(haystack, needle) {
    if (!haystack || !needle) return false;
    return haystack.toLowerCase().includes(needle.toLowerCase());
  },

  searchInArray(array, searchTerm, searchFields = []) {
    if (!searchTerm) return array;
    return array.filter(item => {
      if (searchFields.length === 0) {
        return Object.values(item).some(value => typeof value === 'string' && this.searchInString(value, searchTerm));
      }
      return searchFields.some(field => typeof item[field] === 'string' && this.searchInString(item[field], searchTerm));
    });
  },

  getAppointmentStatus(appointment) {
    const now = new Date();
    const apptDate = new Date(appointment.date);
    if (['cancelled', 'rejected'].includes(appointment.status)) return appointment.status;
    if (apptDate < now && appointment.status !== 'completed') return 'missed';
    return appointment.status;
  },

  getAppointmentStatusColor(status) {
    const colors = {
      pending: '#FFA726',
      confirmed: '#66BB6A',
      completed: '#42A5F5',
      cancelled: '#EF5350',
      rejected: '#EF5350',
      missed: '#AB47BC'
    };
    return colors[status] || '#9E9E9E';
  },

  generateTimeSlots(startTime = '09:00', endTime = '17:00', interval = 60) {
    const slots = [];
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    let current = new Date(start);

    while (current < end) {
      slots.push(this.formatTime(current));
      current.setMinutes(current.getMinutes() + interval);
    }

    return slots;
  },

  isTimeSlotAvailable(timeSlot, bookedSlots = []) {
    return !bookedSlots.includes(timeSlot);
  },

  calculatePagination(total, page = 1, limit = 10) {
    const totalPages = Math.ceil(total / limit);
    return {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      startIndex: (page - 1) * limit,
      endIndex: Math.min(page * limit, total),
      showing: `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}`
    };
  },

  formatError(error) {
    if (typeof error === 'string') return { message: error };
    if (error.name && error.message) {
      return {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
    return { message: 'An unexpected error occurred' };
  },

  successResponse(data, message = 'Success') {
    return { success: true, message, data };
  },

  errorResponse(message = 'Error', errors = null) {
    return { success: false, message, errors };
  },

  createRateLimitKey(identifier, action) {
    return `rate_limit:${action}:${identifier}`;
  },

  generateCacheKey(...parts) {
    return parts.filter(Boolean).join(':');
  }
};

module.exports = helpers;
