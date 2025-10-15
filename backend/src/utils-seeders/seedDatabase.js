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
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ DB connection failed:', error.message);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Appointment.deleteMany({}),
    Schedule.deleteMany({}),
    Message.deleteMany({}),
    Conversation.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑️  Database cleared');
};

const seedDepartments = async () => {
  const departments = [
    {
      name: 'Computer Science',
      code: 'CS',
      description: 'Computer Science Department',
      subjects: [
        { name: 'Data Structures', code: 'CS201', credits: 4 },
        { name: 'Algorithms', code: 'CS301', credits: 4 },
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
      description: 'Mathematics Department',
      subjects: [
        { name: 'Calculus', code: 'MATH101', credits: 4 },
        { name: 'Linear Algebra', code: 'MATH201', credits: 3 },
        { name: 'Statistics', code: 'MATH301', credits: 3 },
      ],
      isActive: true,
      teacherCount: 0,
      studentCount: 0,
    },
    {
      name: 'Physics',
      code: 'PHY',
      description: 'Physics Department',
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
      description: 'Chemistry Department',
      subjects: [
        { name: 'Organic Chemistry', code: 'CHEM201', credits: 4 },
        { name: 'Physical Chemistry', code: 'CHEM301', credits: 4 },
      ],
      isActive: true,
      teacherCount: 0,
      studentCount: 0,
    },
  ];

  const created = await Department.insertMany(departments);
  console.log(`🏢 Departments seeded: ${created.length}`);
  return created;
};

const seedUsers = async () => {
  const usersData = [
    // Admin user
    {
      name: 'Admin User',
      email: 'admin@university.edu',
      password: 'Password@123',
      role: 'admin',
      department: 'Administration',
      status: 'active',
      isVerified: true,
      joinedDate: new Date('2023-01-01'),
    },
    // Teachers
    {
      name: 'Dr. Alice Smith',
      email: 'alice.smith@university.edu',
      password: 'Password@123',
      role: 'teacher',
      department: 'Computer Science',
      subject: 'Data Structures',
      bio: 'Expert in data structures with 10+ years experience',
      office: 'CS Building Room 301',
      phone: '+12345670001',
      status: 'active',
      rating: 4.8,
      totalRatings: 150,
      isVerified: true,
      joinedDate: new Date('2020-09-01'),
    },
    {
      name: 'Prof. Bob Johnson',
      email: 'bob.johnson@university.edu',
      password: 'Password@123',
      role: 'teacher',
      department: 'Mathematics',
      subject: 'Calculus',
      bio: 'Mathematics enthusiast and researcher',
      office: 'Math Building Room 210',
      phone: '+12345670002',
      status: 'active',
      rating: 4.6,
      totalRatings: 98,
      isVerified: true,
      joinedDate: new Date('2021-01-15'),
    },
    {
      name: 'Dr. Carol Lee',
      email: 'carol.lee@university.edu',
      password: 'Password@123',
      role: 'teacher',
      department: 'Physics',
      subject: 'Quantum Physics',
      bio: 'Specializes in quantum mechanics and research',
      office: 'Physics Lab Room 102',
      phone: '+12345670003',
      status: 'active',
      rating: 4.9,
      totalRatings: 120,
      isVerified: true,
      joinedDate: new Date('2019-05-10'),
    },
    // Students
    {
      name: 'John Doe',
      email: 'john.doe@student.edu',
      password: 'Password@123',
      role: 'student',
      department: 'Computer Science',
      year: '3rd Year',
      phone: '+12345670011',
      status: 'active',
      isVerified: true,
      joinedDate: new Date('2022-08-01'),
    },
    {
      name: 'Jane Roe',
      email: 'jane.roe@student.edu',
      password: 'Password@123',
      role: 'student',
      department: 'Mathematics',
      year: '2nd Year',
      phone: '+12345670012',
      status: 'active',
      isVerified: true,
      joinedDate: new Date('2023-01-10'),
    },
    {
      name: 'Jim Beam',
      email: 'jim.beam@student.edu',
      password: 'Password@123',
      role: 'student',
      department: 'Physics',
      year: '4th Year',
      phone: '+12345670013',
      status: 'active',
      isVerified: true,
      joinedDate: new Date('2021-09-05'),
    },
  ];

  const createdUsers = [];
  for (const userData of usersData) {
    const user = new User(userData);
    await user.save();
    createdUsers.push(user);
  }
  console.log(`👥 Users seeded: ${createdUsers.length}`);

  return createdUsers;
};

const seedAppointments = async (users) => {
  const students = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');

  const appointmentsData = [
    {
      student: students[0]._id,
      teacher: teachers[0]._id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '10:00 AM',
      duration: 60,
      purpose: 'academic-help',
      subject: 'Data Structures',
      message: 'Need help with trees',
      status: 'confirmed',
      confirmedAt: new Date(),
      department: 'Computer Science',
    },
    {
      student: students[1]._id,
      teacher: teachers[1]._id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      time: '11:00 AM',
      duration: 60,
      purpose: 'exam-preparation',
      subject: 'Calculus',
      message: 'Midterm prep',
      status: 'pending',
      department: 'Mathematics',
    },
    {
      student: students[2]._id,
      teacher: teachers[2]._id,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      time: '2:00 PM',
      duration: 90,
      purpose: 'research-guidance',
      subject: 'Quantum Physics',
      message: 'Discuss quantum entanglement',
      status: 'completed',
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      department: 'Physics',
      studentRating: 5,
      studentFeedback: 'Excellent guidance!',
      teacherFeedback: 'Outstanding student.',
    },
    {
      student: students[0]._id,
      teacher: teachers[1]._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '12:00 PM',
      duration: 60,
      purpose: 'career-guidance',
      subject: 'Calculus',
      message: 'Discuss career in data science',
      status: 'cancelled',
      cancelledAt: new Date(),
      department: 'Mathematics',
    },
  ];

  const created = await Appointment.insertMany(appointmentsData);
  console.log(`📅 Appointments seeded: ${created.length}`);

  return created;
};

const seedSchedules = async (teachers) => {
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const schedules = [];

  for (const teacher of teachers) {
    for (let day = 0; day < 14; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      if ([0, 6].includes(date.getDay())) continue; // Skip Sunday & Saturday

      for (const time of times) {
        schedules.push({
          teacher: teacher._id,
          date: new Date(date.setHours(0, 0, 0, 0)),
          time,
          duration: 60,
          status: Math.random() > 0.85 ? 'blocked' : 'available',
          blockReason: Math.random() > 0.85 ? 'Department Meeting' : undefined,
          isActive: true,
        });
      }
    }
  }

  const created = await Schedule.insertMany(schedules);
  console.log(`📋 Schedule slots seeded: ${created.length}`);

  return created;
};

const seedConversationsAndMessages = async (teachers, students) => {
  const conversations = [];
  const messages = [];

  for (let i = 0; i < 3; i++) {
    const student = students[i];
    const teacher = teachers[i];

    const conversation = await Conversation.create({
      participants: [student._id, teacher._id],
      type: 'direct',
      lastMessageTime: new Date(),
      isActive: true,
      unreadCount: new Map([[teacher._id.toString(), 1], [student._id.toString(), 0]]),
    });

    const msgs = await Message.insertMany([
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
        content: `Hi ${student.name}, how can I assist you?`,
        messageType: 'text',
        isRead: false,
      },
    ]);

    conversation.lastMessage = msgs[1]._id;
    conversation.lastMessageTime = msgs[1].createdAt;
    await conversation.save();

    conversations.push(conversation);
    messages.push(...msgs);
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
      createdAt: new Date(),
    });
  }

  const created = await Notification.insertMany(notifications);
  console.log(`🔔 Notifications seeded: ${created.length}`);

  return created;
};

const seedDatabase = async () => {
  await connectDB();
  await clearDatabase();

  const departments = await seedDepartments();
  const users = await seedUsers();

  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');

  await seedAppointments(users);
  await seedSchedules(teachers);
  await seedConversationsAndMessages(teachers,students);
  await seedNotifications(teachers, students);

  console.log('\n✅ Seed Complete');
  console.log(`Departments: ${departments.length}`);
  console.log(`Users: Total ${users.length}, Teachers ${teachers.length}, Students ${students.length}`);
  process.exit(0);
};

seedDatabase().catch(e => {
  console.error('Seeding failed:', e);
  process.exit(1);
});

module.exports = { seedDatabase };
