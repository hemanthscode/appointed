// Animation variants for Framer Motion
export const ANIMATIONS = {
  fadeInUp: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },
  
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  scaleOnHover: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  },
  
  slideInFromLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  }
};

// Common styling classes
export const STYLES = {
  container: "min-h-screen bg-black text-white",
  header: "bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 px-6 py-4",
  card: "bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800",
  button: {
    primary: "bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300",
    secondary: "border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-black transition-all duration-300",
    danger: "bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all duration-300"
  },
  input: "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white",
  badge: {
    success: "bg-green-900/50 text-green-300",
    warning: "bg-yellow-900/50 text-yellow-300", 
    danger: "bg-red-900/50 text-red-300",
    info: "bg-blue-900/50 text-blue-300"
  }
};

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

// Appointment statuses
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Navigation routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TEACHERS: '/teachers',
  APPOINTMENTS: '/appointments',
  MESSAGES: '/messages',
  PROFILE: '/profile',
  ADMIN: '/admin',
  SCHEDULE: '/schedule',
  REQUESTS: '/requests'
};

// API endpoints (ready for backend integration)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    TEACHERS: '/api/users/teachers',
    STUDENTS: '/api/users/students'
  },
  APPOINTMENTS: {
    LIST: '/api/appointments',
    CREATE: '/api/appointments',
    UPDATE: '/api/appointments',
    DELETE: '/api/appointments',
    APPROVE: '/api/appointments/approve',
    REJECT: '/api/appointments/reject'
  },
  MESSAGES: {
    CONVERSATIONS: '/api/messages/conversations',
    SEND: '/api/messages/send',
    HISTORY: '/api/messages/history'
  },
  ADMIN: {
    USERS: '/api/admin/users',
    APPROVALS: '/api/admin/approvals',
    SETTINGS: '/api/admin/settings'
  }
};

// Form validation rules
export const VALIDATION_RULES = {
  EMAIL: {
    required: true,
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  },
  PASSWORD: {
    required: true,
    validate: (value) => value.length >= 8,
    message: 'Password must be at least 8 characters long'
  },
  NAME: {
    required: true,
    validate: (value) => value.trim().length >= 2,
    message: 'Name must be at least 2 characters long'
  },
  PHONE: {
    required: false,
    validate: (value) => !value || /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, '')),
    message: 'Please enter a valid phone number'
  }
};
