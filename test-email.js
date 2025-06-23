import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'rajeadityaa999@gmail.com',
    pass: 'your_16_char_app_password'
  }
});

transporter.sendMail({
  from: '"Test" <rajeadityaa999@gmail.com>',
  to: 'your_other_email@gmail.com',
  subject: 'Test Email',
  text: 'Hello from Nodemailer!'
}, (error, info) => {
  if (error) {
    return console.log('Error:', error);
  }
  console.log('Message sent:', info.messageId);
});