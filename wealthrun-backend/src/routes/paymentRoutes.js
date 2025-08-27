// src/routes/paymentRoutes.js
const express = require("express");
const fetch = require("node-fetch");
const { PrismaClient } = require("@prisma/client");

// Helpers
const { auditTransaction } = require("../middleware/auditTrail");
const { sendPaymentReceivedEmail } = require("../services/mailer");

// NOWPayments SDK
const NowPaymentsModule = require("@nowpaymentsio/nowpayments-api-js");
const NowPayments = NowPaymentsModule.default || NowPaymentsModule;

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Initialize NowPayments client
const np = new NowPayments({ apiKey: process.env.NOWPAYMENTS_API_KEY });

/**
 * @route   POST /api/payments/create
 * @desc    Create a real payment via NOWPayments
 */
router.post("/create", async (req, res) => {
  try {
    const { amount, currency, userId } = req.body;

    if (!amount || !currency || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Create payment with NOWPayments
    const payment = await np.createPayment({
      price_amount: amount,
      price_currency: "usd", // investment base in USD
      pay_currency: currency.toLowerCase(), // user-chosen coin
      order_id: `INV-${Date.now()}-${userId}`,
      order_description: `WealthRun Investment for User ${userId}`,
      ipn_callback_url: `${process.env.BACKEND_URL}/api/payments/callback`,
    });

    res.json({
      success: true,
      payment_url: payment.invoice_url,
      payment_id: payment.payment_id,
    });
  } catch (err) {
    console.error("NOWPayments error (create):", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

/**
 * @route   GET /api/payments/create-test
 * @desc    Quick test route for browser debugging
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
        price_amount: 10, // fixed test
        price_currency: "usd",
        pay_currency: "btc",
        order_id: `TEST-${Date.now()}`,
        order_description: "WealthRun Test Payment",
        ipn_callback_url: `${process.env.BACKEND_URL}/api/payments/callback`,
      }),
    });

    const data = await response.json();
    console.log("NOWPayments create-test response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "NOWPayments error",
        details: data,
      });
    }

    res.json({
      success: true,
      payment_url: data.invoice_url,
      payment_id: data.payment_id,
      raw: data,
    });
  } catch (err) {
    console.error("NOWPayments create-test failed:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

/**
 * @route   POST /api/payments/callback
 * @desc    Webhook handler for NOWPayments IPN
 */
router.post("/callback", async (req, res) => {
  try {
    console.log("📩 NOWPayments callback received:", req.body);

    const {
      payment_status,
      pay_amount,
      pay_currency,
      order_id,
      payment_id,
    } = req.body;

    if (payment_status !== "finished" && payment_status !== "confirmed") {
      console.log(`ℹ️ Ignoring payment with status: ${payment_status}`);
      return res.sendStatus(200);
    }

    // ✅ Extract userId from order_id (format: INV-timestamp-userId)
    const parts = order_id.split("-");
    const userId = parseInt(parts[2]);

    if (!userId) {
      console.error("❌ Could not extract userId from order_id:", order_id);
      return res.status(400).json({ error: "Invalid order_id format" });
    }

    // ✅ Check if transaction already exists
    const existingTx = await prisma.transaction.findUnique({
      where: { txId: payment_id.toString() },
    });

    if (existingTx) {
      console.log(`⚠️ Duplicate callback ignored for txId: ${payment_id}`);
      return res.sendStatus(200);
    }

    // ✅ Create transaction + update balance atomically
    await prisma.$transaction(async (tx) => {
      // Save transaction
      const payment = await tx.transaction.create({
        data: {
          userId,
          amount: Number(pay_amount),
          crypto: pay_currency,
          txId: payment_id.toString(),
          type: "deposit",
          status: "confirmed",
        },
        include: { user: true },
      });

      // Update investment balance
      await tx.investment.upsert({
        where: { userId },
        update: { balance: { increment: Number(pay_amount) } },
        create: {
          userId,
          balance: Number(pay_amount),
        },
      });

      // Notify user
      await sendPaymentReceivedEmail(payment.user.email, {
        amount: pay_amount,
        asset: pay_currency,
        txId: payment_id,
      });

      // Audit log
      await auditTransaction(userId, "deposit", {
        amount: pay_amount,
        crypto: pay_currency,
        txId: payment_id,
        status: "confirmed",
      });
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Callback error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
