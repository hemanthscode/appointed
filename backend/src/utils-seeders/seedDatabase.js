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
  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry'];
  const subjectsByDept = {
    'Computer Science': ['Data Structures', 'Algorithms', 'Web Development', 'Machine Learning'],
    Mathematics: ['Calculus', 'Linear Algebra', 'Statistics'],
    Physics: ['Classical Mechanics', 'Quantum Physics', 'Thermodynamics'],
    Chemistry: ['Organic Chemistry', 'Physical Chemistry'],
  };
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const users = [];

  // Admin user
  users.push({
    name: 'Admin User',
    email: 'admin@university.edu',
    password: 'Password@123',
    role: 'admin',
    department: 'Administration',
    status: 'active',
    isVerified: true,
    joinedDate: new Date('2023-01-01'),
    appointmentsCount: 0,
  });

  // 10 teachers systematically assigned subjects and depts
  for (let i = 1; i <= 10; i++) {
    const dept = departments[i % departments.length];
    const subjectList = subjectsByDept[dept];
    const subject = subjectList[i % subjectList.length];
    users.push({
      name: `Teacher ${i}`,
      email: `teacher${i}@university.edu`,
      password: 'Password@123',
      role: 'teacher',
      department: dept,
      subject,
      bio: `Experienced in ${subject}`,
      office: `${dept} Building Room ${100 + i}`,
      phone: `+1234567${(10000 + i).toString().slice(-5)}`,
      status: 'active',
      rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
      totalRatings: Math.floor(Math.random() * 150 + 50),
      isVerified: true,
      joinedDate: new Date(2018 + (i % 5), i % 12, (i % 28) + 1),
      appointmentsCount: 0,
    });
  }

  // 30 students with realistic years and depts
  for (let i = 1; i <= 30; i++) {
    const dept = departments[i % departments.length];
    const year = years[i % years.length];
    users.push({
      name: `Student ${i}`,
      email: `student${i}@university.edu`,
      password: 'Password@123',
      role: 'student',
      department: dept,
      year,
      phone: `+1987654${(10000 + i).toString().slice(-5)}`,
      status: 'active',
      isVerified: true,
      joinedDate: new Date(2021 + (i % 3), i % 12, (i % 28) + 1),
      bio: '',
      rating: 0,
      totalRatings: 0,
      appointmentsCount: 0,
    });
  }

  const createdUsers = [];
  for (const userData of users) {
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
  const appointments = [];

  const purposes = ['academic-help', 'exam-preparation', 'research-guidance', 'career-guidance'];
  const statuses = ['confirmed', 'pending', 'cancelled', 'completed'];

  for (let i = 0; i < 50; i++) {
    const student = students[i % students.length];
    const teacher = teachers[i % teachers.length];
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + (i % 15));
    const hour = 9 + (i % 8);
    const timeSlot = `${hour}:00 AM`;
    const status = statuses[i % statuses.length];
    const purpose = purposes[i % purposes.length];

    const appointment = {
      student: student._id,
      teacher: teacher._id,
      date: appointmentDate,
      time: timeSlot,
      duration: [30, 60, 90][i % 3],
      purpose,
      subject: teacher.subject || 'General',
      message: `Message for appointment #${i + 1}`,
      status,
      department: teacher.department,
    };

    if (status === 'completed') {
      appointment.completedAt = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
      appointment.studentRating = 4 + (i % 2);
      appointment.studentFeedback = 'Great session on topic.';
      appointment.teacherFeedback = 'Engaged and punctual student.';
    }
    if (status === 'cancelled') {
      appointment.cancelledAt = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    }
    if (status === 'confirmed') {
      appointment.confirmedAt = new Date(appointmentDate.getTime() - 12 * 60 * 60 * 1000);
    }

    appointments.push(appointment);
  }

  const created = await Appointment.insertMany(appointments);
  console.log(`📅 Appointments seeded: ${created.length}`);

  return created;
};

// Function to update appointmentsCount for all users based on actual appointments
const updateAppointmentsCount = async (users) => {
  for (const user of users) {
    if (user.role === 'student') {
      const count = await Appointment.countDocuments({ student: user._id });
      user.appointmentsCount = count;
      await user.save();
    }
    if (user.role === 'teacher') {
      const count = await Appointment.countDocuments({ teacher: user._id });
      user.appointmentsCount = count;
      await user.save();
    }
  }
  console.log('📝 Updated appointmentsCount for all users');
};

const seedSchedules = async (teachers) => {
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const schedules = [];

  for (const teacher of teachers) {
    for (let day = 0; day < 15; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      if ([0, 6].includes(date.getDay())) continue;

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

  const pairs = new Set();

  for (let i = 0; i < Math.min(teachers.length, students.length, 20); i++) {
    const student = students[i];
    const teacher = teachers[i];

    const participantIds = [student._id.toString(), teacher._id.toString()].sort();
    const key = participantIds.join('-');

    if (pairs.has(key)) continue;
    pairs.add(key);

    const conversation = await Conversation.create({
      participants: participantIds,
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
    const teacher = teachers[Math.floor(Math.random() * teachers.length)];
    notifications.push({
      recipient: student._id,
      sender: teacher._id,
      title: 'Appointment Confirmed',
      message: `Your appointment with ${teacher.name} has been confirmed.`,
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

  const teachers = users.filter((u) => u.role === 'teacher');
  const students = users.filter((u) => u.role === 'student');

  await seedAppointments(users);
  await updateAppointmentsCount(users);
  await seedSchedules(teachers);
  await seedConversationsAndMessages(teachers, students);
  await seedNotifications(teachers, students);

  console.log('\n✅ Seed Complete');
  console.log(`Departments: ${departments.length}`);
  console.log(`Users: Total ${users.length}, Teachers ${teachers.length}, Students ${students.length}`);
  process.exit(0);
};

seedDatabase().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});

module.exports = { seedDatabase };
