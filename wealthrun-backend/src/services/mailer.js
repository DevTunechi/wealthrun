// backend/src/services/mailer.js
const fs = require("fs");
const path = require("path");
const mjml2html = require("mjml");
const nodemailer = require("nodemailer");

// ----------------------
// Template Renderer
// ----------------------
function renderTemplate(templateFile, variables = {}) {
  const mjmlPath = path.join(__dirname, "../emails", templateFile);
  let mjml = fs.readFileSync(mjmlPath, "utf8");

  for (const [key, val] of Object.entries(variables)) {
    mjml = mjml.replace(new RegExp(`{{${key}}}`, "g"), val);
  }

  return mjml2html(mjml).html;
}

// ----------------------
// Transporter Setup
// ----------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ----------------------
// Email Senders
// ----------------------
async function sendWelcomeEmail(to, variables) {
  const html = renderTemplate("welcome.mjml", variables);
  return transporter.sendMail({
    from: `"WealthRun" <${process.env.SMTP_USER}>`,
    to,
    subject: "Welcome to WealthRun 🎉",
    html,
  });
}

async function sendPasswordChangedEmail(to, variables) {
  const html = renderTemplate("passwordChanged.mjml", variables);
  return transporter.sendMail({
    from: `"WealthRun" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your password was changed 🔒",
    html,
  });
}

async function sendPaymentReceivedEmail(to, variables) {
  const html = renderTemplate("paymentReceived.mjml", variables);
  return transporter.sendMail({
    from: `"WealthRun" <${process.env.SMTP_USER}>`,
    to,
    subject: "We received your payment ✅",
    html,
  });
}

async function sendWithdrawalSuccessEmail(to, variables) {
  const html = renderTemplate("withdrawalSuccess.mjml", variables);
  return transporter.sendMail({
    from: `"WealthRun" <${process.env.SMTP_USER}>`,
    to,
    subject: "Withdrawal Successful 💸",
    html,
  });
}

// ----------------------
// Exports
// ----------------------
module.exports = {
  renderTemplate,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendPaymentReceivedEmail,
  sendWithdrawalSuccessEmail,
};
