const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

/**
 * ✅ Get all transactions for a specific user
 * Expects :userId (String) as a route param
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📥 Incoming request for transactions:", userId);

    if (!userId || typeof userId !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid userId. Must be a string." });
    }

    // ✅ Fetch transactions linked to this user
    // NOTE: This will only work if your Prisma schema's 'Transaction' model has a 'userId' field.
    // Make sure you've run 'npx prisma db push' to sync your schema with the database.
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: true, // optional: include user data if needed
        wallet: true, // optional: include wallet data if needed
      },
    });

    return res.json(transactions);
  } catch (err) {
    console.error("❌ Transactions fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

/**
 * ✅ Create a new transaction
 * (Optional route if you want to create transactions from API)
 */
router.post("/", async (req, res) => {
  try {
    const { userId, walletId, type, crypto, amount, status } = req.body;

    if (!userId || !walletId || !type || !amount || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ❌ OLD: The `walletId` field is a foreign key, but Prisma requires a nested write
    // for relations. You cannot simply pass the `walletId` as a scalar field here.
    const newTransaction = await prisma.transaction.create({
      data: {
        type,
        crypto,
        amount: parseFloat(amount),
        status,
        // ✅ NEW: Use the 'connect' syntax to link this new transaction
        // to an existing wallet record.
        wallet: {
          connect: { id: walletId },
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
