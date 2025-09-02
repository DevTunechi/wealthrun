const prisma = require('../prismaClient');

// ✅ Get all transactions for a user
exports.getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found" });
    }

    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// ✅ (Optional) Create a transaction
exports.createTransaction = async (req, res) => {
  try {
    const { userId, type, amount, status } = req.body;

    const transaction = await prisma.transaction.create({
      data: { userId, type, amount, status }
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};
