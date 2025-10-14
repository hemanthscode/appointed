export const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const validatePassword = (password) =>
  typeof password === 'string' && password.length >= 8;

export const validateStrongPassword = (password) => {
  if (typeof password !== 'string') return false;
  return (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
    password.length >= 8
  );
};

export const validateForm = (data, rules) => {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = rule.requiredMessage || `${field} is required`;
      continue;
    }
    if (!value) continue;
    if (rule.type === 'email' && !validateEmail(value)) errors[field] = rule.message || 'Invalid email.';
    if (rule.type === 'password' && !validatePassword(value)) errors[field] = rule.message || 'Password too short.';
    if (rule.type === 'strongPassword' && !validateStrongPassword(value))
      errors[field] = rule.message || 'Weak password.';
    if (rule.minLength && value.length < rule.minLength)
      errors[field] = rule.minMessage || `Must be at least ${rule.minLength} chars`;
    if (rule.maxLength && value.length > rule.maxLength)
      errors[field] = rule.maxMessage || `Cannot exceed ${rule.maxLength} chars`;
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateLoginForm = (data) => {
  const rules = {
    email: { required: true, type: 'email', requiredMessage: 'Email required', message: 'Invalid email' },
    password: { required: true, type: 'password', requiredMessage: 'Password required', message: 'Password too short' }
  };
  return validateForm(data, rules);
};

export const validateRegisterForm = (data) => {
  const baseRules = {
    name: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, type: 'email' },
    password: { required: true, type: 'strongPassword' },
    role: { required: true },
    department: { required: true }
  };
  if (data.role === 'student') baseRules.year = { required: true };
  if (data.role === 'teacher') baseRules.subject = { required: true };
  return validateForm(data, baseRules);
};

export const validateAppointment = (data) => {
  const errors = {};
  if (!data.teacher) errors.teacher = 'Teacher is required';
  if (!data.date || isNaN(new Date(data.date).getTime())) errors.date = 'Valid date required';
  if (!data.time || !/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(data.time))
    errors.time = 'Valid time required (e.g., 2:00 PM)';
  const validPurposes = ['academic-help', 'project-discussion', 'career-guidance', 'exam-preparation', 'research-guidance', 'other'];
  if (!validPurposes.includes(data.purpose)) errors.purpose = 'Valid purpose required';
  if (data.message && data.message.length > 500) errors.message = 'Message too long';
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
