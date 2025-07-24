// EmailJS Frontend Service
import emailjs from '@emailjs/browser';

// Use VITE_ env variables for frontend config
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || import.meta.env.VITE_EMAILJS_NOTIFY_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_NOTIFY_TEMPLATE_ID;
const COMPLETE_TEMPLATE_ID = 'template_lmw75qc';
const USER_ID = import.meta.env.VITE_EMAILJS_USER_ID || import.meta.env.VITE_EMAILJS_NOTIFY_USER_ID;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailParams {
  user_name: string;
  device_name: string;
  issue_description: string;
  repair_id: string;
  estimated_date: string;
  to_email: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Validates email parameters before sending
 */
function validateEmailParams(params: Record<string, any>): { valid: boolean; error?: string } {
  if (!params.to_email) {
    return { valid: false, error: 'Recipient email is required' };
  }
  
  if (!EMAIL_REGEX.test(params.to_email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // Ensure required fields have values
  const requiredFields = ['user_name', 'device_name', 'issue_description', 'repair_id'];
  for (const field of requiredFields) {
    if (!params[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  return { valid: true };
}

/**
 * Email service for sending notifications
 */
export const emailService = {
  /**
   * Send a standard email using the default template
   */
  async sendEmail(templateParams: EmailParams) {
    const validation = validateEmailParams(templateParams);
    if (!validation.valid) {
      console.error('Email validation failed:', validation.error);
      throw new Error(validation.error);
    }
    
    try {
      const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
      console.log('Email sent successfully:', result.status, result.text);
      return { success: true, messageId: result.text };
    } catch (error: any) {
      console.error('Failed to send email:', error);
      throw new Error(error?.text || error?.message || 'Failed to send email');
    }
  },
  
  /**
   * Send a repair completion email
   */
  async sendCompletionEmail(templateParams: EmailParams) {
    const validation = validateEmailParams(templateParams);
    if (!validation.valid) {
      console.error('Completion email validation failed:', validation.error);
      throw new Error(validation.error);
    }
    
    try {
      const result = await emailjs.send(SERVICE_ID, COMPLETE_TEMPLATE_ID, templateParams, USER_ID);
      console.log('Completion email sent successfully:', result.status, result.text);
      return { success: true, messageId: result.text };
    } catch (error: any) {
      console.error('Failed to send completion email:', error);
      throw new Error(error?.text || error?.message || 'Failed to send completion email');
    }
  },
  
  /**
   * Test the email service connection
   */
  async testConnection() {
    const testParams = {
      user_name: 'Test User',
      device_name: 'Test Device',
      issue_description: 'Test Issue',
      repair_id: 'TEST123',
      estimated_date: new Date().toISOString().split('T')[0],
      to_email: 'test@example.com',
    };
    
    try {
      const result = await this.sendEmail(testParams);
      return { 
        success: true, 
        message: 'Test email sent successfully',
        details: result 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to send test email',
        details: error 
      };
    }
  },
  
  /**
   * Validate an email address format
   */
  isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }
};