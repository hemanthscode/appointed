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
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
};

export const SOCKET_EVENTS = {
  NEW_NOTIFICATION: 'new_notification',
  NEW_MESSAGE: 'new_message',
  // Add more as needed
};

export const APPOINTMENT_PURPOSES = [
  { value: 'academic-help', label: 'Academic Help' },
  { value: 'project-discussion', label: 'Project Discussion' },
  { value: 'career-guidance', label: 'Career Guidance' },
  { value: 'exam-preparation', label: 'Exam Preparation' },
  { value: 'research-guidance', label: 'Research Guidance' },
  { value: 'other', label: 'Other' },
];

// Add other enums and constants here as shared by backend
export const DEPARTMENT_OPTIONS = [
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Electronics Engineering', label: 'Electronics Engineering' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'English Literature', label: 'English Literature' },
];

// For dropdowns used in RegisterForm
export const ROLE_OPTIONS = [
  { value: USER_ROLES.STUDENT, label: 'Student' },
  { value: USER_ROLES.TEACHER, label: 'Teacher' },
];


export const SUBJECT_OPTIONS = [
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Physics', value: 'Physics' },
  { label: 'Chemistry', value: 'Chemistry' },
  { label: 'Programming', value: 'Programming' },
];

// Landing Page Content
export const LANDING_PAGE_CONTENT = {
  hero: {
    title: "Simplify Academic Appointments",
    subtitle: "Connect students and teachers seamlessly with our intelligent appointment booking system. Schedule, manage, and communicate - all in one place.",
    cta: {
      primary: "Start Booking",
      secondary: "Watch Demo"
    }
  },
  features: [
    {
      title: "Smart Scheduling",
      description: "Intelligent appointment booking with conflict detection and automatic reminders for seamless scheduling.",
      icon: "CalendarDays"
    },
    {
      title: "Instant Messaging",
      description: "Real-time communication between students and teachers with purpose-driven appointment requests.",
      icon: "MessageSquare"
    },
    {
      title: "Approval System",
      description: "Teachers can approve, reschedule, or cancel appointments with detailed reasoning and feedback.",
      icon: "UserCheck"
    },
    {
      title: "Admin Control",
      description: "Comprehensive admin panel for managing users, teachers, departments, and system-wide settings.",
      icon: "Shield"
    },
    {
      title: "Time Management",
      description: "Optimize time slots, avoid conflicts, and maximize productivity for both students and educators.",
      icon: "Clock"
    },
    {
      title: "Academic Focus",
      description: "Purpose-built for educational institutions with subject-specific booking and department organization.",
      icon: "GraduationCap"
    }
  ],
  steps: [
    {
      step: "01",
      title: "Register & Login",
      description: "Students and teachers create accounts with department-specific access and admin approval for secure authentication."
    },
    {
      step: "02",
      title: "Search & Book",
      description: "Students search for teachers by department, subject, or availability and send appointment requests with purpose and timing."
    },
    {
      step: "03",
      title: "Approve & Meet",
      description: "Teachers review requests, approve or suggest alternatives, and both parties receive confirmations and reminders."
    }
  ],
  benefits: [
    {
      title: "Reduce Wait Times",
      description: "Eliminate long queues and uncertainty with structured appointment scheduling that respects everyone's time.",
      benefits: ["No more waiting in lines", "Predictable schedules", "Better time management"]
    },
    {
      title: "Increase Efficiency",
      description: "Optimize resource allocation and improve the overall productivity of academic interactions and consultations.",
      benefits: ["Higher appointment completion", "Better resource utilization", "Streamlined processes"]
    },
    {
      title: "Enhance Communication",
      description: "Foster better student-teacher relationships through structured communication and clear appointment purposes.",
      benefits: ["Clear communication channels", "Purpose-driven meetings", "Follow-up capabilities"]
    },
    {
      title: "Administrative Control",
      description: "Empower administrators with comprehensive oversight, analytics, and management capabilities for the entire system.",
      benefits: ["Complete system oversight", "User management tools", "Performance analytics"]
    }
  ]
};

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