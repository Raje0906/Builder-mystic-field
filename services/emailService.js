// EmailJS cannot be used from the backend due to API restrictions.
// See: https://www.emailjs.com/docs/examples/reactjs/

function sendEmailNotification() {
  throw new Error('EmailJS API calls are disabled for non-browser applications. Use EmailJS from the frontend.');
}

export { sendEmailNotification }; 