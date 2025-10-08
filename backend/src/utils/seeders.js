const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

// Connect to database
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

// Clear all collections
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

// Seed departments
const seedDepartments = async () => {
  try {
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
  } catch (error) {
    console.error('Error seeding departments:', error);
    throw error;
  }
};

// Seed users - FIXED: Use User.create() for ALL users to trigger pre('save') hooks
const seedUsers = async () => {
  try {
    console.log('👥 Creating users with proper password hashing...');

    // Admin data
    const adminData = {
      name: 'System Administrator',
      email: 'admin@university.edu',
      password: 'password123',
      role: 'admin',
      department: 'Administration',
      status: 'active',
      isVerified: true,
      phone: '+1234567890',
      address: 'Admin Office, University Campus',
      joinedDate: new Date('2024-01-01'),
    };

    // Teachers data
    const teachersData = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        password: 'password123',
        role: 'teacher',
        department: 'Computer Science',
        subject: 'Data Structures',
        bio: 'Professor of Computer Science with 10+ years experience.',
        office: 'CS Building, Room 301',
        phone: '+1234567891',
        address: '123 Faculty Lane, University Town',
        rating: 4.8,
        totalRatings: 45,
        status: 'active',
        isVerified: true,
        appointmentsCount: 0,
        joinedDate: new Date('2022-08-15'),
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        password: 'password123',
        role: 'teacher',
        department: 'Mathematics',
        subject: 'Calculus',
        bio: 'Mathematics professor specializing in calculus and analysis.',
        office: 'Math Building, Room 201',
        phone: '+1234567892',
        address: '456 Academic Drive, University Town',
        rating: 4.6,
        totalRatings: 32,
        status: 'active',
        isVerified: true,
        appointmentsCount: 0,
        joinedDate: new Date('2021-01-10'),
      },
      {
        name: 'Dr. Emily Davis',
        email: 'emily.davis@university.edu',
        password: 'password123',
        role: 'teacher',
        department: 'Physics',
        subject: 'Quantum Physics',
        bio: 'Physics professor with research focus on quantum mechanics.',
        office: 'Physics Building, Room 405',
        phone: '+1234567893',
        address: '789 Science Street, University Town',
        rating: 4.9,
        totalRatings: 28,
        status: 'active',
        isVerified: true,
        appointmentsCount: 0,
        joinedDate: new Date('2020-09-01'),
      }
    ];

    // Students data
    const studentsData = [
      {
        name: 'John Smith',
        email: 'john.smith@student.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        year: '3rd Year',
        phone: '+1234567901',
        address: '100 Student Dorms, University Campus',
        status: 'active',
        isVerified: true,
        appointmentsCount: 0,
        joinedDate: new Date('2023-09-01'),
      },
      {
        name: 'Emma Wilson',
        email: 'emma.wilson@student.edu',
        password: 'password123',
        role: 'student',
        department: 'Mathematics',
        year: '2nd Year',
        phone: '+1234567902',
        address: '101 Student Dorms, University Campus',
        status: 'active',
        isVerified: true,
        appointmentsCount: 0,
        joinedDate: new Date('2024-09-01'),
      },
      {
        name: 'Alex Brown',
        email: 'alex.brown@student.edu',
        password: 'password123',
        role: 'student',
        department: 'Physics',
        year: '4th Year',
        phone: '+1234567903',
        address: '102 Student Dorms, University Campus',
        status: 'active',
        isVerified: true,
        appointmentsCount: 0,
        joinedDate: new Date('2022-09-01'),
      }
    ];

    // ⭐ FIXED: Create users ONE BY ONE to trigger pre('save') hooks
    console.log('Creating admin...');
    const admin = await User.create(adminData);
    console.log('✅ Admin created with proper password hash');

    console.log('Creating teachers...');
    const teachers = [];
    for (let teacherData of teachersData) {
      const teacher = await User.create(teacherData);
      teachers.push(teacher);
      console.log(`✅ Teacher created: ${teacher.name}`);
    }

    console.log('Creating students...');
    const students = [];
    for (let studentData of studentsData) {
      const student = await User.create(studentData);
      students.push(student);
      console.log(`✅ Student created: ${student.name}`);
    }

    console.log(`👥 Users seeded: { admin: 1, teachers: ${teachers.length}, students: ${students.length}, total: ${1 + teachers.length + students.length} }`);

    return { admin, teachers, students };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};


// Seed appointments
const seedAppointments = async (teachers, students) => {
  try {
    const appointmentsData = [];
    const purposes = [
      'academic-help',
      'project-discussion',
      'career-guidance',
      'exam-preparation',
      'research-guidance',
      'other',
    ];
    const statuses = ['pending', 'confirmed', 'completed', 'rejected', 'cancelled'];
    const times = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

    // Generate realistic appointments
    const appointments = [
      {
        student: students[0]._id,
        teacher: teachers[0]._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: '2:00 PM',
        duration: 60,
        purpose: 'academic-help',
        subject: 'Data Structures',
        message: 'Need help understanding binary trees and their implementation in Java.',
        status: 'confirmed',
        confirmedAt: new Date(),
        department: 'Computer Science',
      },
      {
        student: students[1]._id,
        teacher: teachers[1]._id,
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        duration: 60,
        purpose: 'exam-preparation',
        subject: 'Calculus',
        message: 'Preparation for upcoming calculus midterm exam.',
        status: 'pending',
        department: 'Mathematics',
      },
      {
        student: students[2]._id,
        teacher: teachers[2]._id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        time: '3:00 PM',
        duration: 90,
        purpose: 'research-guidance',
        subject: 'Quantum Physics',
        message: 'Discussion about quantum computing research project.',
        status: 'completed',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        department: 'Physics',
        studentRating: 5,
        studentFeedback: 'Excellent guidance on quantum computing concepts!',
        teacherFeedback: 'Student showed excellent understanding.',
      },
    ];

    // Generate random appointments
    for (let i = 0; i < 15; i++) {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      const randomDate = new Date(Date.now() + (Math.floor(Math.random() * 30) - 15) * 24 * 60 * 60 * 1000);
      const randomTime = times[Math.floor(Math.random() * times.length)];
      const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const appointment = {
        student: randomStudent._id,
        teacher: randomTeacher._id,
        date: randomDate,
        time: randomTime,
        duration: Math.random() > 0.7 ? 90 : 60,
        purpose: randomPurpose,
        subject: randomTeacher.subject,
        message: `Discussion about ${randomTeacher.subject} topics.`,
        status: randomStatus,
        department: randomTeacher.department,
      };

      if (randomStatus === 'confirmed') {
        appointment.confirmedAt = new Date(randomDate.getTime() - 24 * 60 * 60 * 1000);
      } else if (randomStatus === 'completed') {
        appointment.confirmedAt = new Date(randomDate.getTime() - 48 * 60 * 60 * 1000);
        appointment.completedAt = new Date(randomDate.getTime() + 60 * 60 * 1000);
        if (Math.random() > 0.5) {
          appointment.studentRating = Math.floor(Math.random() * 2) + 4;
          appointment.studentFeedback = 'Great session! Very helpful.';
        }
      }

      appointmentsData.push(appointment);
    }

    const allAppointments = [...appointments, ...appointmentsData];
    const createdAppointments = await Appointment.insertMany(allAppointments);

    console.log(`📅 Appointments seeded: ${createdAppointments.length}`);
    return createdAppointments;
  } catch (error) {
    console.error('Error seeding appointments:', error);
    throw error;
  }
};

// Seed schedule slots
const seedSchedules = async (teachers) => {
  try {
    const schedules = [];
    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

    for (let teacher of teachers) {
      for (let day = 0; day < 14; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);

        if (date.getDay() === 0 || date.getDay() === 6) continue;

        for (let timeSlot of timeSlots) {
          const slotData = {
            teacher: teacher._id,
            date: new Date(date),
            time: timeSlot,
            duration: 60,
            status: Math.random() > 0.8 ? 'blocked' : 'available',
            isRecurring: false,
            isActive: true,
          };

          if (slotData.status === 'blocked') {
            const blockReasons = ['Department Meeting', 'Personal Appointment', 'Conference Call'];
            slotData.blockReason = blockReasons[Math.floor(Math.random() * blockReasons.length)];
          }

          schedules.push(slotData);
        }
      }
    }

    const createdSchedules = await Schedule.insertMany(schedules);
    console.log(`📋 Schedule slots seeded: ${createdSchedules.length}`);
    return createdSchedules;
  } catch (error) {
    console.error('Error seeding schedules:', error);
    throw error;
  }
};

// Seed conversations and messages
const seedMessagesAndConversations = async (teachers, students) => {
  try {
    const conversations = [];
    const messages = [];

    for (let i = 0; i < 3; i++) {
      const student = students[i % students.length];
      const teacher = teachers[i % teachers.length];

      const conversation = await Conversation.create({
        participants: [student._id, teacher._id],
        type: 'direct',
        lastMessageTime: new Date(),
        isActive: true,
      });

      const conversationMessages = [
        {
          conversation: conversation._id,
          sender: student._id,
          receiver: teacher._id,
          content: `Hello ${teacher.name}, I have a question about the recent lecture.`,
          messageType: 'text',
          isRead: true,
          readAt: new Date(),
        },
        {
          conversation: conversation._id,
          sender: teacher._id,
          receiver: student._id,
          content: `Hi ${student.name}! I'd be happy to help. What's your question?`,
          messageType: 'text',
          isRead: false,
        },
      ];

      const createdMessages = await Message.insertMany(conversationMessages);

      conversation.lastMessage = createdMessages[createdMessages.length - 1]._id;
      conversation.lastMessageTime = createdMessages[createdMessages.length - 1].createdAt;

      const unreadCount = new Map();
      unreadCount.set(teacher._id.toString(), 1);
      unreadCount.set(student._id.toString(), 0);
      conversation.unreadCount = unreadCount;

      await conversation.save();

      conversations.push(conversation);
      messages.push(...createdMessages);
    }

    console.log(`💬 Messages and Conversations seeded: ${conversations.length} conversations, ${messages.length} messages`);
    return { conversations, messages };
  } catch (error) {
    console.error('Error seeding messages and conversations:', error);
    throw error;
  }
};

// Seed notifications
const seedNotifications = async (teachers, students) => {
  try {
    const notifications = [];

    for (let student of students.slice(0, 3)) {
      const notification = {
        recipient: student._id,
        sender: teachers[0]._id,
        title: 'Appointment Confirmed',
        message: `Your appointment with ${teachers[0].name} has been confirmed.`,
        type: 'appointment',
        priority: 'high',
        isRead: Math.random() > 0.5,
        actionUrl: '/appointments',
        actionText: 'View Appointment',
      };

      if (notification.isRead) {
        notification.readAt = new Date();
      }

      notifications.push(notification);
    }

    const createdNotifications = await Notification.insertMany(notifications);
    console.log(`🔔 Notifications seeded: ${createdNotifications.length}`);
    return createdNotifications;
  } catch (error) {
    console.error('Error seeding notifications:', error);
    throw error;
  }
};

// Main seeder function
const runSeeder = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();
    await clearDatabase();

    console.log('📊 Seeding departments...');
    const departments = await seedDepartments();

    console.log('👥 Seeding users...');
    const { admin, teachers, students } = await seedUsers();

    console.log('📅 Seeding appointments...');
    const appointments = await seedAppointments(teachers, students);

    console.log('📋 Seeding schedules...');
    const schedules = await seedSchedules(teachers);

    console.log('💬 Seeding messages...');
    const { conversations, messages } = await seedMessagesAndConversations(teachers, students);

    console.log('🔔 Seeding notifications...');
    const notifications = await seedNotifications(teachers, students);

    console.log('\n✅ DATABASE SEEDING COMPLETED!\n');
    console.log('📊 Summary:');
    console.log(`   - ${departments.length} Departments`);
    console.log(`   - 1 Admin, ${teachers.length} Teachers, ${students.length} Students`);
    console.log(`   - ${appointments.length} Appointments`);
    console.log(`   - ${schedules.length} Schedule slots`);
    console.log(`   - ${conversations.length} Conversations, ${messages.length} Messages`);
    console.log(`   - ${notifications.length} Notifications`);

    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('   🔑 Admin: admin@university.edu / password123');
    console.log('   👨‍🏫 Teacher: sarah.johnson@university.edu / password123');
    console.log('   👨‍🎓 Student: john.smith@student.edu / password123');

    console.log('\n🚀 Ready for testing!');

    process.exit(0);
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  }
};

// Clear data function
const clearData = async () => {
  try {
    console.log('🗑️  Clearing database...');
    await connectDB();
    await clearDatabase();
    console.log('✅ Database cleared!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Clear failed:', error);
    process.exit(1);
  }
};

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--clear')) {
  clearData();
} else {
  runSeeder();
}

module.exports = {
  runSeeder,
  clearData,
  seedUsers,
  seedAppointments,
  seedDepartments,
  seedSchedules,
  seedMessagesAndConversations,
  seedNotifications,
};
