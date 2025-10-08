const constants = {
  // User roles
  USER_ROLES: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
  },

  // User status
  USER_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  },

  // Appointment status
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
  },

  // Schedule status
  SCHEDULE_STATUS: {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable'
  },

  // Message types
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file'
  },

  // Notification types
  NOTIFICATION_TYPES: {
    APPOINTMENT: 'appointment',
    MESSAGE: 'message',
    SYSTEM: 'system',
    REMINDER: 'reminder',
    APPROVAL: 'approval'
  },

  // Notification priorities
  NOTIFICATION_PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  // Appointment purposes
  APPOINTMENT_PURPOSES: [
    {
      value: 'academic-help',
      label: 'Academic Help'
    },
    {
      value: 'project-discussion',
      label: 'Project Discussion'
    },
    {
      value: 'career-guidance',
      label: 'Career Guidance'
    },
    {
      value: 'exam-preparation',
      label: 'Exam Preparation'
    },
    {
      value: 'research-guidance',
      label: 'Research Guidance'
    },
    {
      value: 'other',
      label: 'Other'
    }
  ],

  // Departments
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

  // Time slots
  TIME_SLOTS: [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM'
  ],

  // User years (for students)
  USER_YEARS: [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Graduate',
    'Post Graduate'
  ],

  // File upload limits
  FILE_LIMITS: {
    AVATAR: {
      MAX_SIZE: 5 * 1024 * 1024, // 5MB
      ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif']
    },
    DOCUMENTS: {
      MAX_SIZE: 10 * 1024 * 1024, // 10MB
      ALLOWED_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ]
    }
  },

  // Rate limiting
  RATE_LIMITS: {
    API: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100
    },
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 5
    },
    MESSAGES: {
      WINDOW_MS: 1 * 60 * 1000, // 1 minute
      MAX_REQUESTS: 30
    },
    PASSWORD_RESET: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_REQUESTS: 3
    }
  },

  // JWT settings
  JWT: {
    ACCESS_TOKEN_EXPIRE: '15m',
    REFRESH_TOKEN_EXPIRE: '7d',
    PASSWORD_RESET_EXPIRE: 10 * 60 * 1000, // 10 minutes
    EMAIL_VERIFICATION_EXPIRE: 24 * 60 * 60 * 1000 // 24 hours
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // Email templates
  EMAIL_TEMPLATES: {
    WELCOME: 'welcome',
    APPOINTMENT_NOTIFICATION: 'appointment_notification',
    APPOINTMENT_CONFIRMATION: 'appointment_confirmation',
    APPOINTMENT_REMINDER: 'appointment_reminder',
    PASSWORD_RESET: 'password_reset',
    APPROVAL: 'approval',
    REJECTION: 'rejection'
  },

  // Socket events
  SOCKET_EVENTS: {
    // Connection events
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    
    // Message events
    JOIN_CONVERSATION: 'join_conversation',
    LEAVE_CONVERSATION: 'leave_conversation',
    NEW_MESSAGE: 'new_message',
    MESSAGE_RECEIVED: 'message_received',
    TYPING_START: 'typing_start',
    TYPING_STOP: 'typing_stop',
    USER_TYPING: 'user_typing',
    USER_STOP_TYPING: 'user_stop_typing',
    
    // Notification events
    NEW_NOTIFICATION: 'new_notification',
    NEW_MESSAGE_NOTIFICATION: 'new_message_notification',
    
    // Appointment events
    APPOINTMENT_UPDATE: 'appointment_update',
    APPOINTMENT_UPDATED: 'appointment_updated',
    NEW_APPOINTMENT_REQUEST: 'new_appointment_request',
    APPOINTMENT_CONFIRMED: 'appointment_confirmed',
    APPOINTMENT_REJECTED: 'appointment_rejected',
    APPOINTMENT_CANCELLED: 'appointment_cancelled',
    
    // Error events
    ERROR: 'error'
  },

  // Response messages
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

  // HTTP status codes
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

  // Database collection names
  COLLECTIONS: {
    USERS: 'users',
    APPOINTMENTS: 'appointments',
    MESSAGES: 'messages',
    CONVERSATIONS: 'conversations',
    SCHEDULES: 'schedules',
    DEPARTMENTS: 'departments',
    NOTIFICATIONS: 'notifications'
  },

  // Cache keys
  CACHE_KEYS: {
    USER_PROFILE: 'user_profile',
    TEACHER_LIST: 'teacher_list',
    DEPARTMENT_LIST: 'department_list',
    TIME_SLOTS: 'time_slots',
    APPOINTMENT_PURPOSES: 'appointment_purposes'
  },

  // Regular expressions
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    TIME_12H: /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
    MONGODB_OBJECTID: /^[0-9a-fA-F]{24}$/,
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
  },

  // Environment
  NODE_ENV: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test'
  },

  // Default settings
  DEFAULT_SETTINGS: {
    appointments: {
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      defaultAppointmentDuration: 60,
      allowStudentCancellation: true,
      requireTeacherApproval: true
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      reminderHours: 24
    },
    security: {
      maxLoginAttempts: 5,
      sessionTimeout: 1440, // minutes
      requirePasswordChange: false,
      passwordMinLength: 8
    }
  }
};

module.exports = constants;
