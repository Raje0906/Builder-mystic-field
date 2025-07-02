// EmailJS Frontend Service
import emailjs from 'emailjs-com';

const SERVICE_ID = 'your_service_id';
const TEMPLATE_ID = 'your_template_id';
const USER_ID = 'your_user_id';

export const emailService = {
  async sendEmail(to: string, subject: string, message: string) {
    const templateParams = {
      to_email: to,
      subject,
      message,
    };
    return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
  },
  async testConnection() {
    // EmailJS does not provide a direct connection test, so we simulate by sending a test email
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        to_email: 'test@example.com',
        subject: 'Test Email',
        message: 'This is a test email from EmailJS service.'
      }, USER_ID);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.text || error?.message || 'Unknown error' };
    }
  }
}; 