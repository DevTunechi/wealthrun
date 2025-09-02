const express = require("express");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const { auditTransaction } = require("../middleware/auditTrail");
const { sendPaymentReceivedEmail } = require("../services/mailer");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * ✅ Create Invoice Route
 * - Users enter amount + choose coin (BTC, ETH, USDT, etc.)
 * - Backend auto-determines plan
 * - Invoices in USD, pays in selected coin
 */
router.post("/create", async (req, res) => {
  try {
    console.log("Incoming Payment Request:", req.body);
    const { amount, coin, userId } = req.body;

    if (!amount || !coin || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔹 Auto-determine plan based on amount
    const plan = await prisma.investmentPlan.findFirst({
      where: {
        minAmount: { lte: amount },
        maxAmount: { gte: amount },
      },
    });

    if (!plan) {
      return res.status(400).json({ error: "No valid plan for this amount" });
    }

    // 🔹 Create unique orderId
    const orderId = `INV-${Date.now()}-${userId}-${plan.id}`;

    // 🔹 Call NOWPayments API
    const response = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
      {
        price_amount: amount,
        price_currency: "usd", // Always USD
        pay_currency: coin, // User-selected coin
        order_id: orderId,
        order_description: `WealthRun Investment for User ${userId}`,
        ipn_callback_url: `${process.env.BACKEND_URL}/api/payments/callback`,
        success_url: "https://wealthrun.vercel.app/dashboard",
        cancel_url: "https://wealthrun.vercel.app/cancel",
      },
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // 🔹 Find user's wallet
    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      return res.status(400).json({ error: "Wallet not found for user" });
    }

    // 🔹 Save transaction record
    await prisma.transaction.create({
      data: {
        user: { connect: { id: userId } },
        wallet: { connect: { id: wallet.id } }, // ✅ attach wallet
        type: "investment",
        amount: Number(amount),
        crypto: coin,
        txId: response.data.id.toString(),
        status: "pending",
        metadata: { planId: plan.id },
      },
    });

    console.log("✅ NOWPayments create response:", response.data);

    return res.json({
      success: true,
      invoice_url: response.data.invoice_url,
      payment_id: response.data.id,
      selected_plan: plan,
    });
  } catch (error) {
    console.error("❌ NOWPayments create error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Could not create payment" });
  }
});

/**
 * ✅ IPN Callback (NOWPayments → WealthRun)
 * - Confirms the payment
 * - Activates investment & credits wallet
 */
router.post("/callback", async (req, res) => {
  try {
    console.log("📩 NOWPayments callback received:", req.body);

    const {
      payment_status,
      price_amount,
      price_currency,
      payment_currency, // Coin used for payment
      order_id,
      payment_id,
    } = req.body;

    if (payment_status !== "finished" && payment_status !== "confirmed") {
      console.log(`ℹ️ Ignoring payment with status: ${payment_status}`);
      return res.sendStatus(200);
    }

    // 🔹 Extract userId + planId
    const parts = order_id.split("-");
    const userId = parts[parts.length - 2];
    const planId = parseInt(parts[parts.length - 1]);

    if (!userId || !planId) {
      console.error("❌ Invalid order_id format:", order_id);
      return res.status(400).json({ error: "Invalid order_id format" });
    }

    await prisma.$transaction(async (tx) => {
      // ✅ Mark transaction confirmed
      await tx.transaction.update({
        where: { txId: payment_id.toString() },
        data: { status: "confirmed" },
      });

      // ✅ Create investment record
      const investment = await tx.userInvestment.create({
        data: {
          userId,
          planId,
          amount: Number(price_amount),
          status: "active",
          startDate: new Date(),
        },
      });

      // ✅ Update wallet balance
      await tx.wallet.update({
        where: { userId },
        data: { balance: { increment: Number(price_amount) } },
      });

      // ✅ Notify user
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user) {
        await sendPaymentReceivedEmail(user.email, {
          amount: price_amount,
          asset: payment_currency,
          txId: payment_id,
        });
      }

      // ✅ Audit
      await auditTransaction(userId, "investment", {
        amount: price_amount,
        crypto: payment_currency,
        txId: payment_id,
        status: "confirmed",
        planId,
        investmentId: investment.id,
      });
    });

    console.log(`💰 User ${userId} invested ${price_amount} ${payment_currency} in plan ${planId}`);
    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Callback error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
