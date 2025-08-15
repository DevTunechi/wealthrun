// utils/sendEmail.js
import transporter from "../config/email.js";

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"WealthRun" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed: ", error);
    return false;
  }
};

export default sendEmail;
