const validator = require('validator');

const validators = {
  validateUser(userData) {
    const errors = [];
    const { name, email, password, role, department } = userData;

    if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters long');
    if (name && name.length > 50) errors.push('Name cannot exceed 50 characters');

    if (!email) errors.push('Email is required');
    else if (!validator.isEmail(email)) errors.push('Please provide a valid email address');

    if (!password) errors.push('Password is required');
    else {
      const { isValid, errors: pwErrors } = this.validatePassword(password);
      if (!isValid) errors.push(...pwErrors);
    }

    const validRoles = ['student', 'teacher', 'admin'];
    if (!role || !validRoles.includes(role)) errors.push('Valid role is required (student, teacher, admin)');

    if (!department || department.trim().length < 2) errors.push('Department is required');

    return { isValid: errors.length === 0, errors };
  },

  validatePassword(password) {
    const errors = [];
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (password.length > 128) errors.push('Password cannot exceed 128 characters');
    if (!/(?=.*[a-z])/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/(?=.*[A-Z])/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/(?=.*\d)/.test(password)) errors.push('Password must contain at least one number');
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) errors.push('Password must contain at least one special character');
    if (/(.)\1{2,}/.test(password)) errors.push('Password cannot contain repeated characters');

    const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123', 'admin', 'letmein', 'welcome'];
    if (commonPasswords.includes(password.toLowerCase())) errors.push('Password is too common, please choose a stronger password');

    return { isValid: errors.length === 0, errors };
  },

  validateAppointment(appointmentData) {
    const errors = [];
    const { teacher, date, time, purpose } = appointmentData;
    if (!teacher) errors.push('Teacher is required');

    if (!date) errors.push('Date is required');
    else {
      const apptDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(apptDate.getTime())) errors.push('Invalid date format');
      else if (apptDate < today) errors.push('Appointment date cannot be in the past');
      else if (apptDate > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) errors.push('Appointment cannot be more than 30 days in advance');
    }

    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    if (!time) errors.push('Time is required');
    else if (!timeRegex.test(time)) errors.push('Invalid time format (use: 2:00 PM)');

    const validPurposes = ['academic-help', 'project-discussion', 'career-guidance', 'exam-preparation', 'research-guidance', 'other'];
    if (!purpose || !validPurposes.includes(purpose)) errors.push('Valid purpose is required');

    return { isValid: errors.length === 0, errors };
  },

  validateMessage(messageData) {
    const errors = [];
    const { content, receiver } = messageData;
    if (!content || content.trim().length === 0) errors.push('Message content is required');
    else if (content.length > 1000) errors.push('Message cannot exceed 1000 characters');

    if (!receiver) errors.push('Message receiver is required');

    return { isValid: errors.length === 0, errors };
  },

  validateSchedule(scheduleData) {
    const errors = [];
    const { date, time, status } = scheduleData;

    if (!date) errors.push('Date is required');
    else {
      const schedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(schedDate.getTime())) errors.push('Invalid date format');
      else if (schedDate < today) errors.push('Schedule date cannot be in the past');
    }

    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    if (!time) errors.push('Time is required');
    else if (!timeRegex.test(time)) errors.push('Invalid time format (use: 2:00 PM)');

    const validStatuses = ['available', 'booked', 'blocked', 'unavailable'];
    if (status && !validStatuses.includes(status)) errors.push('Invalid status');

    return { isValid: errors.length === 0, errors };
  },

  validateFile(file, options = {}) {
    const errors = [];
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxFiles = 1 } = options;

    if (!file) return { isValid: false, errors: ['File is required'] };

    if (file.size > maxSize) errors.push(`File size cannot exceed ${Math.round(maxSize / (1024 * 1024))}MB`);
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  },

  validateProfile(profileData) {
    const errors = [];
    const { name, phone, bio, address } = profileData;

    if (name !== undefined) {
      if (name.trim().length < 2) errors.push('Name must be at least 2 characters long');
      if (name.length > 50) errors.push('Name cannot exceed 50 characters');
    }

    if (phone !== undefined && phone && !validator.isMobilePhone(phone, 'any')) {
      errors.push('Please provide a valid phone number');
    }

    if (bio !== undefined && bio && bio.length > 500) errors.push('Bio cannot exceed 500 characters');

    if (address !== undefined && address && address.length > 200) errors.push('Address cannot exceed 200 characters');

    return { isValid: errors.length === 0, errors };
  },

  validateSearch(searchParams) {
    const errors = [];
    const { query, page, limit, sort } = searchParams;

    if (query && query.length < 3) errors.push('Search query must be at least 3 characters long');

    if (page !== undefined && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
      errors.push('Page must be a positive number');
    }

    if (limit !== undefined) {
      const lim = parseInt(limit);
      if (isNaN(lim) || lim < 1 || lim > 100) errors.push('Limit must be between 1 and 100');
    }

    if (sort !== undefined) {
      const validSortFields = ['name', 'date', 'createdAt', 'updatedAt', 'rating'];
      const sortField = sort.replace(/^-/, '');
      if (!validSortFields.includes(sortField)) errors.push('Invalid sort field');
    }

    return { isValid: errors.length === 0, errors };
  },

  validateObjectId(id) {
    if (!id) return { isValid: false, errors: ['ID is required'] };

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    const valid = objectIdRegex.test(id);
    return { isValid: valid, errors: valid ? [] : ['Invalid ID format'] };
  },

  validateBulkOperation(bulkData) {
    const errors = [];
    const { ids, operation } = bulkData;

    if (!Array.isArray(ids) || ids.length === 0) errors.push('IDs array is required');
    else ids.forEach((id, idx) => {
      if (!this.validateObjectId(id).isValid) errors.push(`Invalid ID at index ${idx}`);
    });

    const validOps = ['activate', 'deactivate', 'suspend', 'delete'];
    if (!operation || !validOps.includes(operation)) errors.push('Valid operation is required');

    return { isValid: errors.length === 0, errors };
  },

  validateRating(ratingData) {
    const errors = [];
    const { rating, feedback } = ratingData;

    if (rating === undefined || rating === null) errors.push('Rating is required');
    else if (isNaN(parseInt(rating)) || rating < 1 || rating > 5) errors.push('Rating must be between 1 and 5');

    if (feedback !== undefined && feedback && feedback.length > 500) errors.push('Feedback cannot exceed 500 characters');

    return { isValid: errors.length === 0, errors };
  },

  validateSettings(settings) {
    const errors = [];
    if (!settings || typeof settings !== 'object') return { isValid: false, errors: ['Settings object is required'] };

    if (settings.appointments) {
      const { maxAdvanceBookingDays, minAdvanceBookingHours, defaultAppointmentDuration } = settings.appointments;

      if (maxAdvanceBookingDays !== undefined) {
        const days = parseInt(maxAdvanceBookingDays);
        if (isNaN(days) || days < 1 || days > 365) errors.push('Max advance booking days must be between 1 and 365');
      }

      if (minAdvanceBookingHours !== undefined) {
        const hours = parseInt(minAdvanceBookingHours);
        if (isNaN(hours) || hours < 0 || hours > 72) errors.push('Min advance booking hours must be between 0 and 72');
      }

      if (defaultAppointmentDuration !== undefined) {
        const duration = parseInt(defaultAppointmentDuration);
        if (isNaN(duration) || duration < 15 || duration > 240) errors.push('Default appointment duration must be between 15 and 240 minutes');
      }
    }

    return { isValid: errors.length === 0, errors };
  },

  validate(data, rules) {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.label || field} is required`);
        continue;
      }
      if (value === undefined || value === null) continue;

      if (rule.type && typeof value !== rule.type) errors.push(`${rule.label || field} must be of type ${rule.type}`);

      if (rule.type === 'string') {
        if (rule.minLength && value.length < rule.minLength) errors.push(`${rule.label || field} must be at least ${rule.minLength} characters`);
        if (rule.maxLength && value.length > rule.maxLength) errors.push(`${rule.label || field} cannot exceed ${rule.maxLength} characters`);
        if (rule.pattern && !rule.pattern.test(value)) errors.push(`${rule.label || field} format is invalid`);
      }

      if (rule.type === 'number') {
        const num = parseFloat(value);
        if (isNaN(num)) errors.push(`${rule.label || field} must be a valid number`);
        else {
          if (rule.min !== undefined && num < rule.min) errors.push(`${rule.label || field} must be at least ${rule.min}`);
          if (rule.max !== undefined && num > rule.max) errors.push(`${rule.label || field} cannot exceed ${rule.max}`);
        }
      }

      if (rule.type === 'array') {
        if (!Array.isArray(value)) errors.push(`${rule.label || field} must be an array`);
        else {
          if (rule.minLength && value.length < rule.minLength) errors.push(`${rule.label || field} must have at least ${rule.minLength} items`);
          if (rule.maxLength && value.length > rule.maxLength) errors.push(`${rule.label || field} cannot have more than ${rule.maxLength} items`);
        }
      }

      if (rule.enum && !rule.enum.includes(value)) errors.push(`${rule.label || field} must be one of: ${rule.enum.join(', ')}`);

      if (rule.validator && typeof rule.validator === 'function') {
        const customResult = rule.validator(value);
        if (customResult !== true) errors.push(customResult || `${rule.label || field} is invalid`);
      }
    }
    return { isValid: errors.length === 0, errors };
  }
};

module.exports = validators;
