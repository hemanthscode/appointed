const crypto = require('crypto');

const helpers = {
  // Date and time utilities
  formatDate: (date, format = 'YYYY-MM-DD') => {
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
      'DD MMM YYYY': d.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    };

    return formats[format] || formats['YYYY-MM-DD'];
  },

  formatTime: (date, format12Hour = true) => {
    if (!date) return null;
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    return d.toLocaleTimeString('en-US', {
      hour12: format12Hour,
      hour: 'numeric',
      minute: '2-digit'
    });
  },

  getRelativeTime: (date) => {
    if (!date) return null;
    
    const now = new Date();
    const target = new Date(date);
    const diffInSeconds = Math.floor((now - target) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return helpers.formatDate(date, 'DD MMM YYYY');
  },

  isToday: (date) => {
    if (!date) return false;
    
    const today = new Date();
    const target = new Date(date);
    
    return today.toDateString() === target.toDateString();
  },

  isTomorrow: (date) => {
    if (!date) return false;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const target = new Date(date);
    
    return tomorrow.toDateString() === target.toDateString();
  },

  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // String utilities
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  capitalizeWords: (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  slugify: (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  },

  truncate: (str, length = 100, suffix = '...') => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
  },

  // Validation utilities
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  },

  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Array utilities
  unique: (array) => {
    return [...new Set(array)];
  },

  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {});
  },

  sortBy: (array, key, direction = 'asc') => {
    return array.sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];
      
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  paginate: (array, page = 1, limit = 10) => {
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
        hasPrev: page > 1
      }
    };
  },

  // Object utilities
  pick: (obj, keys) => {
    const result = {};
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  omit: (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },

  deepMerge: (target, source) => {
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

  // Security utilities
  generateRandomString: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  generateHash: (data, algorithm = 'sha256') => {
    return crypto.createHash(algorithm).update(data).digest('hex');
  },

  maskEmail: (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
    return `${maskedUsername}@${domain}`;
  },

  maskPhone: (phone) => {
    if (!phone) return '';
    if (phone.length <= 4) return phone;
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
  },

  // File utilities
  getFileExtension: (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  },

  getFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  isImageFile: (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = helpers.getFileExtension(filename);
    return imageExtensions.includes(extension);
  },

  isDocumentFile: (filename) => {
    const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    const extension = helpers.getFileExtension(filename);
    return docExtensions.includes(extension);
  },

  // Search utilities
  searchInString: (haystack, needle) => {
    if (!haystack || !needle) return false;
    return haystack.toLowerCase().includes(needle.toLowerCase());
  },

  searchInArray: (array, searchTerm, searchFields = []) => {
    if (!searchTerm) return array;
    
    return array.filter(item => {
      if (searchFields.length === 0) {
        // Search in all string values
        return Object.values(item).some(value => 
          typeof value === 'string' && helpers.searchInString(value, searchTerm)
        );
      }
      
      // Search in specific fields
      return searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && helpers.searchInString(value, searchTerm);
      });
    });
  },

  // Appointment utilities
  getAppointmentStatus: (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    
    if (appointment.status === 'cancelled' || appointment.status === 'rejected') {
      return appointment.status;
    }
    
    if (appointmentDate < now && appointment.status !== 'completed') {
      return 'missed';
    }
    
    return appointment.status;
  },

  getAppointmentStatusColor: (status) => {
    const colors = {
      pending: '#FFA726',    // Orange
      confirmed: '#66BB6A',  // Green
      completed: '#42A5F5',  // Blue
      cancelled: '#EF5350',  // Red
      rejected: '#EF5350',   // Red
      missed: '#AB47BC'      // Purple
    };
    
    return colors[status] || '#9E9E9E'; // Gray default
  },

  // Time slot utilities
  generateTimeSlots: (startTime = '09:00', endTime = '17:00', interval = 60) => {
    const slots = [];
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    
    let current = new Date(start);
    
    while (current < end) {
      slots.push(helpers.formatTime(current, true));
      current.setMinutes(current.getMinutes() + interval);
    }
    
    return slots;
  },

  isTimeSlotAvailable: (timeSlot, bookedSlots = []) => {
    return !bookedSlots.includes(timeSlot);
  },

  // Pagination utilities
  calculatePagination: (total, page = 1, limit = 10) => {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    
    return {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext,
      hasPrev,
      startIndex,
      endIndex,
      showing: `${startIndex + 1}-${endIndex} of ${total}`
    };
  },

  // Error handling utilities
  formatError: (error) => {
    if (typeof error === 'string') {
      return { message: error };
    }
    
    if (error.name && error.message) {
      return {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
    
    return { message: 'An unexpected error occurred' };
  },

  // API response utilities
  successResponse: (data, message = 'Success') => {
    return {
      success: true,
      message,
      data
    };
  },

  errorResponse: (message = 'Error', errors = null) => {
    return {
      success: false,
      message,
      errors
    };
  },

  // Rate limiting utilities
  createRateLimitKey: (identifier, action) => {
    return `rate_limit:${action}:${identifier}`;
  },

  // Cache utilities
  generateCacheKey: (...parts) => {
    return parts.filter(Boolean).join(':');
  }
};

module.exports = helpers;
