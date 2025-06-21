import dotenv from 'dotenv';
import twilio from "twilio";
import nodemailer from "nodemailer";

// Load environment variables first
dotenv.config({ path: '../../.env' });

// Verify required environment variables
const requiredVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.log('Make sure your .env file is in the root directory and contains all required variables.');
}

// Initialize Twilio client with proper error handling
let twilioClient;
try {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
} catch (error) {
  console.error('❌ Failed to initialize Twilio client:', error.message);
}

// Ensure WhatsApp number is in correct format
if (process.env.TWILIO_WHATSAPP_FROM) {
  try {
    // Remove any existing 'whatsapp:' prefix and clean the number
    let cleanNumber = process.env.TWILIO_WHATSAPP_FROM.replace(/^whatsapp:/i, '').trim();
    
    // Remove all non-numeric characters except '+' at the start
    cleanNumber = cleanNumber.startsWith('+') 
      ? '+' + cleanNumber.substring(1).replace(/\D/g, '')
      : cleanNumber.replace(/\D/g, '');
    
    // Ensure the number starts with a country code
    if (!cleanNumber.startsWith('+')) {
      console.warn('⚠️ WhatsApp number should start with country code (e.g., +91 for India)');
    }
    
    // Add single 'whatsapp:' prefix
    process.env.TWILIO_WHATSAPP_FROM = `whatsapp:${cleanNumber}`;
    console.log('WhatsApp From Number:', process.env.TWILIO_WHATSAPP_FROM);
  } catch (error) {
    console.error('⚠️ Error formatting WhatsApp number:', error.message);
    console.warn('Using unformatted WhatsApp number, which may cause issues');
  }
} else {
  console.warn('⚠️ TWILIO_WHATSAPP_FROM is not set in .env');
  console.log('Example format: TWILIO_WHATSAPP_FROM=+14155238886');
}

// WhatsApp notification function with improved error handling
/**
 * Send WhatsApp message to a phone number
 * @param {string} to - Recipient phone number (with country code, e.g., '+1234567890')
 * @param {string} message - Message to send
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendWhatsAppNotification(to, message) {
  if (!twilioClient) {
    console.error('Twilio client not initialized');
    throw new Error('Notification service is not properly configured');
  }

  // Validate phone number format
  const phoneRegex = /^\+[1-9]\d{1,14}$/; // E.164 format
  if (!phoneRegex.test(to)) {
    console.error(`Invalid phone number format: ${to}`);
    throw new Error('Phone number must be in E.164 format (e.g., +1234567890)');
  }

  try {
    // Ensure the 'whatsapp:' prefix is present
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

    if (!fromNumber) {
      throw new Error('Twilio WhatsApp number is not configured');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    });

    console.log(`WhatsApp message sent to ${to}:`, result.sid);
    return {
      success: true,
      messageSid: result.sid,
      to: to,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.message);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
}

// Email and WhatsApp templates
const whatsappTemplates = {
  test: (repair, customer, store) => 
    `Test notification for ${customer.name}\n` +
    `Repair #${repair.ticketNumber}\n` +
    `Status: ${repair.status}\n` +
    `Store: ${store.name}\n` +
    `Contact: ${store.contact.phone}`,
  
  status_updated: (repair, customer, store) => 
    `🔧 Repair Update #${repair.ticketNumber}\n` +
    `Status: ${formatStatus(repair.status)}\n` +
    `Device: ${repair.device.brand} ${repair.device.model}\n` +
    `Issue: ${repair.problemDescription}\n\n` +
    `💼 ${store.name}\n` +
    `📞 ${store.contact.phone}`
};

const emailTemplates = {
  test: (repair, customer, store) => ({
    subject: `Test Notification - Repair #${repair.ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Test Notification</h2>
        <p>Hello ${customer.name},</p>
        <p>This is a test notification for repair #${repair.ticketNumber}.</p>
        <p><strong>Status:</strong> ${repair.status}</p>
        <p><strong>Store:</strong> ${store.name}</p>
        <p><strong>Contact:</strong> ${store.contact.phone}</p>
      </div>
    `
  }),
  status_updated: (repair, customer, store) => ({
    subject: `Repair Update - ${formatStatus(repair.status)} - #${repair.ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🔧 Repair Update</h2>
        <p>Hello ${customer.name},</p>
        <p>Your repair status has been updated:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Repair #${repair.ticketNumber}</h3>
          <p><strong>Status:</strong> ${formatStatus(repair.status)}</p>
          <p><strong>Device:</strong> ${repair.device.brand} ${repair.device.model}</p>
          <p><strong>Issue:</strong> ${repair.problemDescription}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <h3>${store.name}</h3>
          <p>📞 ${store.contact.phone}</p>
          <p>✉️ ${store.contact.email}</p>
          <p>📍 ${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.zipCode}</p>
        </div>
      </div>
    `
  })
};

// Helper function to format status
function formatStatus(status) {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Email transporter setup
const createEmailTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  };
  
  console.log('Email config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    passLength: config.auth.pass?.length || 0
  });
  
  return nodemailer.createTransport(config);
};

// Enhanced email sending function
async function sendEmailNotification(to, subject, html) {
  try {
    const transporter = createEmailTransporter();
    
    // Test connection first
    await transporter.verify();
    console.log('Email connection verified');
    
    const result = await transporter.sendMail({
      from: `"${process.env.STORE_NAME || "Laptop Store"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Email notification error:", error);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}

// Enhanced main notification function with validation
export async function sendRepairNotifications(
  repair,
  customer,
  store,
  type = "status_updated",
  customMessage = null,
) {
  console.log('=== STARTING NOTIFICATION PROCESS ===');
  console.log('Repair:', repair?.ticketNumber);
  console.log('Customer:', customer?.name);
  console.log('Store:', store?.name);
  console.log('Type:', type);
  
  // Validate required data
  if (!repair || !customer || !store) {
    console.error('Missing required data:', { repair: !!repair, customer: !!customer, store: !!store });
    return {
      whatsapp: { success: false, error: 'Missing required data' },
      email: { success: false, error: 'Missing required data' },
    };
  }

  const results = {
    whatsapp: { success: false },
    email: { success: false },
  };

  try {
    // Validate contact information
    const hasWhatsApp = repair.contactInfo?.whatsappNumber;
    const hasEmail = repair.contactInfo?.notificationEmail;
    
    console.log('Contact info:', {
      whatsapp: hasWhatsApp,
      email: hasEmail,
      whatsappNumber: repair.contactInfo?.whatsappNumber,
      emailAddress: repair.contactInfo?.notificationEmail
    });

    if (!hasWhatsApp && !hasEmail) {
      console.warn('No contact information available for notifications');
      return results;
    }

    // Generate messages (your existing template logic)
    let whatsappMessage, emailContent;
    
    if (type === "custom" && customMessage) {
      whatsappMessage = whatsappTemplates.custom(repair, customer, store, customMessage);
      emailContent = emailTemplates.custom(repair, customer, store, customMessage);
    } else if (whatsappTemplates[type] && emailTemplates[type]) {
      whatsappMessage = whatsappTemplates[type](repair, customer, store);
      emailContent = emailTemplates[type](repair, customer, store);
    } else {
      console.warn(`Unknown notification type: ${type}, using status_updated`);
      whatsappMessage = whatsappTemplates.status_updated(repair, customer, store);
      emailContent = emailTemplates.status_updated(repair, customer, store);
    }

    // Send WhatsApp notification
    if (hasWhatsApp) {
      console.log('Sending WhatsApp notification...');
      results.whatsapp = await sendWhatsAppNotification(
        repair.contactInfo.whatsappNumber,
        whatsappMessage,
      );
    } else {
      console.log('Skipping WhatsApp - no number provided');
    }

    // Send email notification
    if (hasEmail) {
      console.log('Sending email notification...');
      results.email = await sendEmailNotification(
        repair.contactInfo.notificationEmail,
        emailContent.subject,
        emailContent.html,
      );
    } else {
      console.log('Skipping email - no address provided');
    }

    console.log('=== NOTIFICATION RESULTS ===');
    console.log(`WhatsApp: ${results.whatsapp.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`Email: ${results.email.success ? '✅ Success' : '❌ Failed'}`);
    
    if (!results.whatsapp.success) {
      console.error('WhatsApp Error:', results.whatsapp.error);
    }
    if (!results.email.success) {
      console.error('Email Error:', results.email.error);
    }

    return results;
  } catch (error) {
    console.error("Critical error in notification system:", error);
    return {
      whatsapp: { success: false, error: error.message },
      email: { success: false, error: error.message },
    };
  }
}

// ===========================================
// TESTING FUNCTIONS
// ===========================================

/**
 * Test function to verify WhatsApp notification setup
 * @param {string} testPhoneNumber - Phone number to send test message (in E.164 format, e.g., '+1234567890')
 */
async function testNotificationSystem(testPhoneNumber) {
  console.log('=== Testing Notification System ===');
  
  if (!testPhoneNumber) {
    console.error('❌ Test failed: Please provide a test phone number in E.164 format (e.g., +1234567890)');
    return;
  }

  try {
    console.log(`Sending test WhatsApp message to ${testPhoneNumber}...`);
    
    const message = '🔔 This is a test notification from your repair service.\n\n' +
                   'If you received this message, your WhatsApp notifications are working correctly! 🎉';
    
    const result = await sendWhatsAppNotification(testPhoneNumber, message);
    
    console.log('✅ Test successful!');
    console.log('Message SID:', result.messageSid);
    console.log('Recipient:', result.to);
    console.log('Timestamp:', result.timestamp);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Provide helpful troubleshooting tips
    console.log('\nTroubleshooting Tips:');
    console.log('1. Ensure your Twilio account has WhatsApp messaging enabled');
    console.log('2. Verify the phone number is in E.164 format (e.g., +1234567890)');
    console.log('3. Check that your Twilio WhatsApp sandbox is properly configured');
    console.log('4. Ensure your Twilio account has sufficient balance');
    console.log('5. Verify your .env file has all required Twilio credentials');
  } finally {
    console.log('=== Test Complete ===');
  }
}

// Test function to check your setup
export async function testNotificationSystemOriginal() {
  console.log('=== TESTING NOTIFICATION SYSTEM ===');
  
  // 1. Check environment variables
  console.log('1. Environment Variables:');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('TWILIO_WHATSAPP_FROM:', process.env.TWILIO_WHATSAPP_FROM || '❌ Missing');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ Missing');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
  
  // 2. Test Twilio connection
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('2. Twilio Connection: ✅ Success, Status:', account.status);
  } catch (error) {
    console.log('2. Twilio Connection: ❌ Failed -', error.message);
  }
  
  // 3. Test email connection
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    console.log('3. Email Connection: ✅ Success');
  } catch (error) {
    console.log('3. Email Connection: ❌ Failed -', error.message);
  }
  
  // 4. Test with sample data
  const sampleRepair = {
    ticketNumber: 'TEST-001',
    device: { brand: 'Test', model: 'Model' },
    problemDescription: 'Test issue',
    status: 'in_progress',
    contactInfo: {
      whatsappNumber: '+919699616876', // Use your test number
      notificationEmail: 'test@example.com' // Use your test email
    },
    costs: { totalCost: 1000 },
    payment: { paidAmount: 0 },
    createdAt: new Date()
  };
  
  const sampleCustomer = { name: 'Test Customer' };
  const sampleStore = {
    name: 'Test Store',
    contact: { phone: '+919876543210', email: 'store@test.com' },
    address: { street: 'Test St', city: 'Test City', state: 'Test State', zipCode: '123456' }
  };
  
  console.log('4. Testing with sample data...');
  const result = await sendRepairNotifications(sampleRepair, sampleCustomer, sampleStore, 'test');
  console.log('Test Result:', result);
}

// ===========================================
// QUICK FIXES FOR YOUR .ENV
// ===========================================

/*
UPDATE YOUR .ENV FILE:

1. Fix WhatsApp number format:
TWILIO_WHATSAPP_FROM=+919699616876
(Remove the space)

2. For Gmail, you need App Password:
- Go to Google Account Settings
- Security > App passwords
- Generate new app password
- Use that instead of regular password

3. Add debugging:
NODE_ENV=development
DEBUG=true

4. Test with your actual numbers:
TEST_WHATSAPP_NUMBER=+919699616876
TEST_EMAIL=your-email@gmail.com
*/

// Export all public functions
const notificationService = {
  sendWhatsAppNotification,
  sendEmailNotification,
  sendRepairNotifications,
  testNotificationSystem,
  testNotificationSystemOriginal
};

export default notificationService;