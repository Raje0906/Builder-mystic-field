// Simple email service implementation using Nodemailer
const nodemailer = require('nodemailer');

// Create a test account for development
async function createTestAccount() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('[Email] Created test account:', testAccount.user);
      return {
        user: testAccount.user,
        pass: testAccount.pass,
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false
      };
    } catch (error) {
      console.error('[Email] Failed to create test account:', error);
    }
  }
  return null;
}

// Create a transporter
async function createTransporter() {
  // Use production SMTP settings if available
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Otherwise use test account
  const testAccount = await createTestAccount();
  if (testAccount) {
    return nodemailer.createTransport({
      host: testAccount.host,
      port: testAccount.port,
      secure: testAccount.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
  
  throw new Error('No email configuration available');
}

/**
 * Sends an email notification
 * @param {string} to - Email recipient
 * @param {string} subject - Email subject
 * @param {string} text - Email body (plain text)
 * @returns {Promise<Object>} - The send result
 */
async function sendEmailNotification(to, subject, text) {
  try {
    console.log(`[Email] Preparing to send email to ${to}`);
    
    const transporter = await createTransporter();
    const from = process.env.EMAIL_FROM || 'noreply@laptopstore.com';
    
    const info = await transporter.sendMail({
      from: `"Laptop Store" <${from}>`,
      to,
      subject,
      text,
      html: text.replace(/\n/g, '<br>') // Simple conversion to HTML
    });
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Email] Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    console.log(`[Email] Message sent to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// For development/testing without SMTP
async function sendEmailNotificationMock(to, subject, text) {
  console.log(`[Email Mock] Would send to ${to}:\nSubject: ${subject}\n\n${text}`);
  return { success: true, mock: true, message: 'Mock email sent' };
}

// Use mock in development if no SMTP config is provided
const activeSendFunction = 
  (process.env.SMTP_HOST || process.env.NODE_ENV === 'production')
    ? sendEmailNotification 
    : sendEmailNotificationMock;

module.exports = {
  sendEmailNotification: activeSendFunction
};
