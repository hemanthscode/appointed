export const formatDate = (date, options = { year: 'numeric', month: 'long', day: 'numeric' }) =>
  new Date(date).toLocaleDateString('en-US', options);

export const formatTime = (time) =>
  new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

export const formatDateTime = (date, time) => {
  const dateObj = new Date(`${date} ${time}`);
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const isToday = (date) =>
  new Date(date).toDateString() === new Date().toDateString();

export const isFuture = (date, time) =>
  new Date(`${date} ${time}`) > new Date();

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

export const truncateText = (text, maxLength = 50) =>
  !text ? '' : text.length <= maxLength ? text : text.slice(0, maxLength) + '...';

export const getInitials = (name) =>
  !name
    ? ''
    : name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

export const capitalizeFirst = (text) =>
  !text ? '' : text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

export const capitalizeWords = (text) =>
  !text ? '' : text.split(' ').map((w) => capitalizeFirst(w)).join(' ');

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const getNestedValue = (obj, path) =>
  path.split('.').reduce((current, key) => current?.[key], obj);

export const filterBySearch = (items, searchTerm, fields = []) => {
  if (!searchTerm || !Array.isArray(items)) return items;
  const term = searchTerm.toLowerCase().trim();
  if (!term) return items;
  return items.filter((item) =>
    fields.some((field) =>
      String(getNestedValue(item, field)).toLowerCase().includes(term)
    )
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

export const removeEmptyFields = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null && v !== '')
  );

export const deepClone = (obj) =>
  obj === null || typeof obj !== 'object'
    ? obj
    : Array.isArray(obj)
    ? obj.map(deepClone)
    : Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
      );

export const buildQueryString = (params) => {
  const cleaned = removeEmptyFields(params);
  const query = new URLSearchParams(cleaned).toString();
  return query ? `?${query}` : '';
};

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

export const getStatusColor = (status) => {
  const colors = {
    pending: 'text-yellow-300 bg-yellow-900/50',
    confirmed: 'text-green-300 bg-green-900/50',
    completed: 'text-blue-300 bg-blue-900/50',
    rejected: 'text-red-300 bg-red-900/50',
    cancelled: 'text-gray-300 bg-gray-900/50',
    active: 'text-green-300 bg-green-900/50',
    inactive: 'text-gray-300 bg-gray-900/50',
    available: 'text-green-300 bg-green-900/50',
    busy: 'text-red-300 bg-red-900/50',
    blocked: 'text-red-300 bg-red-900/50',
  };
  return colors[status?.toLowerCase()] || 'text-gray-300 bg-gray-900/50';
};

export const getStatusVariant = (status) => {
  const variants = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'info',
    rejected: 'danger',
    cancelled: 'danger',
    active: 'success',
    inactive: 'danger',
    available: 'success',
    busy: 'danger',
    blocked: 'danger',
  };
  return variants[status?.toLowerCase()] || 'info';
};

export const formatNumber = (num, options = {}) =>
  typeof num !== 'number' ? '0' : new Intl.NumberFormat('en-US', options).format(num);

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
