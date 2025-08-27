// controllers/paymentController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { auditTransaction } = require("../middleware/auditTrail");
const { sendPaymentReceivedEmail } = require("../services/mailer");

// ------------------------
// NOWPayments setup
// ------------------------
const NowPaymentsModule = require("@nowpaymentsio/nowpayments-api-js");
const NowPayments = NowPaymentsModule.default || NowPaymentsModule;
const np = new NowPayments({ apiKey: process.env.NOWPAYMENTS_API_KEY });

// ------------------------
// Create payment (DB record + NOWPayments invoice)
// ------------------------
const createPayment = async (req, res) => {
  try {
    const { userId, amount, currency } = req.body;

    if (!userId || !amount || !currency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Create NOWPayments invoice
    const payment = await np.createPayment({
      price_amount: amount,
      price_currency: "usd",
      pay_currency: currency.toLowerCase(),
      order_id: `INV-${Date.now()}-${userId}`,
      order_description: `WealthRun Investment for User ${userId}`,
      ipn_callback_url:
        "https://wealthrun-backend.up.railway.app/api/payments/callback",
    });

    // 2. Store pending record in DB
    await prisma.transaction.create({
      data: {
        userId,
        amount,
        crypto: currency.toLowerCase(),
        txId: payment.payment_id.toString(),
        type: "deposit",
        status: "pending",
      },
    });

    res.json({
      payment_url: payment.invoice_url,
      payment_id: payment.payment_id,
    });
  } catch (err) {
    console.error("NOWPayments error:", err);
    res.status(500).json({ error: "Failed to create payment" });
  }
};

// ------------------------
// NOWPayments callback (auto update DB + credit wallet)
// ------------------------
const handleCallback = async (req, res) => {
  try {
    const {
      payment_id,
      order_id,
      payment_status,
      pay_currency,
      price_amount,
    } = req.body;

    console.log("NOWPayments callback received:", req.body);

    // Map NOWPayments status → local status
    let status = "pending";
    if (payment_status === "finished") status = "confirmed";
    if (payment_status === "failed" || payment_status === "expired")
      status = "failed";

    // 1. Update existing DB record
    await prisma.transaction.updateMany({
      where: { txId: payment_id.toString(), type: "deposit" },
      data: {
        status,
        amount: price_amount,
        crypto: pay_currency,
      },
    });

    // 2. If confirmed, credit wallet + send email + audit
    if (status === "confirmed") {
      const tx = await prisma.transaction.findFirst({
        where: { txId: payment_id.toString() },
        include: { user: true },
      });

      if (tx?.user) {
        // ✅ credit wallet balance
        await prisma.wallet.update({
          where: { userId: tx.userId },
          data: {
            balance: { increment: tx.amount },
          },
        });

        // ✅ notify user
        await sendPaymentReceivedEmail(tx.user.email, {
          amount: tx.amount,
          asset: tx.crypto,
          txId: tx.txId,
        });
      }

      // ✅ audit log
      await auditTransaction(tx.userId, "deposit", {
        amount: tx.amount,
        crypto: tx.crypto,
        txId: tx.txId,
        status: tx.status,
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).json({ error: "Callback processing failed" });
  }
};

// ------------------------
// List all payments
// ------------------------
const listPayments = async (req, res) => {
  try {
    const payments = await prisma.transaction.findMany({
      where: { type: "deposit" },
      include: { user: true, wallet: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPayment, handleCallback, listPayments };
