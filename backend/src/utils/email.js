const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true, // Force true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"Xillix Real Estate" <noreply@xillix.co.ke>',
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error to prevent blocking the main flow if email fails
    return null;
  }
};

const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Xillix - Your Real Estate Partner';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Welcome to Xillix, ${user.firstName}!</h2>
      <p>Thank you for joining Kenya's premier real estate platform.</p>
      <p>You can now:</p>
      <ul>
        <li>Browse thousands of properties</li>
        <li>Contact agents directly</li>
        <li>Save your favorite listings</li>
        <li>List your own properties (for agents)</li>
      </ul>
      <p>If you have any questions, feel free to reply to this email.</p>
      <br>
      <p>Best regards,</p>
      <p>The Xillix Team</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
};
