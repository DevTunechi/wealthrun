const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auditTransaction } = require('../middleware/auditTrail');
const { sendWithdrawalSuccessEmail } = require('../services/mailer');

// ------------------------
// Approve / Reject withdrawal
// ------------------------
const handleWithdrawal = async (req, res) => {
  const { transactionId, action } = req.body; // action: "approve" or "reject"
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }, // get email
    });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    if (action === "approve") {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "confirmed" },
      });

      // Send withdrawal email
      await sendWithdrawalSuccessEmail(tx.user.email, {
        amount: tx.amount,
        asset: tx.crypto,
        destination: tx.destination,
      });

      await auditTransaction(req.user.userId, 'withdrawal', {
        amount: tx.amount,
        crypto: tx.crypto,
        status: 'approved',
      });

      res.json({ message: "Withdrawal approved" });
    } else if (action === "reject") {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "failed" },
      });
      await auditTransaction(req.user.userId, 'withdrawal', {
        amount: tx.amount,
        crypto: tx.crypto,
        status: 'rejected',
      });
      res.json({ message: "Withdrawal rejected" });
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------
// List all withdrawals
// ------------------------
const listWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.transaction.findMany({
      where: { type: 'withdrawal' },
      include: { wallet: true, user: true },
    });
    res.json({ withdrawals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleWithdrawal, listWithdrawals };
