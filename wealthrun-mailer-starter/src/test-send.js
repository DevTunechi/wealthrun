import dotenv from "dotenv";
import {
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendPaymentReceivedEmail,
  sendWithdrawalSuccessEmail,
} from "./mailer.js";

dotenv.config();

const fakeUser = "dev@example.com"; // change to your email for SMTP tests

const which = process.argv[2] || "welcome";

(async () => {
  try {
    if (which === "welcome") {
      await sendWelcomeEmail(fakeUser, {
        username: "Ola",
        verifyUrl: "https://wealthrun.com/verify?code=12345"
      });
    } else if (which === "password") {
      await sendPasswordChangedEmail(fakeUser, {
        device: "Chrome on Android",
        ip: "102.88.10.23"
      });
    } else if (which === "payment") {
      await sendPaymentReceivedEmail(fakeUser, {
        amount: "150.00",
        asset: "USDT",
        txId: "0xABCDEF1234567890"
      });
    } else if (which === "withdrawal") {
      await sendWithdrawalSuccessEmail(fakeUser, {
        amount: "75.00",
        asset: "USDT",
        destination: "TRC20: TX9...Pq"
      });
    } else {
      console.log("Unknown arg. Use one of: welcome | password | payment | withdrawal");
    }
  } catch (e) {
    console.error("Send failed:", e);
  }
})();
