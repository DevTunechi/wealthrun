// src/routes/paymentRoutes.js
const express = require("express");

// Correct import for CommonJS
const NowPaymentsModule = require("@nowpaymentsio/nowpayments-api-js");
const NowPayments = NowPaymentsModule.default || NowPaymentsModule;

const router = express.Router();

// Initialize NowPayments client
const np = new NowPayments({ apiKey: process.env.NOWPAYMENTS_API_KEY });

// Create payment endpoint
router.post("/create", async (req, res) => {
  try {
    const { amount, currency, userId } = req.body;

    if (!amount || !currency || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const payment = await np.createPayment({
      price_amount: amount,
      price_currency: "usd",
      pay_currency: currency,
      order_id: `INV-${Date.now()}-${userId}`,
      order_description: `WealthRun Investment for User ${userId}`,
      ipn_callback_url: "https://wealthrun-backend.up.railway.app/api/payments/callback"
    });

    res.json({
      payment_url: payment.invoice_url,
      payment_id: payment.payment_id,
    });
  } catch (err) {
    console.error("NOWPayments error:", err);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// NOWPayments callback
router.post("/callback", (req, res) => {
  console.log("NOWPayments callback:", req.body);
  // TODO: update user's investment in DB
  res.sendStatus(200);
});

module.exports = router;
