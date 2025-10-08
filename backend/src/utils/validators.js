const validator = require('validator');

const validators = {
  // User validation
  validateUser: (userData) => {
    const errors = [];
    const { name, email, password, role, department } = userData;

    // Name validation
    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    if (name && name.length > 50) {
      errors.push('Name cannot exceed 50 characters');
    }

    // Email validation
    if (!email) {
      errors.push('Email is required');
    } else if (!validator.isEmail(email)) {
      errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!password) {
      errors.push('Password is required');
    } else {
      const passwordValidation = validators.validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    // Role validation
    const validRoles = ['student', 'teacher', 'admin'];
    if (!role || !validRoles.includes(role)) {
      errors.push('Valid role is required (student, teacher, admin)');
    }

    // Department validation
    if (!department || department.trim().length < 2) {
      errors.push('Department is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validatePassword: (password) => {
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password cannot exceed 128 characters');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain repeated characters');
    }

    const commonPasswords = [
      'password', '12345678', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a stronger password');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Appointment validation
  validateAppointment: (appointmentData) => {
    const errors = [];
    const { teacher, date, time, purpose } = appointmentData;

    // Teacher validation
    if (!teacher) {
      errors.push('Teacher is required');
    }

    // Date validation
    if (!date) {
      errors.push('Date is required');
    } else {
      const appointmentDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(appointmentDate.getTime())) {
        errors.push('Invalid date format');
      } else if (appointmentDate < today) {
        errors.push('Appointment date cannot be in the past');
      } else if (appointmentDate > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
        errors.push('Appointment date cannot be more than 30 days in advance');
      }
    }

    // Time validation
    if (!time) {
      errors.push('Time is required');
    } else {
      const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
      if (!timeRegex.test(time)) {
        errors.push('Invalid time format (use format: 2:00 PM)');
      }
    }

    // Purpose validation
    const validPurposes = [
      'academic-help', 'project-discussion', 'career-guidance',
      'exam-preparation', 'research-guidance', 'other'
    ];
    if (!purpose || !validPurposes.includes(purpose)) {
      errors.push('Valid purpose is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Message validation
  validateMessage: (messageData) => {
    const errors = [];
    const { content, receiver } = messageData;

    // Content validation
    if (!content || content.trim().length === 0) {
      errors.push('Message content is required');
    } else if (content.length > 1000) {
      errors.push('Message cannot exceed 1000 characters');
    }

    // Receiver validation
    if (!receiver) {
      errors.push('Message receiver is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Schedule validation
  validateSchedule: (scheduleData) => {
    const errors = [];
    const { date, time, status } = scheduleData;

    // Date validation
    if (!date) {
      errors.push('Date is required');
    } else {
      const scheduleDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(scheduleDate.getTime())) {
        errors.push('Invalid date format');
      } else if (scheduleDate < today) {
        errors.push('Schedule date cannot be in the past');
      }
    }

    // Time validation
    if (!time) {
      errors.push('Time is required');
    } else {
      const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
      if (!timeRegex.test(time)) {
        errors.push('Invalid time format (use format: 2:00 PM)');
      }
    }

    // Status validation
    const validStatuses = ['available', 'booked', 'blocked', 'unavailable'];
    if (status && !validStatuses.includes(status)) {
      errors.push('Invalid status');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // File validation
  validateFile: (file, options = {}) => {
    const errors = [];
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
      maxFiles = 1
    } = options;

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    // File size validation
    if (file.size > maxSize) {
      errors.push(`File size cannot exceed ${Math.round(maxSize / (1024 * 1024))}MB`);
    }

    // File type validation
    if (!allowedTypes.includes(file.mimetype)) {
      const allowedExtensions = allowedTypes.map(type => type.split('/')[1]).join(', ');
      errors.push(`Invalid file type. Allowed types: ${allowedExtensions}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Profile validation
  validateProfile: (profileData) => {
    const errors = [];
    const { name, phone, bio, address } = profileData;

    // Name validation (optional for profile update)
    if (name !== undefined) {
      if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
      if (name.length > 50) {
        errors.push('Name cannot exceed 50 characters');
      }
    }

    // Phone validation
    if (phone !== undefined && phone) {
      if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
        errors.push('Please provide a valid phone number');
      }
    }

    // Bio validation
    if (bio !== undefined && bio) {
      if (bio.length > 500) {
        errors.push('Bio cannot exceed 500 characters');
      }
    }

    // Address validation
    if (address !== undefined && address) {
      if (address.length > 200) {
        errors.push('Address cannot exceed 200 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Search validation
  validateSearch: (searchParams) => {
    const errors = [];
    const { query, page, limit, sort } = searchParams;

    // Query validation
    if (query && query.length < 3) {
      errors.push('Search query must be at least 3 characters long');
    }

    // Page validation
    if (page !== undefined) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        errors.push('Page must be a positive number');
      }
    }

    // Limit validation
    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        errors.push('Limit must be between 1 and 100');
      }
    }

    // Sort validation
    if (sort !== undefined) {
      const validSortFields = ['name', 'date', 'createdAt', 'updatedAt', 'rating'];
      const sortField = sort.replace(/^-/, ''); // Remove minus sign for desc sort
      if (!validSortFields.includes(sortField)) {
        errors.push('Invalid sort field');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // ID validation
  validateObjectId: (id) => {
    if (!id) {
      return { isValid: false, errors: ['ID is required'] };
    }

    // MongoDB ObjectId validation (24 character hex string)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    const isValid = objectIdRegex.test(id);

    return {
      isValid,
      errors: isValid ? [] : ['Invalid ID format']
    };
  },

  // Bulk operation validation
  validateBulkOperation: (bulkData) => {
    const errors = [];
    const { ids, operation } = bulkData;

    // IDs validation
    if (!Array.isArray(ids) || ids.length === 0) {
      errors.push('IDs array is required');
    } else {
      ids.forEach((id, index) => {
        const idValidation = validators.validateObjectId(id);
        if (!idValidation.isValid) {
          errors.push(`Invalid ID at index ${index}`);
        }
      });
    }

    // Operation validation
    const validOperations = ['activate', 'deactivate', 'suspend', 'delete'];
    if (!operation || !validOperations.includes(operation)) {
      errors.push('Valid operation is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Rating validation
  validateRating: (ratingData) => {
    const errors = [];
    const { rating, feedback } = ratingData;

    // Rating validation
    if (rating === undefined || rating === null) {
      errors.push('Rating is required');
    } else {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        errors.push('Rating must be between 1 and 5');
      }
    }

    // Feedback validation (optional)
    if (feedback !== undefined && feedback) {
      if (feedback.length > 500) {
        errors.push('Feedback cannot exceed 500 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Settings validation
  validateSettings: (settings) => {
    const errors = [];

    if (!settings || typeof settings !== 'object') {
      errors.push('Settings object is required');
      return { isValid: false, errors };
    }

    // Validate specific setting categories if they exist
    if (settings.appointments) {
      const { maxAdvanceBookingDays, minAdvanceBookingHours, defaultAppointmentDuration } = settings.appointments;
      
      if (maxAdvanceBookingDays !== undefined) {
        const days = parseInt(maxAdvanceBookingDays);
        if (isNaN(days) || days < 1 || days > 365) {
          errors.push('Max advance booking days must be between 1 and 365');
        }
      }

      if (minAdvanceBookingHours !== undefined) {
        const hours = parseInt(minAdvanceBookingHours);
        if (isNaN(hours) || hours < 0 || hours > 72) {
          errors.push('Min advance booking hours must be between 0 and 72');
        }
      }

      if (defaultAppointmentDuration !== undefined) {
        const duration = parseInt(defaultAppointmentDuration);
        if (isNaN(duration) || duration < 15 || duration > 240) {
          errors.push('Default appointment duration must be between 15 and 240 minutes');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generic validation helper
  validate: (data, rules) => {
    const errors = [];

    Object.keys(rules).forEach(field => {
      const rule = rules[field];
      const value = data[field];

      // Required field check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.label || field} is required`);
        return;
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null) {
        return;
      }

      // Type validation
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${rule.label || field} must be of type ${rule.type}`);
      }

      // String validations
      if (rule.type === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.label || field} must be at least ${rule.minLength} characters long`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.label || field} cannot exceed ${rule.maxLength} characters`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${rule.label || field} format is invalid`);
        }
      }

      // Number validations
      if (rule.type === 'number') {
        const num = parseFloat(value);
        if (isNaN(num)) {
          errors.push(`${rule.label || field} must be a valid number`);
        } else {
          if (rule.min !== undefined && num < rule.min) {
            errors.push(`${rule.label || field} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && num > rule.max) {
            errors.push(`${rule.label || field} cannot exceed ${rule.max}`);
          }
        }
      }

      // Array validations
      if (rule.type === 'array') {
        if (!Array.isArray(value)) {
          errors.push(`${rule.label || field} must be an array`);
        } else {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.label || field} must have at least ${rule.minLength} items`);
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.label || field} cannot have more than ${rule.maxLength} items`);
          }
        }
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${rule.label || field} must be one of: ${rule.enum.join(', ')}`);
      }

      // Custom validator
      if (rule.validator && typeof rule.validator === 'function') {
        const customResult = rule.validator(value);
        if (customResult !== true) {
          errors.push(customResult || `${rule.label || field} is invalid`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = validators;
