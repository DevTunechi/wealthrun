// src/api/payments.js
import { auth } from "../services/firebase.js"; // ensure Firebase is initialized

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Create a payment invoice via WealthRun backend
 * @param {number} amount - The USD amount to invest
 * @param {string} coin - The crypto coin to pay with (BTC, ETH, USDT, etc.)
 */
export async function createPayment(amount, coin) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const res = await fetch(`${BASE_URL}/api/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // CORS + cookies
      body: JSON.stringify({
        amount,
        coin: coin.toUpperCase(), // ✅ pay currency
        userId: user.uid,         // ✅ Firebase UID
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to create payment");
    }

    return res.json(); // { payment_url, payment_id }
  } catch (error) {
    console.error("Payment API error:", error);
    throw error;
  }
}

/**
 * For quick testing without auth
 */
export async function createTestPayment() {
  try {
    const res = await fetch(`${BASE_URL}/api/payments/create-test`, {
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to create test payment");
    }
    return res.json(); // { payment_url, payment_id }
  } catch (error) {
    console.error("Test Payment API error:", error);
    throw error;
  }
}

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
      payment_currency,
      order_id,
      payment_id,
    } = req.body;

    // Only confirm finished/confirmed payments
    if (payment_status !== "finished" && payment_status !== "confirmed") {
      console.log(`ℹ️ Ignoring payment with status: ${payment_status}`);
      return res.sendStatus(200);
    }

    // Extract userId + planId from order_id (INV-timestamp-userId-planId)
    const parts = order_id.split("-");
    const userId = parts[parts.length - 2];
    const planId = parseInt(parts[parts.length - 1]);

    if (!userId || !planId) {
      console.error("❌ Invalid order_id format:", order_id);
      return res.status(400).json({ error: "Invalid order_id format" });
    }

    await prisma.$transaction(async (tx) => {
      // Ensure wallet exists
      let wallet = await tx.wallet.findFirst({ where: { userId } });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId,
            balance: 0,
          },
        });
        console.log(`🆕 Wallet auto-created for user ${userId} in callback`);
      }

      // Update transaction
      await tx.transaction.updateMany({
        where: { txId: payment_id.toString() },
        data: { status: "confirmed" },
      });

      // Create investment
      const investment = await tx.userInvestment.create({
        data: {
          userId,
          planId,
          amount: Number(price_amount),
          status: "active",
          startDate: new Date(),
        },
      });

      // Credit wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: Number(price_amount) } },
      });

      // Notify user
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user) {
        await sendPaymentReceivedEmail(user.email, {
          amount: price_amount,
          asset: payment_currency,
          txId: payment_id,
        });
      }

      // Audit trail
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
