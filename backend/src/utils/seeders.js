const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Department.deleteMany({});
    await Appointment.deleteMany({});
    await Schedule.deleteMany({});
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️  Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

const seedDepartments = async () => {
  const departments = [
    {
      name: 'Computer Science',
      code: 'CS',
      description: 'Computer Science and Software Engineering Department',
      subjects: [
        { name: 'Data Structures', code: 'CS201', credits: 4 },
        { name: 'Algorithms', code: 'CS301', credits: 4 },
        { name: 'Database Systems', code: 'CS302', credits: 3 },
        { name: 'Web Development', code: 'CS401', credits: 3 },
        { name: 'Machine Learning', code: 'CS501', credits: 4 },
      ],
      isActive: true,
      teacherCount: 0,
      studentCount: 0,
    },
    {
      name: 'Mathematics',
      code: 'MATH',
      description: 'Pure and Applied Mathematics Department',
      subjects: [
        { name: 'Calculus', code: 'MATH101', credits: 4 },
        { name: 'Linear Algebra', code: 'MATH201', credits: 3 },
        { name: 'Statistics', code: 'MATH301', credits: 3 },
        { name: 'Differential Equations', code: 'MATH401', credits: 4 },
      ],
      isActive: true,
      teacherCount: 0,
      studentCount: 0,
    },
    {
      name: 'Physics',
      code: 'PHY',
      description: 'Physics and Applied Physics Department',
      subjects: [
        { name: 'Classical Mechanics', code: 'PHY101', credits: 4 },
        { name: 'Quantum Physics', code: 'PHY301', credits: 4 },
        { name: 'Thermodynamics', code: 'PHY201', credits: 3 },
      ],
      isActive: true,
      teacherCount: 0,
      studentCount: 0,
    },
    {
      name: 'Chemistry',
      code: 'CHEM',
      description: 'Chemistry and Biochemistry Department',
      subjects: [
        { name: 'Organic Chemistry', code: 'CHEM201', credits: 4 },
        { name: 'Physical Chemistry', code: 'CHEM301', credits: 4 },
        { name: 'Analytical Chemistry', code: 'CHEM401', credits: 3 },
      ],
      isActive: true,
      teacherCount: 0,
      studentCount: 0,
    },
    {
      name: 'Electronics Engineering',
      code: 'ECE',
      description: 'Electronics and Communication Engineering',
      subjects: [
        { name: 'Digital Electronics', code: 'ECE201', credits: 4 },
        { name: 'Signal Processing', code: 'ECE301', credits: 4 },
      ],
      isActive: true,
      teacherCount: 0,
      studentCount: 0,
    },
    {
      name: 'Business Administration',
      code: 'BBA',
      description: 'Business Administration and Management',
      subjects: [
        { name: 'Marketing', code: 'BBA201', credits: 3 },
        { name: 'Finance', code: 'BBA301', credits: 3 },
      ],
      isActive: true,
      teacherCount: 0,
      studentCount: 0,
    },
  ];
  
  const createdDepts = await Department.insertMany(departments);
  console.log(`🏢 Departments seeded: ${createdDepts.length}`);
  return createdDepts;
};

const seedUsers = async () => {
  // admin
  const adminData = {
    name: 'System Administrator',
    email: 'admin@university.edu',
    password: 'Password@123',
    role: 'admin',
    department: 'Administration',
    status: 'active',
    isVerified: true,
    phone: '+1234567890',
    address: 'Admin Office, University Campus',
    joinedDate: new Date('2024-01-01'),
  };
  
  // teachers with various departments and subjects to cover all cases
  const teachersData = [
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      password: 'Password@123',
      role: 'teacher',
      department: 'Computer Science',
      subject: 'Data Structures',
      bio: 'Experienced CS professor with a focus on data structures',
      office: 'CS Bldg, Room 301',
      phone: '+1234567891',
      address: '123 Faculty Lane, University Town',
      rating: 4.9,
      totalRatings: 45,
      status: 'active',
      isVerified: true,
      joinedDate: new Date('2021-08-15'),
    },
    {
      name: 'Prof. Michael Chen',
      email: 'michael.chen@university.edu',
      password: 'Password@123',
      role: 'teacher',
      department: 'Mathematics',
      subject: 'Calculus',
      bio: 'Mathematics professor with interest in Calculus and advanced math topics',
      office: 'Math Bldg, Room 202',
      phone: '+1234567892',
      address: '456 Academic Road, University Town',
      rating: 4.7,
      totalRatings: 38,
      status: 'active',
      isVerified: true,
      joinedDate: new Date('2022-01-10'),
    },
    {
      name: 'Dr. Emily Davis',
      email: 'emily.davis@university.edu',
      password: 'Password@123',
      role: 'teacher',
      department: 'Physics',
      subject: 'Quantum Physics',
      bio: 'Physics professor focusing on quantum mechanics research',
      office: 'Physics Bldg, Room 405',
      phone: '+1234567893',
      address: '789 Science Blvd, University Town',
      rating: 4.8,
      totalRatings: 40,
      status: 'active',
      isVerified: true,
      joinedDate: new Date('2020-09-01'),
    },
  ];
  
  // diverse set of students
  const studentsData = [
    {
      name: 'John Smith',
      email: 'john.smith@student.edu',
      password: 'Password@123',
      role: 'student',
      department: 'Computer Science',
      year: '3rd Year',
      phone: '+1234567901',
      address: '100 Student Dorms, University Campus',
      status: 'active',
      isVerified: true,
      joinedDate: new Date('2023-09-01'),
    },
    {
      name: 'Emma Wilson',
      email: 'emma.wilson@student.edu',
      password: 'Password@123',
      role: 'student',
      department: 'Mathematics',
      year: '2nd Year',
      phone: '+1234567902',
      address: '101 Student Dorms, University Campus',
      status: 'active',
      isVerified: true,
      joinedDate: new Date('2024-09-01'),
    },
    {
      name: 'Alex Brown',
      email: 'alex.brown@student.edu',
      password: 'Password@123',
      role: 'student',
      department: 'Physics',
      year: '4th Year',
      phone: '+1234567903',
      address: '102 Student Dorms, University Campus',
      status: 'active',
      isVerified: true,
      joinedDate: new Date('2022-09-01'),
    },
  ];
  
  const admin = await User.create(adminData);
  const teachers = [];
  for (const t of teachersData) teachers.push(await User.create(t));
  const students = [];
  for (const s of studentsData) students.push(await User.create(s));
  console.log(`👥 Users seeded: 1 admin, ${teachers.length} teachers, ${students.length} students`);
  return { admin, teachers, students };
};

const seedAppointments = async (teachers, students) => {
  const appointments = [
    {
      student: students[0]._id,
      teacher: teachers[0]._id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '2:00 PM',
      duration: 60,
      purpose: 'academic-help',
      subject: 'Data Structures',
      message: 'Help needed for binary trees.',
      status: 'confirmed',
      confirmedAt: new Date(),
      department: 'Computer Science',
    },
    {
      student: students[1]._id,
      teacher: teachers[1]._id,
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      time: '10:00 AM',
      duration: 60,
      purpose: 'exam-preparation',
      subject: 'Calculus',
      message: 'Preparing for midterm exams.',
      status: 'pending',
      department: 'Mathematics',
    },
    {
      student: students[2]._id,
      teacher: teachers[2]._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      time: '3:00 PM',
      duration: 90,
      purpose: 'research-guidance',
      subject: 'Quantum Physics',
      message: 'Discussing research topics.',
      status: 'completed',
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      department: 'Physics',
      studentRating: 5,
      studentFeedback: 'Excellent guidance!',
      teacherFeedback: 'Great student.',
    },
  ];
  
  const createdAppointments = await Appointment.insertMany(appointments);
  console.log(`📅 Appointments seeded: ${createdAppointments.length}`);
  return createdAppointments;
};

const seedSchedules = async (teachers) => {
  const schedules = [];
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  for (const teacher of teachers) {
    for (let day = 0; day < 14; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      if ([0,6].includes(date.getDay())) continue; // skip weekends
      for (const time of times) {
        schedules.push({
          teacher: teacher._id,
          date,
          time,
          duration: 60,
          status: Math.random() > 0.85 ? 'blocked' : 'available',
          blockReason: Math.random() > 0.85 ? 'Department Meeting' : undefined,
          isActive: true,
        });
      }
    }
  }
  const createdSchedules = await Schedule.insertMany(schedules);
  console.log(`📋 Schedule slots seeded: ${createdSchedules.length}`);
  return createdSchedules;
};

const seedConversationsAndMessages = async (teachers, students) => {
  const conversations = [];
  const messages = [];
  for (let i=0; i<3; i++) {
    const student = students[i];
    const teacher = teachers[i];
    const conversation = await Conversation.create({
      participants: [student._id, teacher._id],
      type: 'direct',
      lastMessageTime: new Date(),
      isActive: true,
      unreadCount: new Map([[teacher._id.toString(), 1], [student._id.toString(), 0]])
    });
    const convMessages = await Message.insertMany([
      {
        conversation: conversation._id,
        sender: student._id,
        receiver: teacher._id,
        content: `Hello ${teacher.name}, I have a question about your lecture.`,
        messageType: 'text',
        isRead: true,
        readAt: new Date(),
      },
      {
        conversation: conversation._id,
        sender: teacher._id,
        receiver: student._id,
        content: `Hi ${student.name}, how can I help you?`,
        messageType: 'text',
        isRead: false,
      }
    ]);
    conversation.lastMessage = convMessages[1]._id;
    conversation.lastMessageTime = convMessages[1].createdAt;
    await conversation.save();
    conversations.push(conversation);
    messages.push(...convMessages);
  }
  console.log(`💬 Conversations seeded: ${conversations.length}, Messages seeded: ${messages.length}`);
  return { conversations, messages };
};

const seedNotifications = async (teachers, students) => {
  const notifications = [];
  for (const student of students) {
    notifications.push({
      recipient: student._id,
      sender: teachers[0]._id,
      title: 'Appointment Confirmed',
      message: `Your appointment with ${teachers[0].name} has been confirmed.`,
      type: 'appointment',
      priority: 'high',
      isRead: false,
      actionUrl: '/appointments',
      actionText: 'View Appointments',
      createdAt: new Date()
    });
  }
  const createdNotifications = await Notification.insertMany(notifications);
  console.log(`🔔 Notifications seeded: ${createdNotifications.length}`);
  return createdNotifications;
};

const seedDatabase = async () => {
  await connectDB();
  await clearDatabase();

  const departments = await seedDepartments();
  const { admin, teachers, students } = await seedUsers();
  const appointments = await seedAppointments(teachers, students);
  const schedules = await seedSchedules(teachers);
  const { conversations, messages } = await seedConversationsAndMessages(teachers, students);
  const notifications = await seedNotifications(teachers, students);

  console.log('\n✅ Seed Complete');
  console.log(`Departments: ${departments.length}`);
  console.log(`Users - Admin: 1, Teachers: ${teachers.length}, Students: ${students.length}`);
  console.log(`Appointments: ${appointments.length}`);
  console.log(`Schedules: ${schedules.length}`);
  console.log(`Conversations: ${conversations.length}`);
  console.log(`Messages: ${messages.length}`);
  console.log(`Notifications: ${notifications.length}\n`);
  console.log('Test Credentials:\n Admin: admin@university.edu / Password@123\n Teacher: sarah.johnson@university.edu / Password@123\n Student: john.smith@student.edu / Password@123');
  process.exit(0);
};

seedDatabase().catch(e => {
  console.error('Seeding failed:', e);
  process.exit(1);
});

module.exports = {
  seedDatabase,
};
