const express = require("express");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const { auditTransaction } = require("../middleware/auditTrail");
const { sendPaymentReceivedEmail } = require("../services/mailer");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * ✅ Create Payment Route
 * - Users enter amount + choose coin (BTC, ETH, USDT, etc.)
 * - Backend auto-determines plan
 * - Creates a direct payment using NOWPayments and returns the wallet + amount to the frontend
 */
router.post("/create", async (req, res) => {
  try {
    console.log("Incoming Payment Request:", req.body);
    const { amount, coin, userId } = req.body;

    if (!amount || !coin || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // --- FIX: Ensure user exists before creating any related records ---
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.log(`User ${userId} not found. Auto-creating user record.`);
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `unverified_${userId}@wealthrun.com`,
          name: `User_${userId.substring(0, 0)}`,
          password: "NO_PASSWORD_FOR_GOOGLE_USER",
        },
      });
    }
    // --- END OF FIX ---

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

    // 🔹 Call NOWPayments API to create a direct payment
    const npRes = await axios.post(
      "https://api.nowpayments.io/v1/payment",
      {
        price_amount: amount,
        price_currency: "usd", // Always USD
        pay_currency: coin.toLowerCase(), // User-selected coin
        order_id: orderId,
        ipn_callback_url: `${process.env.BACKEND_URL}/api/payments/callback`,
      },
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const payment = npRes.data;

    // 🔹 Ensure user has a wallet (auto-create if not)
    let wallet = await prisma.wallet.findFirst({
      where: { userId: user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          btcBalance: 0,
          ethBalance: 0,
          usdtBalance: 0,
          piBalance: 0,
        },
      });
      console.log(`🆕 Wallet created for user ${userId}`);
    }

    // 🔹 Save transaction record
    await prisma.transaction.create({
      data: {
        user: { connect: { id: userId } },
        wallet: { connect: { id: wallet.id } }, // ✅ attach wallet
        type: "investment",
        amount: Number(amount),
        crypto: coin,
        txId: payment.payment_id.toString(),
        status: "pending",
        metadata: { planId: plan.id },
      },
    });

    console.log("✅ NOWPayments create response:", payment);

    // Return the specific payment details needed by the frontend
    return res.json({
      payment_id: payment.payment_id,
      pay_address: payment.pay_address,
      pay_amount: payment.pay_amount,
      pay_currency: payment.pay_currency,
    });
  } catch (error) {
    console.error(
      "❌ NOWPayments create error:",
      error.response?.data || error.message
    );
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
      // --- FIX: Ensure user exists before creating a wallet in the callback
      let user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        console.log(`User ${userId} not found. Auto-creating user record in callback.`);
        user = await tx.user.create({
          data: {
            id: userId,
            email: `unverified_${userId}@wealthrun.com`,
            name: `User_${userId.substring(0, 0)}`,
            password: "NO_PASSWORD_FOR_GOOGLE_USER",
          },
        });
      }
      // --- END OF FIX ---

      // ✅ Ensure wallet exists
      let wallet = await tx.wallet.findFirst({ where: { userId: user.id } });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: user.id,
            btcBalance: 0,
            ethBalance: 0,
            usdtBalance: 0,
            piBalance: 0,
          },
        });
        console.log(`🆕 Wallet auto-created for user ${userId} in callback`);
      }

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

      // ✅ Coin → Wallet field map
      const coinFieldMap = {
        btc: "btcBalance",
        eth: "ethBalance",
        usdt: "usdtBalance",
        pi: "piBalance",
      };

      const balanceField = coinFieldMap[payment_currency?.toLowerCase()];
      if (!balanceField) {
        throw new Error(`Unsupported coin type: ${payment_currency}`);
      }

      // ✅ Update wallet balance
      await tx.wallet.update({
        where: { userId: user.id },
        data: { [balanceField]: { increment: Number(price_amount) } },
      });

      // ✅ Notify user
      const userToNotify = await tx.user.findUnique({ where: { id: userId } });
      if (userToNotify) {
        await sendPaymentReceivedEmail(userToNotify.email, {
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

    console.log(
      `💰 User ${userId} invested ${price_amount} ${payment_currency} in plan ${planId}`
    );
    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Callback error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
