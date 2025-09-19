// Email validation
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Password validation
export const validatePassword = (password) => {
  if (!password) return false;
  return password.length >= 8;
};

// Strong password validation
export const validateStrongPassword = (password) => {
  if (!password) return false;
  
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

// Phone validation
export const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Name validation
export const validateName = (name) => {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
};

// Required field validation
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Date validation
export const validateDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

// Future date validation
export const validateFutureDate = (date) => {
  if (!validateDate(date)) return false;
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj >= today;
};

// Time validation (HH:MM AM/PM format)
export const validateTime = (time) => {
  if (!time) return false;
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
  return timeRegex.test(time.trim());
};

// URL validation
export const validateUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// File type validation
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) return false;
  if (allowedTypes.length === 0) return true;
  
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  return allowedTypes.some(type => {
    if (type.includes('/')) {
      // MIME type check
      return fileType === type || fileType.startsWith(type.split('/')[0] + '/');
    } else {
      // Extension check
      return fileName.endsWith('.' + type);
    }
  });
};

// File size validation (in bytes)
export const validateFileSize = (file, maxSize) => {
  if (!file) return false;
  return file.size <= maxSize;
};

// Form validation
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    // Required field check
    if (rule.required && !validateRequired(value)) {
      errors[field] = rule.requiredMessage || `${field} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!validateRequired(value) && !rule.required) {
      return;
    }
    
    // Custom validation function
    if (rule.validate && !rule.validate(value)) {
      errors[field] = rule.message || `${field} is invalid`;
      return;
    }
    
    // Built-in validations
    if (rule.type) {
      let isValid = true;
      
      switch (rule.type) {
        case 'email':
          isValid = validateEmail(value);
          break;
        case 'password':
          isValid = validatePassword(value);
          break;
        case 'strongPassword':
          isValid = validateStrongPassword(value);
          break;
        case 'phone':
          isValid = validatePhone(value);
          break;
        case 'name':
          isValid = validateName(value);
          break;
        case 'date':
          isValid = validateDate(value);
          break;
        case 'futureDate':
          isValid = validateFutureDate(value);
          break;
        case 'time':
          isValid = validateTime(value);
          break;
        case 'url':
          isValid = validateUrl(value);
          break;
        default:
          isValid = true;
      }
      
      if (!isValid) {
        errors[field] = rule.message || `${field} is invalid`;
        return;
      }
    }
    
    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = rule.minMessage || `${field} must be at least ${rule.minLength} characters`;
      return;
    }
    
    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = rule.maxMessage || `${field} must be no more than ${rule.maxLength} characters`;
      return;
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} format is invalid`;
      return;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Specific form validators
export const validateLoginForm = (data) => {
  const rules = {
    email: {
      required: true,
      type: 'email',
      requiredMessage: 'Email is required',
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      type: 'password',
      requiredMessage: 'Password is required',
      message: 'Password must be at least 8 characters long'
    }
  };
  
  return validateForm(data, rules);
};

export const validateRegisterForm = (data) => {
  const rules = {
    fullName: {
      required: true,
      type: 'name',
      requiredMessage: 'Full name is required',
      message: 'Name must be between 2 and 50 characters'
    },
    email: {
      required: true,
      type: 'email',
      requiredMessage: 'Email is required',
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      type: 'password',
      requiredMessage: 'Password is required',
      message: 'Password must be at least 8 characters long'
    },
    userType: {
      required: true,
      requiredMessage: 'User type is required'
    },
    department: {
      required: true,
      requiredMessage: 'Department is required'
    }
  };
  
  return validateForm(data, rules);
};

export const validateAppointmentForm = (data) => {
  const rules = {
    date: {
      required: true,
      type: 'futureDate',
      requiredMessage: 'Date is required',
      message: 'Please select a future date'
    },
    time: {
      required: true,
      requiredMessage: 'Time is required'
    },
    purpose: {
      required: true,
      requiredMessage: 'Purpose is required'
    },
    message: {
      required: false,
      maxLength: 500,
      maxMessage: 'Message must be no more than 500 characters'
    }
  };
  
  return validateForm(data, rules);
};

export const validateProfileForm = (data) => {
  const rules = {
    name: {
      required: true,
      type: 'name',
      requiredMessage: 'Name is required',
      message: 'Name must be between 2 and 50 characters'
    },
    email: {
      required: true,
      type: 'email',
      requiredMessage: 'Email is required',
      message: 'Please enter a valid email address'
    },
    phone: {
      required: false,
      type: 'phone',
      message: 'Please enter a valid phone number'
    },
    bio: {
      required: false,
      maxLength: 500,
      maxMessage: 'Bio must be no more than 500 characters'
    }
  };
  
  return validateForm(data, rules);
};

// Real-time validation helpers
export const getFieldError = (field, value, rules) => {
  const fieldRules = rules[field];
  if (!fieldRules) return null;
  
  const result = validateForm({ [field]: value }, { [field]: fieldRules });
  return result.errors[field] || null;
};

// Password strength checker
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, text: 'Very Weak', color: 'text-red-500' };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  score = Object.values(checks).filter(Boolean).length;
  
  const strengthMap = {
    0: { text: 'Very Weak', color: 'text-red-500' },
    1: { text: 'Weak', color: 'text-red-400' },
    2: { text: 'Fair', color: 'text-yellow-500' },
    3: { text: 'Good', color: 'text-yellow-400' },
    4: { text: 'Strong', color: 'text-green-400' },
    5: { text: 'Very Strong', color: 'text-green-500' }
  };
  
  return {
    score,
    checks,
    ...strengthMap[score]
  };
};
