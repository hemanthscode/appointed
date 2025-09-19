import { USER_ROLES, APPOINTMENT_STATUS } from './constants';

// Mock Teachers Data
export const MOCK_TEACHERS = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    department: 'Computer Science',
    subject: 'Data Structures',
    rating: 4.8,
    availability: 'Available',
    nextSlot: '2:00 PM Today',
    appointments: 15,
    status: 'active',
    bio: 'Professor with 10+ years experience in Computer Science',
    phone: '+1 (555) 123-4567',
    office: 'CS Building, Room 201'
  },
  {
    id: 2,
    name: 'Prof. Michael Chen',
    email: 'michael.chen@university.edu',
    department: 'Mathematics',
    subject: 'Calculus',
    rating: 4.9,
    availability: 'Busy',
    nextSlot: '10:00 AM Tomorrow',
    appointments: 23,
    status: 'active',
    bio: 'Mathematics professor specializing in advanced calculus',
    phone: '+1 (555) 234-5678',
    office: 'Math Building, Room 305'
  },
  {
    id: 3,
    name: 'Dr. Emily Davis',
    email: 'emily.davis@university.edu',
    department: 'Physics',
    subject: 'Quantum Mechanics',
    rating: 4.7,
    availability: 'Available',
    nextSlot: '4:00 PM Today',
    appointments: 18,
    status: 'active',
    bio: 'Physics researcher with expertise in quantum mechanics',
    phone: '+1 (555) 345-6789',
    office: 'Physics Lab, Room 102'
  },
  {
    id: 4,
    name: 'Dr. Robert Taylor',
    email: 'robert.taylor@university.edu',
    department: 'Chemistry',
    subject: 'Organic Chemistry',
    rating: 4.6,
    availability: 'Available',
    nextSlot: '11:00 AM Today',
    appointments: 12,
    status: 'pending',
    bio: 'Chemistry professor with research in organic compounds',
    phone: '+1 (555) 456-7890',
    office: 'Chemistry Lab, Room 203'
  }
];

// Mock Students Data
export const MOCK_STUDENTS = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@student.edu',
    department: 'Computer Science',
    year: '3rd Year',
    status: 'active',
    appointments: 8,
    phone: '+1 (555) 111-2222',
    address: 'Dorm A, Room 101',
    bio: 'Computer Science student interested in web development',
    joinedDate: '2023-01-15'
  },
  {
    id: 2,
    name: 'Emma Wilson',
    email: 'emma.wilson@student.edu',
    department: 'Mathematics',
    year: '2nd Year',
    status: 'active',
    appointments: 12,
    phone: '+1 (555) 222-3333',
    address: 'Dorm B, Room 205',
    bio: 'Mathematics student with focus on applied mathematics',
    joinedDate: '2023-08-20'
  },
  {
    id: 3,
    name: 'Alex Brown',
    email: 'alex.brown@student.edu',
    department: 'Physics',
    year: '4th Year',
    status: 'pending',
    appointments: 0,
    phone: '+1 (555) 333-4444',
    address: 'Dorm C, Room 301',
    bio: 'Physics student researching quantum computing',
    joinedDate: '2025-09-01'
  },
  {
    id: 4,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@student.edu',
    department: 'Biology',
    year: '1st Year',
    status: 'pending',
    appointments: 0,
    phone: '+1 (555) 444-5555',
    address: 'Dorm A, Room 150',
    bio: 'New biology student interested in marine biology',
    joinedDate: '2025-09-10'
  }
];

// Mock Appointments Data
export const MOCK_APPOINTMENTS = [
  {
    id: 1,
    teacherId: 1,
    studentId: 1,
    teacher: 'Dr. Sarah Johnson',
    student: 'John Smith',
    subject: 'Data Structures',
    date: '2025-09-20',
    time: '2:00 PM',
    duration: '1 hour',
    purpose: 'Academic Help',
    status: APPOINTMENT_STATUS.CONFIRMED,
    message: 'Need help with binary trees implementation',
    createdAt: '2025-09-19 08:30 AM',
    updatedAt: '2025-09-19 09:00 AM'
  },
  {
    id: 2,
    teacherId: 2,
    studentId: 2,
    teacher: 'Prof. Michael Chen',
    student: 'Emma Wilson',
    subject: 'Calculus',
    date: '2025-09-21',
    time: '10:00 AM',
    duration: '1 hour',
    purpose: 'Exam Preparation',
    status: APPOINTMENT_STATUS.PENDING,
    message: 'Preparation for midterm exam',
    createdAt: '2025-09-19 09:15 AM',
    updatedAt: '2025-09-19 09:15 AM'
  },
  {
    id: 3,
    teacherId: 3,
    studentId: 3,
    teacher: 'Dr. Emily Davis',
    student: 'Alex Brown',
    subject: 'Quantum Mechanics',
    date: '2025-09-19',
    time: '4:00 PM',
    duration: '1 hour',
    purpose: 'Project Discussion',
    status: APPOINTMENT_STATUS.COMPLETED,
    message: 'Discuss quantum entanglement research project',
    createdAt: '2025-09-18 02:45 PM',
    updatedAt: '2025-09-19 04:30 PM'
  },
  {
    id: 4,
    teacherId: 4,
    studentId: 1,
    teacher: 'Prof. James Wilson',
    student: 'John Smith',
    subject: 'Chemistry',
    date: '2025-09-22',
    time: '3:00 PM',
    duration: '1 hour',
    purpose: 'Career Guidance',
    status: APPOINTMENT_STATUS.REJECTED,
    message: 'Career options in pharmaceutical research',
    rejectionReason: 'Schedule conflict',
    createdAt: '2025-09-18 01:20 PM',
    updatedAt: '2025-09-18 02:00 PM'
  }
];

// Mock Messages/Conversations Data
export const MOCK_CONVERSATIONS = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    role: 'Teacher',
    lastMessage: 'The assignment deadline has been extended',
    time: '10:30 AM',
    unread: 2,
    online: true,
    avatar: null
  },
  {
    id: 2,
    name: 'Prof. Michael Chen',
    role: 'Teacher',
    lastMessage: 'See you in tomorrow\'s appointment',
    time: 'Yesterday',
    unread: 0,
    online: false,
    avatar: null
  },
  {
    id: 3,
    name: 'Admin System',
    role: 'Admin',
    lastMessage: 'Your appointment has been approved',
    time: '2 days ago',
    unread: 1,
    online: true,
    avatar: null
  }
];

// Mock Messages Data
export const MOCK_MESSAGES = {
  1: [
    { 
      id: 1, 
      senderId: 1, 
      receiverId: 101,
      sender: 'Dr. Sarah Johnson', 
      message: 'Hi! How can I help you today?', 
      time: '10:00 AM', 
      date: '2025-09-19',
      isOwn: false 
    },
    { 
      id: 2, 
      senderId: 101,
      receiverId: 1,
      sender: 'You', 
      message: 'I have a question about the upcoming assignment', 
      time: '10:15 AM', 
      date: '2025-09-19',
      isOwn: true 
    },
    { 
      id: 3, 
      senderId: 1,
      receiverId: 101,
      sender: 'Dr. Sarah Johnson', 
      message: 'The assignment deadline has been extended to next Friday', 
      time: '10:30 AM', 
      date: '2025-09-19',
      isOwn: false 
    }
  ],
  2: [
    { 
      id: 4, 
      senderId: 2,
      receiverId: 101,
      sender: 'Prof. Michael Chen', 
      message: 'Don\'t forget about our appointment tomorrow', 
      time: '3:00 PM', 
      date: '2025-09-18',
      isOwn: false 
    },
    { 
      id: 5, 
      senderId: 101,
      receiverId: 2,
      sender: 'You', 
      message: 'Yes, I\'ll be there at 10 AM', 
      time: '3:05 PM', 
      date: '2025-09-18',
      isOwn: true 
    }
  ]
};

// Mock Appointment Requests (for teachers)
export const MOCK_APPOINTMENT_REQUESTS = [
  {
    id: 1,
    studentId: 1,
    student: 'John Smith',
    studentEmail: 'john.smith@student.edu',
    date: '2025-09-22',
    time: '10:00 AM',
    duration: '1 hour',
    purpose: 'Academic Help',
    message: 'Need help understanding binary search trees implementation',
    status: APPOINTMENT_STATUS.PENDING,
    requestedAt: '2025-09-19 08:30 AM',
    teacherId: 1
  },
  {
    id: 2,
    studentId: 2,
    student: 'Emma Wilson',
    studentEmail: 'emma.wilson@student.edu',
    date: '2025-09-23',
    time: '02:00 PM',
    duration: '1 hour',
    purpose: 'Project Discussion',
    message: 'Want to discuss my final year project on machine learning',
    status: APPOINTMENT_STATUS.PENDING,
    requestedAt: '2025-09-19 09:15 AM',
    teacherId: 1
  },
  {
    id: 3,
    studentId: 3,
    student: 'Alex Brown',
    studentEmail: 'alex.brown@student.edu',
    date: '2025-09-21',
    time: '04:00 PM',
    duration: '1 hour',
    purpose: 'Exam Preparation',
    message: 'Need guidance for upcoming data structures exam',
    status: APPOINTMENT_STATUS.CONFIRMED,
    requestedAt: '2025-09-18 02:45 PM',
    respondedAt: '2025-09-18 03:00 PM',
    teacherId: 1
  }
];

// Mock Schedule Data (for teachers)
export const MOCK_SCHEDULE_SLOTS = [
  {
    id: 1,
    teacherId: 1,
    date: '2025-09-20',
    time: '09:00 AM',
    duration: '1 hour',
    status: 'available',
    studentId: null,
    student: null,
    appointmentId: null
  },
  {
    id: 2,
    teacherId: 1,
    date: '2025-09-20',
    time: '10:00 AM',
    duration: '1 hour',
    status: 'booked',
    studentId: 1,
    student: 'John Smith',
    purpose: 'Academic Help',
    appointmentId: 1
  },
  {
    id: 3,
    teacherId: 1,
    date: '2025-09-20',
    time: '02:00 PM',
    duration: '1 hour',
    status: 'available',
    studentId: null,
    student: null,
    appointmentId: null
  },
  {
    id: 4,
    teacherId: 1,
    date: '2025-09-20',
    time: '03:00 PM',
    duration: '1 hour',
    status: 'blocked',
    studentId: null,
    student: null,
    appointmentId: null,
    reason: 'Faculty meeting'
  }
];

// Dropdown Options
export const DEPARTMENTS = [
  'Computer Science',
  'Mathematics', 
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'English',
  'History',
  'Psychology',
  'Business'
];

export const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

export const APPOINTMENT_PURPOSES = [
  { value: 'academic-help', label: 'Academic Help' },
  { value: 'project-discussion', label: 'Project Discussion' },
  { value: 'career-guidance', label: 'Career Guidance' },
  { value: 'exam-preparation', label: 'Exam Preparation' },
  { value: 'research-guidance', label: 'Research Guidance' },
  { value: 'other', label: 'Other' }
];

export const USER_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Graduate',
  'PhD'
];

// Dashboard Statistics (role-based)
export const MOCK_DASHBOARD_STATS = {
  [USER_ROLES.STUDENT]: [
    { label: 'Upcoming Appointments', value: '3', icon: 'Calendar', color: 'text-blue-400' },
    { label: 'Completed Sessions', value: '12', icon: 'CheckCircle', color: 'text-green-400' },
    { label: 'Pending Requests', value: '1', icon: 'Clock', color: 'text-yellow-400' },
    { label: 'Messages', value: '5', icon: 'MessageSquare', color: 'text-purple-400' }
  ],
  [USER_ROLES.TEACHER]: [
    { label: 'Today\'s Appointments', value: '5', icon: 'Calendar', color: 'text-blue-400' },
    { label: 'Pending Approvals', value: '8', icon: 'Clock', color: 'text-yellow-400' },
    { label: 'Total Students', value: '45', icon: 'Users', color: 'text-green-400' },
    { label: 'Messages', value: '12', icon: 'MessageSquare', color: 'text-purple-400' }
  ],
  [USER_ROLES.ADMIN]: [
    { label: 'Total Teachers', value: '25', icon: 'Users', color: 'text-blue-400' },
    { label: 'Active Students', value: '350', icon: 'Users', color: 'text-green-400' },
    { label: 'Today\'s Appointments', value: '48', icon: 'Calendar', color: 'text-yellow-400' },
    { label: 'Pending Approvals', value: '15', icon: 'Bell', color: 'text-red-400' }
  ]
};

// Admin Approval Requests
export const MOCK_ADMIN_APPROVALS = [
  {
    id: 1,
    type: 'teacher',
    userId: 4,
    name: 'Dr. Robert Taylor',
    email: 'robert.taylor@university.edu',
    department: 'Chemistry',
    requestDate: '2025-09-18',
    documents: ['CV.pdf', 'Certificates.pdf'],
    status: 'pending'
  },
  {
    id: 2,
    type: 'student',
    userId: 4,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@student.edu',
    department: 'Biology',
    year: '1st Year',
    requestDate: '2025-09-17',
    documents: ['ID.pdf', 'Transcript.pdf'],
    status: 'pending'
  }
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
