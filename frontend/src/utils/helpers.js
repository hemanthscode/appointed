// Date and Time utilities
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatTime = (time) => {
  return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDateTime = (date, time) => {
  const dateObj = new Date(`${date} ${time}`);
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const isToday = (date) => {
  const today = new Date().toDateString();
  const checkDate = new Date(date).toDateString();
  return today === checkDate;
};

export const isFuture = (date, time) => {
  const now = new Date();
  const appointmentDate = new Date(`${date} ${time}`);
  return appointmentDate > now;
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now - targetDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return formatDate(date, { month: 'short', day: 'numeric' });
};

// Text utilities
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text) => {
  if (!text) return '';
  return text.split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

// Array utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const filterBySearch = (items, searchTerm, fields = []) => {
  if (!searchTerm || !Array.isArray(items)) return items;
  
  const term = searchTerm.toLowerCase().trim();
  if (!term) return items;
  
  return items.filter(item => 
    fields.some(field => {
      const value = getNestedValue(item, field);
      return String(value).toLowerCase().includes(term);
    })
  );
};

export const sortByField = (items, field, direction = 'asc') => {
  if (!Array.isArray(items)) return [];
  
  return [...items].sort((a, b) => {
    const aVal = getNestedValue(a, field);
    const bVal = getNestedValue(b, field);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const groupBy = (items, field) => {
  if (!Array.isArray(items)) return {};
  
  return items.reduce((groups, item) => {
    const key = getNestedValue(item, field);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
};

export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Object utilities
export const removeEmptyFields = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const copy = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }
};

// URL utilities
export const buildQueryString = (params) => {
  const cleaned = removeEmptyFields(params);
  const query = new URLSearchParams(cleaned).toString();
  return query ? `?${query}` : '';
};

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

// Local storage utilities
export const safeParseJSON = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export const safeStringifyJSON = (obj, fallback = '{}') => {
  try {
    return JSON.stringify(obj);
  } catch {
    return fallback;
  }
};

// Status utilities
export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'text-yellow-300 bg-yellow-900/50',
    confirmed: 'text-green-300 bg-green-900/50',
    completed: 'text-blue-300 bg-blue-900/50',
    rejected: 'text-red-300 bg-red-900/50',
    cancelled: 'text-gray-300 bg-gray-900/50',
    active: 'text-green-300 bg-green-900/50',
    inactive: 'text-gray-300 bg-gray-900/50',
    available: 'text-green-300 bg-green-900/50',
    busy: 'text-red-300 bg-red-900/50',
    blocked: 'text-red-300 bg-red-900/50'
  };
  
  return statusColors[status?.toLowerCase()] || 'text-gray-300 bg-gray-900/50';
};

export const getStatusVariant = (status) => {
  const statusVariants = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'info',
    rejected: 'danger',
    cancelled: 'danger',
    active: 'success',
    inactive: 'danger',
    available: 'success',
    busy: 'danger',
    blocked: 'danger'
  };
  
  return statusVariants[status?.toLowerCase()] || 'info';
};

// Number utilities
export const formatNumber = (num, options = {}) => {
  if (typeof num !== 'number') return '0';
  return new Intl.NumberFormat('en-US', options).format(num);
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

// Event utilities
export const stopPropagation = (e) => {
  e.stopPropagation();
  e.preventDefault();
};

// File utilities
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Error utilities
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

// Random utilities
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const randomFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Async utilities
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retryAsync = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retryAsync(fn, retries - 1, delay);
    }
    throw error;
  }
};
