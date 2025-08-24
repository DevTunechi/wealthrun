// backend/src/services/mailer.js
const fs = require("fs");
const path = require("path");
const mjml2html = require("mjml");

// ----------------------
// Template Preview Helper
// ----------------------
function renderTemplate(templateFile, variables = {}) {
  const mjmlPath = path.join(__dirname, "../../wealthrun-mailer-starter/src/emails", templateFile);
  let mjml = fs.readFileSync(mjmlPath, "utf8");

  // Replace {{var}} placeholders with provided values
  for (const [key, val] of Object.entries(variables)) {
    mjml = mjml.replace(new RegExp(`{{${key}}}`, "g"), val);
  }

  return mjml2html(mjml).html;
}

// ----------------------
// Email Senders (from starter)
// ----------------------
const {
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendPaymentReceivedEmail,
  sendWithdrawalSuccessEmail,
} = require("../../wealthrun-mailer-starter/src/mailer.js");

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
