export const STYLES = {
  container: 'min-h-screen bg-black text-white',
  header: 'bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 px-6 py-4',
  card: 'bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800',
  button: {
    primary: 'bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300',
    secondary: 'border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-black transition-all duration-300',
    danger: 'bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all duration-300',
  },
  input: 'w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white',
  badge: {
    success: 'bg-green-900/50 text-green-300',
    warning: 'bg-yellow-900/50 text-yellow-300',
    danger: 'bg-red-900/50 text-red-300',
    info: 'bg-blue-900/50 text-blue-300',
  },
};

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

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
  REQUESTS: '/requests',
};

export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Business Administration",
  "English Literature"
];

export const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM"
];

export const PURPOSES = [
  { value: "academic-help", label: "Academic Help" },
  { value: "project-discussion", label: "Project Discussion" },
  { value: "career-guidance", label: "Career Guidance" },
  { value: "exam-preparation", label: "Exam Preparation" },
  { value: "research-guidance", label: "Research Guidance" },
  { value: "other", label: "Other" }
];

export const USER_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Graduate",
  "Post Graduate"
];

export const SLOT_STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'unavailable', label: 'Unavailable' },
];
