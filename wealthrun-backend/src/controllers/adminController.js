const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auditTransaction } = require('../middleware/auditTrail');

// ------------------------
// List all users
// ------------------------
const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------
// Approve / Reject withdrawal
// ------------------------
const handleWithdrawal = async (req, res) => {
  const { transactionId, action } = req.body; // action: "approve" or "reject"
  try {
    const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    if (action === "approve") {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "confirmed" },
      });
      // Audit log
      await auditTransaction(req.user.userId, 'withdrawal', { amount: tx.amount, crypto: tx.crypto, status: 'approved' });
      res.json({ message: "Withdrawal approved" });
    } else if (action === "reject") {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "failed" },
      });
      // Audit log
      await auditTransaction(req.user.userId, 'withdrawal', { amount: tx.amount, crypto: tx.crypto, status: 'rejected' });
      res.json({ message: "Withdrawal rejected" });
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------
// Manage Investment Plans (CRUD)
// ------------------------
const createPlan = async (req, res) => {
  try {
    const plan = await prisma.investmentPlan.create({ data: req.body });
    res.json({ message: "Plan created", plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePlan = async (req, res) => {
  const { planId } = req.params;
  try {
    const plan = await prisma.investmentPlan.update({
      where: { id: parseInt(planId) },
      data: req.body,
    });
    res.json({ message: "Plan updated", plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePlan = async (req, res) => {
  const { planId } = req.params;
  try {
    await prisma.investmentPlan.delete({ where: { id: parseInt(planId) } });
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------
// View all transactions
// ------------------------
const listTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { wallet: true },
    });
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  listUsers,
  handleWithdrawal,
  createPlan,
  updatePlan,
  deletePlan,
  listTransactions,
};
