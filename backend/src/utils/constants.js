const constants = {
  USER_ROLES: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
  },
  USER_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  },
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
  },
  SCHEDULE_STATUS: {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable'
  },
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file'
  },
  NOTIFICATION_TYPES: {
    APPOINTMENT: 'appointment',
    MESSAGE: 'message',
    SYSTEM: 'system',
    REMINDER: 'reminder',
    APPROVAL: 'approval'
  },
  NOTIFICATION_PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  APPOINTMENT_PURPOSES: [
    { value: 'academic-help', label: 'Academic Help' },
    { value: 'project-discussion', label: 'Project Discussion' },
    { value: 'career-guidance', label: 'Career Guidance' },
    { value: 'exam-preparation', label: 'Exam Preparation' },
    { value: 'research-guidance', label: 'Research Guidance' },
    { value: 'other', label: 'Other' }
  ],
  DEPARTMENTS: [
    'Computer Science',
    'Information Technology',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Business Administration',
    'English Literature'
  ],
  TIME_SLOTS: [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ],
  USER_YEARS: [
    '1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate'
  ],
  FILE_LIMITS: {
    AVATAR: {
      MAX_SIZE: 5 * 1024 * 1024,
      ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif']
    },
    DOCUMENTS: {
      MAX_SIZE: 10 * 1024 * 1024,
      ALLOWED_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ]
    }
  },
  RATE_LIMITS: {
    API: {
      WINDOW_MS: 15 * 60 * 1000,
      MAX_REQUESTS: 100
    },
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000,
      MAX_REQUESTS: 5
    },
    MESSAGES: {
      WINDOW_MS: 1 * 60 * 1000,
      MAX_REQUESTS: 30
    },
    PASSWORD_RESET: {
      WINDOW_MS: 60 * 60 * 1000,
      MAX_REQUESTS: 3
    }
  },
  JWT: {
    ACCESS_TOKEN_EXPIRE: '15m',
    REFRESH_TOKEN_EXPIRE: '7d',
    PASSWORD_RESET_EXPIRE: 10 * 60 * 1000,
    EMAIL_VERIFICATION_EXPIRE: 24 * 60 * 60 * 1000
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  EMAIL_TEMPLATES: {
    WELCOME: 'welcome',
    APPOINTMENT_NOTIFICATION: 'appointment_notification',
    APPOINTMENT_CONFIRMATION: 'appointment_confirmation',
    APPOINTMENT_REMINDER: 'appointment_reminder',
    PASSWORD_RESET: 'password_reset',
    APPROVAL: 'approval',
    REJECTION: 'rejection'
  },
  SOCKET_EVENTS: {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    JOIN_CONVERSATION: 'join_conversation',
    LEAVE_CONVERSATION: 'leave_conversation',
    NEW_MESSAGE: 'new_message',
    MESSAGE_RECEIVED: 'message_received',
    TYPING_START: 'typing_start',
    TYPING_STOP: 'typing_stop',
    USER_TYPING: 'user_typing',
    USER_STOP_TYPING: 'user_stop_typing',
    NEW_NOTIFICATION: 'new_notification',
    NEW_MESSAGE_NOTIFICATION: 'new_message_notification',
    APPOINTMENT_UPDATE: 'appointment_update',
    APPOINTMENT_UPDATED: 'appointment_updated',
    NEW_APPOINTMENT_REQUEST: 'new_appointment_request',
    APPOINTMENT_CONFIRMED: 'appointment_confirmed',
    APPOINTMENT_REJECTED: 'appointment_rejected',
    APPOINTMENT_CANCELLED: 'appointment_cancelled',
    ERROR: 'error'
  },
  MESSAGES: {
    SUCCESS: {
      USER_REGISTERED: 'User registered successfully',
      LOGIN_SUCCESS: 'Login successful',
      LOGOUT_SUCCESS: 'Logout successful',
      PASSWORD_RESET_SENT: 'Password reset email sent',
      PASSWORD_RESET_SUCCESS: 'Password reset successful',
      PROFILE_UPDATED: 'Profile updated successfully',
      APPOINTMENT_CREATED: 'Appointment created successfully',
      APPOINTMENT_UPDATED: 'Appointment updated successfully',
      APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
      MESSAGE_SENT: 'Message sent successfully',
      FILE_UPLOADED: 'File uploaded successfully'
    },
    ERROR: {
      INVALID_CREDENTIALS: 'Invalid email or password',
      USER_NOT_FOUND: 'User not found',
      EMAIL_EXISTS: 'User already exists with this email',
      UNAUTHORIZED: 'Not authorized to access this route',
      FORBIDDEN: 'Access denied',
      VALIDATION_ERROR: 'Validation error',
      SERVER_ERROR: 'Server error occurred',
      FILE_TOO_LARGE: 'File size too large',
      INVALID_FILE_TYPE: 'Invalid file type',
      APPOINTMENT_CONFLICT: 'Time slot is already booked',
      TOKEN_EXPIRED: 'Token expired',
      INVALID_TOKEN: 'Invalid token'
    }
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
  },
  COLLECTIONS: {
    USERS: 'users',
    APPOINTMENTS: 'appointments',
    MESSAGES: 'messages',
    CONVERSATIONS: 'conversations',
    SCHEDULES: 'schedules',
    DEPARTMENTS: 'departments',
    NOTIFICATIONS: 'notifications'
  }
};

module.exports = constants;
