const { createInvestment } = require("../services/investmentService");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * @desc Create a new investment
 * @route POST /api/investments/invest
 */
const invest = async (req, res) => {
  const { planId, amount } = req.body;

  try {
    const investment = await createInvestment(req.user.userId, planId, amount);
    res.json({ message: "Investment successful", investment });
  } catch (err) {
    console.error("❌ Investment creation error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

/**
 * @desc Get all investments for the current user
 * @route GET /api/investments/history
 */
const getHistory = async (req, res) => {
  try {
    // Note: If your Prisma schema model is named "UserInvestment",
    // you should use `prisma.userInvestment.findMany` here.
    const investments = await prisma.investment.findMany({
      where: { userId: req.user.userId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ investments });
  } catch (err) {
    console.error("❌ Error fetching investment history:", err.message);
    res.status(500).json({ message: "Failed to fetch investment history" });
  }
};

/**
 * @desc Get a single investment by ID
 * @route GET /api/investments/:id
 */
const getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Investment ID is required." });
    }

    // ✅ FIX: `findUnique` should use the unique ID from the route params,
    // not a potentially non-existent `userId` variable.
    const investment = await prisma.investment.findUnique({
      where: { id: parseInt(id) }, // Make sure to parse the string ID to an integer
      include: { plan: true, user: true },
    });

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    res.json(investment);
  } catch (error) {
    console.error("❌ Error fetching investment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { invest, getHistory, getInvestmentById };
