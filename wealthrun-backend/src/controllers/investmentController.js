// backend/src/controllers/investmentController.js
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
    const investments = await prisma.userInvestment.findMany({
      where: { userId: req.user.userId }, // ✅ userId is String in schema
      include: { plan: true },
      orderBy: { startDate: "desc" }, // ✅ field exists in schema
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

    const investment = await prisma.userInvestment.findUnique({
      where: { id: parseInt(id) }, // ✅ id is Int in schema
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

/**
 * @desc Get summarized investments for dashboard
 * @route GET /api/investments/summary/:userId
 */
const getInvestmentSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const investments = await prisma.userInvestment.findMany({
      where: { userId }, // ✅ userId is String (not Int)
    });

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

    res.json({
      userId,
      totalInvested,
      count: investments.length,
    });
  } catch (err) {
    console.error("❌ Error fetching investment summary:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  invest,
  getHistory,
  getInvestmentById,
  getInvestmentSummary,
};
