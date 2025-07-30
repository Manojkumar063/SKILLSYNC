const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('Email service ready');
  }
});

// Send welcome email
exports.sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to SkillSync!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to SkillSync, ${userName}!</h2>
          <p>Thank you for joining our developer marketplace platform.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse available projects</li>
            <li>Connect with talented developers</li>
            <li>Build your professional network</li>
          </ul>
          <p>Get started by completing your profile and exploring opportunities.</p>
          <p>Best regards,<br>The SkillSync Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', userEmail);
  } catch (error) {
    console.error('Welcome email error:', error);
  }
};

// Send job application notification
exports.sendJobApplicationNotification = async (clientEmail, jobTitle, developerName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: clientEmail,
      subject: 'New Application for Your Job Post',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Job Application</h2>
          <p>You have received a new application for your job post: <strong>${jobTitle}</strong></p>
          <p>Applicant: ${developerName}</p>
          <p>Please log in to your account to review the application.</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Application</a>
          <p>Best regards,<br>The SkillSync Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Job application notification sent to:', clientEmail);
  } catch (error) {
    console.error('Job application notification error:', error);
  }
};

// Send hire notification
exports.sendHireNotification = async (developerEmail, jobTitle, clientName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: developerEmail,
      subject: 'Congratulations! You\'ve been hired',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Congratulations!</h2>
          <p>You have been selected for the project: <strong>${jobTitle}</strong></p>
          <p>Client: ${clientName}</p>
          <p>Please log in to your account to view project details and start communication with the client.</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Project</a>
          <p>Best regards,<br>The SkillSync Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Hire notification sent to:', developerEmail);
  } catch (error) {
    console.error('Hire notification error:', error);
  }
};

// Send job completion notification
exports.sendJobCompletionNotification = async (developerEmail, jobTitle, clientName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: developerEmail,
      subject: 'Job Completed - Payment Processing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Job Completed Successfully!</h2>
          <p>Your project <strong>${jobTitle}</strong> has been marked as completed by ${clientName}.</p>
          <p>Payment will be processed within 24-48 hours.</p>
          <p>Thank you for your excellent work!</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
          <p>Best regards,<br>The SkillSync Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Job completion notification sent to:', developerEmail);
  } catch (error) {
    console.error('Job completion notification error:', error);
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to create a new password:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The SkillSync Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', userEmail);
  } catch (error) {
    console.error('Password reset email error:', error);
  }
};

// Send email verification
exports.sendEmailVerification = async (userEmail, verificationToken) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <p>Best regards,<br>The SkillSync Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Email verification sent to:', userEmail);
  } catch (error) {
    console.error('Email verification error:', error);
  }
};

// Send message notification
exports.sendMessageNotification = async (recipientEmail, senderName, jobTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: 'New Message Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Message</h2>
          <p>You have received a new message from <strong>${senderName}</strong> regarding the project: <strong>${jobTitle}</strong></p>
          <p>Please log in to your account to read and respond to the message.</p>
          <a href="${process.env.CLIENT_URL}/messages" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Messages</a>
          <p>Best regards,<br>The SkillSync Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Message notification sent to:', recipientEmail);
  } catch (error) {
    console.error('Message notification error:', error);
  }
};

module.exports = {
  sendWelcomeEmail: exports.sendWelcomeEmail,
  sendJobApplicationNotification: exports.sendJobApplicationNotification,
  sendHireNotification: exports.sendHireNotification,
  sendJobCompletionNotification: exports.sendJobCompletionNotification,
  sendPasswordResetEmail: exports.sendPasswordResetEmail,
  sendEmailVerification: exports.sendEmailVerification,
  sendMessageNotification: exports.sendMessageNotification
};
