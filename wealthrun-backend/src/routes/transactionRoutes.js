// backend/src/routes/transactionRoutes.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @desc Controller to get all transactions for a specific user
 */
const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📥 Incoming request for transactions:", userId);

    if (!userId || typeof userId !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid userId. Must be a string." });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,   // include user data if needed
        wallet: true, // include wallet data if needed
      },
    });

    return res.json(transactions);
  } catch (err) {
    console.error("❌ Transactions fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

/**
 * ✅ Route to get all transactions for a specific user
 * GET /api/transactions/:userId
 */
router.get("/:userId", getUserTransactions);

/**
 * ✅ Create a new transaction
 * POST /api/transactions
 */
router.post("/", async (req, res) => {
  try {
    const { userId, walletId, type, crypto, amount, status } = req.body;

    if (!userId || !walletId || !type || !amount || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        type,
        crypto,
        amount: parseFloat(amount),
        status,
        wallet: {
          connect: { id: walletId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    return res.status(201).json(newTransaction);
  } catch (err) {
    console.error("❌ Transaction creation error:", err);
    return res.status(500).json({ error: "Failed to create transaction" });
  }
});

module.exports = router;
