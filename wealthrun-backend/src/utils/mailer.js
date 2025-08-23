const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"WealthRun" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Error sending email:", err.message);
  }
};

module.exports = { sendEmail };
