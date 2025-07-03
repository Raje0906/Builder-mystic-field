// EmailJS Frontend Service
import emailjs from 'emailjs-com';

// Use VITE_ env variables for frontend config
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const COMPLETE_TEMPLATE_ID = 'template_lmw75qc';
const USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

/**
 * Send an email using EmailJS. You must pass all variables required by your template in templateParams.
 * Example:
 * emailService.sendEmail({
 *   user_name: 'John Doe',
 *   device_name: 'Dell XPS 13',
 *   issue_description: 'Screen not working',
 *   repair_id: '12345',
 *   estimated_date: '2024-07-01',
 *   to_email: 'customer@example.com',
 * });
 */
export const emailService = {
  async sendEmail(templateParams: Record<string, any>) {
    return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
  },
  async sendCompletionEmail(templateParams: Record<string, any>) {
    return emailjs.send(SERVICE_ID, COMPLETE_TEMPLATE_ID, templateParams, USER_ID);
  },
  async testConnection() {
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        user_name: 'Test User',
        device_name: 'Test Device',
        issue_description: 'Test Issue',
        repair_id: 'TEST123',
        estimated_date: '2024-07-01',
        to_email: 'test@example.com',
      }, USER_ID);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.text || error?.message || 'Unknown error' };
    }
  }
}; 