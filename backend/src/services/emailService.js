const nodemailer = require('nodemailer');

// Email transporter configuration
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid, AWS SES)
    return nodemailer.createTransporter({
      service: 'gmail', // or your preferred service
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Send email helper
const sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: `${process.env.FROM_NAME || 'Appointed'} <${process.env.EMAIL_FROM || 'noreply@appointed.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Email could not be sent');
  }
};

// Email templates
const emailTemplates = {
  welcome: (user) => ({
    subject: 'Welcome to Appointed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Appointed!</h1>
        <p>Hi ${user.name},</p>
        <p>Welcome to Appointed - the student-teacher appointment booking system.</p>
        <p>Your account has been created successfully. ${user.status === 'pending' ? 'Please wait for admin approval to start using the system.' : 'You can now start booking appointments with teachers.'}</p>
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Account Details:</h3>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Department:</strong> ${user.department}</p>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Appointed Team</p>
      </div>
    `
  }),

  appointmentNotification: (teacher, appointment) => ({
    subject: 'New Appointment Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Appointment Request</h1>
        <p>Hi ${teacher.name},</p>
        <p>You have received a new appointment request from ${appointment.student.name}.</p>
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Appointment Details:</h3>
          <p><strong>Student:</strong> ${appointment.student.name}</p>
          <p><strong>Date:</strong> ${appointment.formattedDate}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Purpose:</strong> ${appointment.purpose}</p>
          ${appointment.message ? `<p><strong>Message:</strong> ${appointment.message}</p>` : ''}
        </div>
        <p>Please log in to your account to approve or reject this request.</p>
        <p>Best regards,<br>The Appointed Team</p>
      </div>
    `
  }),

  appointmentConfirmation: (student, appointment) => ({
    subject: 'Appointment Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">Appointment Confirmed</h1>
        <p>Hi ${student.name},</p>
        <p>Your appointment request has been confirmed by ${appointment.teacher.name}.</p>
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Appointment Details:</h3>
          <p><strong>Teacher:</strong> ${appointment.teacher.name}</p>
          <p><strong>Date:</strong> ${appointment.formattedDate}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Purpose:</strong> ${appointment.purpose}</p>
          <p><strong>Subject:</strong> ${appointment.subject}</p>
        </div>
        <p>Please be on time for your appointment. If you need to reschedule or cancel, please do so at least 2 hours in advance.</p>
        <p>Best regards,<br>The Appointed Team</p>
      </div>
    `
  }),

  appointmentReminder: (user, appointment, isTeacher = false) => ({
    subject: 'Appointment Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF9800;">Appointment Reminder</h1>
        <p>Hi ${user.name},</p>
        <p>This is a reminder about your upcoming appointment ${isTeacher ? 'with' : 'with'} ${isTeacher ? appointment.student.name : appointment.teacher.name}.</p>
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Appointment Details:</h3>
          <p><strong>${isTeacher ? 'Student' : 'Teacher'}:</strong> ${isTeacher ? appointment.student.name : appointment.teacher.name}</p>
          <p><strong>Date:</strong> ${appointment.formattedDate}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Purpose:</strong> ${appointment.purpose}</p>
          <p><strong>Subject:</strong> ${appointment.subject}</p>
        </div>
        <p>Please be prepared and on time for your appointment.</p>
        <p>Best regards,<br>The Appointed Team</p>
      </div>
    `
  }),

  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset for your Appointed account.</p>
        <p>Please use the following token to reset your password:</p>
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
          <h2 style="color: #333; letter-spacing: 2px;">${resetToken}</h2>
        </div>
        <p>This token will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>The Appointed Team</p>
      </div>
    `
  }),

  approval: (user, message) => ({
    subject: 'Account Approved - Welcome to Appointed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">Account Approved!</h1>
        <p>Hi ${user.name},</p>
        <p>Great news! Your account has been approved and is now active.</p>
        <p>You can now access all features of the Appointed system and start ${user.role === 'student' ? 'booking appointments with teachers' : 'managing your schedule and appointments'}.</p>
        ${message ? `<div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;"><p><strong>Message from Admin:</strong> ${message}</p></div>` : ''}
        <p>Log in to your account to get started!</p>
        <p>Best regards,<br>The Appointed Team</p>
      </div>
    `
  }),

  rejection: (user, reason) => ({
    subject: 'Account Registration Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f44336;">Registration Update</h1>
        <p>Hi ${user.name},</p>
        <p>We regret to inform you that your account registration has not been approved at this time.</p>
        ${reason ? `<div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
        <p>If you believe this is an error or would like to reapply, please contact our support team.</p>
        <p>Best regards,<br>The Appointed Team</p>
      </div>
    `
  })
};

// Email service methods
const emailService = {
  // Send welcome email
  sendWelcomeEmail: async (user) => {
    const template = emailTemplates.welcome(user);
    return sendEmail({
      email: user.email,
      ...template
    });
  },

  // Send appointment notification to teacher
  sendAppointmentNotification: async (teacher, appointment) => {
    const template = emailTemplates.appointmentNotification(teacher, appointment);
    return sendEmail({
      email: teacher.email,
      ...template
    });
  },

  // Send appointment confirmation to student
  sendAppointmentConfirmation: async (student, appointment) => {
    const template = emailTemplates.appointmentConfirmation(student, appointment);
    return sendEmail({
      email: student.email,
      ...template
    });
  },

  // Send appointment reminder
  sendAppointmentReminder: async (user, appointment, isTeacher = false) => {
    const template = emailTemplates.appointmentReminder(user, appointment, isTeacher);
    return sendEmail({
      email: user.email,
      ...template
    });
  },

  // Send password reset email
  sendPasswordResetEmail: async (user, resetToken) => {
    const template = emailTemplates.passwordReset(user, resetToken);
    return sendEmail({
      email: user.email,
      ...template
    });
  },

  // Send approval email
  sendApprovalEmail: async (user, message) => {
    const template = emailTemplates.approval(user, message);
    return sendEmail({
      email: user.email,
      ...template
    });
  },

  // Send rejection email
  sendRejectionEmail: async (user, reason) => {
    const template = emailTemplates.rejection(user, reason);
    return sendEmail({
      email: user.email,
      ...template
    });
  }
};

module.exports = emailService;
