import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import mjml2html from "mjml";
import juice from "juice";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, "templates");
const PARTIALS_DIR = path.join(TEMPLATES_DIR, "partials");

// Register Handlebars partials
function registerPartials() {
  if (!fs.existsSync(PARTIALS_DIR)) return;
  const files = fs.readdirSync(PARTIALS_DIR);
  files.forEach((f) => {
    const full = path.join(PARTIALS_DIR, f);
    if (fs.statSync(full).isFile() && f.endsWith(".mjml")) {
      const name = path.basename(f, ".mjml");
      const content = fs.readFileSync(full, "utf8");
      Handlebars.registerPartial(name, content);
    }
  });
}
registerPartials();

function compileTemplate(templateName, data = {}) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.mjml`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  const raw = fs.readFileSync(templatePath, "utf8");
  // 1) Expand Handlebars (partials + variables) at the MJML level
  const mjmlExpanded = Handlebars.compile(raw)({
    year: new Date().getFullYear(),
    ...data,
  });
  // 2) Convert MJML to HTML
  const { html, errors } = mjml2html(mjmlExpanded, { keepComments: false, beautify: false });
  if (errors && errors.length) {
    console.warn("MJML errors:", errors);
  }
  // 3) Inline CSS for better deliverability
  const inlined = juice(html);
  return inlined;
}

async function createTransport() {
  // Dev mode: use Ethereal test inbox if enabled
  if (process.env.DEV_ETHEREAL === "true") {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    return { transporter, mode: "ethereal" };
  }

  // Production / real SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: String(process.env.MAIL_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  return { transporter, mode: "smtp" };
}

export async function sendTemplated(to, subject, templateName, data) {
  const { transporter, mode } = await createTransport();
  const html = compileTemplate(templateName, data);

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || "WealthRun <no-reply@wealthrun.com>",
    to,
    subject,
    html,
    replyTo: process.env.MAIL_REPLY_TO || undefined,
  });

  if (mode === "ethereal") {
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  }
  return info;
}

// Domain specific helpers
export function sendWelcomeEmail(to, { username, verifyUrl } = {}) {
  return sendTemplated(to, "Welcome to WealthRun 🚀", "welcome", {
    username,
    verifyUrl,
    supportEmail: process.env.MAIL_REPLY_TO || "support@wealthrun.com",
  });
}

export function sendPasswordChangedEmail(to, { device, ip } = {}) {
  return sendTemplated(to, "Your WealthRun password was changed", "password-changed", {
    device,
    ip,
    supportEmail: process.env.MAIL_REPLY_TO || "support@wealthrun.com",
  });
}

export function sendPaymentReceivedEmail(to, { amount, asset, txId } = {}) {
  return sendTemplated(to, "Payment received", "payment-received", {
    amount,
    asset,
    txId,
    supportEmail: process.env.MAIL_REPLY_TO || "support@wealthrun.com",
  });
}

export function sendWithdrawalSuccessEmail(to, { amount, asset, destination } = {}) {
  return sendTemplated(to, "Withdrawal successful", "withdrawal-success", {
    amount,
    asset,
    destination,
    supportEmail: process.env.MAIL_REPLY_TO || "support@wealthrun.com",
  });
}
