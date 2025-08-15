// routes/testRoutes.js
import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.get("/send-test-email", async (req, res) => {
  const emailSent = await sendEmail(
    "recipient@example.com", // Change this to your test email
    "WealthRun Test Email",
    "<h1>Hello from WealthRun!</h1><p>This is a test email from your backend.</p>"
  );

  if (emailSent) {
    res.json({ success: true, message: "Test email sent successfully" });
  } else {
    res.status(500).json({ success: false, message: "Email sending failed" });
  }
});

export default router;
