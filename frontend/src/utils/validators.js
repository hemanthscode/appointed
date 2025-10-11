// Validation utilities with strong password criteria

export const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
};

export const validatePassword = (password) =>
  typeof password === 'string' && password.length >= 8;

export const validateStrongPassword = (password) => {
  if (typeof password !== 'string') return false;
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

export const validateForm = (data, rules) => {
  const errors = {};
  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = rule.requiredMessage || `${field} is required`;
      return;
    }
    if (!value) return;

    if (rule.type === 'email' && !validateEmail(value)) {
      errors[field] = rule.message || 'Invalid email address';
    } else if (rule.type === 'password' && !validatePassword(value)) {
      errors[field] = rule.message || 'Password must be at least 8 characters';
    } else if (rule.type === 'strongPassword' && !validateStrongPassword(value)) {
      errors[field] = rule.message || 'Password must include uppercase, lowercase, number, and special character';
    }
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = rule.minMessage || `${field} must be at least ${rule.minLength} characters`;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = rule.maxMessage || `${field} cannot exceed ${rule.maxLength} characters`;
    }
  });
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateLoginForm = (data) => {
  const rules = {
    email: { required: true, type: 'email', requiredMessage: 'Email is required', message: 'Please enter a valid email' },
    password: { required: true, type: 'password', requiredMessage: 'Password is required', message: 'Password must be at least 8 characters' },
  };
  return validateForm(data, rules);
};

export const validateRegisterForm = (data) => {
  const baseRules = {
    name: { required: true, type: 'string', minLength: 2, maxLength: 50, requiredMessage: 'Full name is required', message: 'Name must be 2 to 50 characters' },
    email: { required: true, type: 'email', requiredMessage: 'Email is required', message: 'Please enter a valid email' },
    password: { required: true, type: 'strongPassword', requiredMessage: 'Password is required', message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' },
    role: { required: true, requiredMessage: 'User role is required' },
    department: { required: true, requiredMessage: 'Department is required' },
  };

  if (data.role === 'student') {
    baseRules.year = { required: true, requiredMessage: 'Academic year is required' };
  } else if (data.role === 'teacher') {
    baseRules.subject = { required: true, requiredMessage: 'Subject is required' };
  }

  return validateForm(data, baseRules);
};

export const validateAppointment = (data) => {
  const errors = {};
  if (!data.teacher) errors.teacher = 'Teacher is required';
  if (!data.date || isNaN(new Date(data.date).getTime()))
    errors.date = 'Valid date is required';
  if (!data.time || !/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(data.time))
    errors.time = 'Valid time is required';
  const validPurposes = [
    'academic-help',
    'project-discussion',
    'career-guidance',
    'exam-preparation',
    'research-guidance',
    'other',
  ];
  if (!validPurposes.includes(data.purpose)) errors.purpose = 'Valid purpose is required';
  if (data.message && data.message.length > 500)
    errors.message = 'Message cannot exceed 500 characters';
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateScheduleSlot = (data) => {
  const errors = {};
  if (!data.date || isNaN(new Date(data.date).getTime())) {
    errors.date = 'Valid date is required';
  }
  if (!data.time || !/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)?$/i.test(data.time)) {
    errors.time = 'Valid time required (e.g., 2:00 PM)';
  }
  if (data.status && !['available', 'blocked', 'unavailable'].includes(data.status)) {
    errors.status = 'Invalid status';
  }
  if (data.status === 'blocked' && (!data.blockReason || data.blockReason.trim() === '')) {
    errors.blockReason = 'Block reason is required when status is blocked';
  } else if (data.blockReason && data.blockReason.length > 100) {
    errors.blockReason = 'Block reason must be under 100 characters';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};
export const validateMessage = ({ content }) => {
  const errors = {};
  if (!content || content.trim() === '') {
    errors.content = 'Message cannot be empty';
  } else if (content.length > 2000) {
    errors.content = 'Message cannot exceed 2000 characters';
  }
  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
};
