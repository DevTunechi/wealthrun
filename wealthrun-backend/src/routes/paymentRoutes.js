// src/routes/paymentRoutes.js
const express = require("express");
const fetch = require("node-fetch");

// Correct import for CommonJS
const NowPaymentsModule = require("@nowpaymentsio/nowpayments-api-js");
const NowPayments = NowPaymentsModule.default || NowPaymentsModule;

const router = express.Router();

// Initialize NowPayments client
const np = new NowPayments({ apiKey: process.env.NOWPAYMENTS_API_KEY });

/**
 * Create a real payment (POST)
 */
router.post("/create", async (req, res) => {
  try {
    const { amount, currency, userId } = req.body;

    if (!amount || !currency || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const payment = await np.createPayment({
      price_amount: amount,
      price_currency: "usd",
      pay_currency: currency.toLowerCase(),
      order_id: `INV-${Date.now()}-${userId}`,
      order_description: `WealthRun Investment for User ${userId}`,
      ipn_callback_url:
        "https://wealthrun-backend.up.railway.app/api/payments/callback",
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

/**
 * Create a TEST payment (GET for debugging in browser)
 */
router.get("/create-test", async (req, res) => {
  try {
    const response = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: 10, // fixed test amount
        price_currency: "usd",
        pay_currency: "btc",
        order_id: `TEST-${Date.now()}`,
        order_description: "WealthRun Test Payment",
        ipn_callback_url:
          "https://wealthrun-backend.up.railway.app/api/payments/callback",
      }),
    });

    const data = await response.json();
    console.log("NOWPayments create-test response:", data);

    if (!response.ok) {
      return res.status(400).json({
        error: "NOWPayments error",
        details: data,
      });
    }

    res.json({
      payment_url: data.invoice_url,
      payment_id: data.payment_id,
      raw: data, // return full payload for debugging
    });
  } catch (err) {
    console.error("NOWPayments create-test failed:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

/**
 * Callback handler for NOWPayments IPN
 */
router.post("/callback", (req, res) => {
  console.log("NOWPayments callback received:", req.body);
  // TODO: update user’s investment/payment status in DB
  res.sendStatus(200);
});

module.exports = router;
