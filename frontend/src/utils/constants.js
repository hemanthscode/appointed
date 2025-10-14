export const ROLES = Object.freeze({
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
});

export const APPOINTMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
});

export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  TEACHERS: '/teachers',
  STUDENTS: '/students',
  APPOINTMENTS: '/appointments',
  MESSAGE: '/messages',
  SCHEDULE: '/schedule',
  ADMIN: '/admin',
  REQUESTS: '/requests',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password'
});

// Expand or adjust departments/years/purposes as necessary
export const DEPARTMENTS = Object.freeze([
  'Computer Science', 'Information Technology', 'Electronics Engineering',
  'Mechanical Engineering', 'Civil Engineering', 'Mathematics', 'Physics', 'Chemistry',
  'Business Administration', 'English Literature'
]);

export const TIME_SLOTS = Object.freeze([
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]);

export const PURPOSES = Object.freeze([
  { value: 'academic-help', label: 'Academic Help' },
  { value: 'project-discussion', label: 'Project Discussion' },
  { value: 'career-guidance', label: 'Career Guidance' },
  { value: 'exam-preparation', label: 'Exam Preparation' },
  { value: 'research-guidance', label: 'Research Guidance' },
  { value: 'other', label: 'Other' }
]);

export const USER_YEARS = Object.freeze([
  '1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate'
]);

export const SLOT_STATUS_OPTIONS = Object.freeze([
  { value: 'available', label: 'Available' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'unavailable', label: 'Unavailable' }
]);
