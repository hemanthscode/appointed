// src/utils/validators.js
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
    const { teacher, date, time, purpose, subject } = appointmentData;

    if (!teacher) errors.push('Teacher is required');
    if (!subject) errors.push('Subject is required');

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

  validateMongoId(field = 'id') {
    return (req, res, next) => {
      const id = req.params[field] || req.body[field] || req.query[field];
      const { isValid, errors } = validators.validateObjectId(id);
      if (!isValid) {
        return res.status(400).json({ success: false, message: errors[0] });
      }
      next();
    };
  },

  validateMongoIdArray(field = 'participants') {
    return (req, res, next) => {
      const ids = req.body[field];
      if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: `${field} must be an array` });
      }
      for (const id of ids) {
        const { isValid } = validators.validateObjectId(id);
        if (!isValid) {
          return res.status(400).json({ success: false, message: `Invalid ID format in ${field}` });
        }
      }
      next();
    };
  },

  validateGroupCreation(req, res, next) {
    const { name, participants } = req.body;
    const errors = [];
    if (!name || name.trim().length === 0) errors.push('Group name is required');
    if (!Array.isArray(participants) || participants.length < 2) errors.push('At least two participants are required');
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    next();
  },

  validateMessage(req, res, next) {
    const { content, receiver } = req.body;
    const errors = [];

    if (!content || content.trim().length === 0) errors.push('Message content is required');
    else if (content.length > 1000) errors.push('Message cannot exceed 1000 characters');
    if (!receiver) errors.push('Message receiver is required');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    next();
  },

  validatePagination(req, res, next) {
    const { page = 1, limit = 10 } = req.query;
    const errors = [];

    if (isNaN(parseInt(page)) || parseInt(page) < 1) errors.push('Page must be a positive integer');
    if (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100) errors.push('Limit must be between 1 and 100');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    next();
  }
};

module.exports = validators;
