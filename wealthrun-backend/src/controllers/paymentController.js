const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auditTransaction } = require('../middleware/auditTrail');
const { sendPaymentReceivedEmail } = require('../services/mailer');

// ------------------------
// Record a new payment
// ------------------------
const createPayment = async (req, res) => {
  try {
    const { userId, amount, asset, txId } = req.body;

    const payment = await prisma.transaction.create({
      data: {
        userId,
        amount,
        crypto: asset,
        txId,
        type: "deposit",
        status: "confirmed",
      },
      include: { user: true },
    });

    // Send payment received email
    await sendPaymentReceivedEmail(payment.user.email, {
      amount,
      asset,
      txId,
    });

    await auditTransaction(userId, 'deposit', {
      amount,
      crypto: asset,
      txId,
      status: 'confirmed',
    });

    res.json({ message: "Payment recorded", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------
// List all payments
// ------------------------
const listPayments = async (req, res) => {
  try {
    const payments = await prisma.transaction.findMany({
      where: { type: 'deposit' },
      include: { user: true, wallet: true },
    });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPayment, listPayments };
