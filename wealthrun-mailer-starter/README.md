# WealthRun Mailer (Starter)

A minimal Node.js mailer using Nodemailer + MJML + Handlebars.
Includes ready-made templates for:
- Welcome / Registration
- Password Changed
- Payment Received
- Withdrawal Successful

## Quick Start

1) Install Node.js 18+ and VS Code.
2) Unzip this project, then open the folder in VS Code.
3) Copy `.env.example` to `.env` and adjust values.
   - If you don't have SMTP yet, set `DEV_ETHEREAL=true` to test instantly.
4) Install dependencies:
   ```bash
   npm install
   ```
5) Send a test email:
   ```bash
   npm run send:welcome
   ```

Check your terminal for an Ethereal preview URL (for DEV_ETHEREAL mode).
For production, set your SMTP variables and set `DEV_ETHEREAL=false`.

## Files
- `src/mailer.js` → transport + template rendering
- `src/templates/*.mjml` → email MJML templates
- `src/test-send.js` → quick manual tests
- `.env.example` → environment variables
