// EmailJS Backend Service
import emailjs from '@emailjs/nodejs';

const SERVICE_ID = 'service_hpz532o';
const TEMPLATE_ID = 'template_n0s86ti';
const PUBLIC_KEY = 'IAgtIkM8K9OyLAgdP';

async function sendEmailNotification(to, subject, message) {
  const templateParams = {
    to_email: to,
    subject,
    message,
  };
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
}

export { sendEmailNotification }; 