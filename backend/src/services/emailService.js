const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  // Development using Ethereal
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS
    }
  });
};

const sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: `${process.env.FROM_NAME || 'Appointed'} <${process.env.EMAIL_FROM || 'noreply@appointed.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text || ''
  };

  try {
    const info = await transporter.sendMail(message);
    console.info('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

const emailTemplates = {
  // Template methods return { subject, html } objects for different email types
  welcome: (user) => ({
    subject: 'Welcome to Appointed!',
    html: `<div style="font-family: Arial; max-width:600px; margin:auto;">
      <h1>Welcome to Appointed!</h1>
      <p>Hi ${user.name}, your account has been created successfully. 
      ${user.status==='pending' ? 'Please wait for admin approval.' : 'You can now book appointments.'}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      </div>`
  }),
  appointmentNotification: (teacher, appointment) => ({
    subject: 'New Appointment Request',
    html: `<p>Hi ${teacher.name}, you have a new appointment request from ${appointment.student.name} on ${appointment.formattedDate} at ${appointment.time}.</p>`
  }),
  appointmentConfirmation: (student, appointment) => ({
    subject: 'Appointment Confirmed',
    html: `<p>Hi ${student.name}, your appointment with ${appointment.teacher.name} has been confirmed.</p>`
  }),
  passwordReset: (user, token) => ({
    subject: 'Password Reset Request',
    html: `<p>Hi ${user.name}, use this token to reset your password: <strong>${token}</strong></p>`
  }),
  approval: (user, message) => ({
    subject: 'Account Approved',
    html: `<p>Hi ${user.name}, your account is now active. ${message || ''}</p>`
  }),
  rejection: (user, reason) => ({
    subject: 'Account Registration Update',
    html: `<p>Hi ${user.name}, your registration has been rejected. ${reason || ''}</p>`
  })
};

const emailService = {
  sendWelcomeEmail: async (user) => sendEmail({ email: user.email, ...emailTemplates.welcome(user) }),
  sendAppointmentNotification: async (teacher, appointment) => sendEmail({ email: teacher.email, ...emailTemplates.appointmentNotification(teacher, appointment) }),
  sendAppointmentConfirmation: async (student, appointment) => sendEmail({ email: student.email, ...emailTemplates.appointmentConfirmation(student, appointment) }),
  sendPasswordResetEmail: async (user, token) => sendEmail({ email: user.email, ...emailTemplates.passwordReset(user, token) }),
  sendApprovalEmail: async (user, message) => sendEmail({ email: user.email, ...emailTemplates.approval(user, message) }),
  sendRejectionEmail: async (user, reason) => sendEmail({ email: user.email, ...emailTemplates.rejection(user, reason) })
};

module.exports = emailService;
