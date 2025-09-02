// backend/src/routes/investmentRoutes.js
const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma"); // ✅ central Prisma instance

const { auth } = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/inputSanitize");

const { getInvestmentSummary } = require("../controllers/investmentController.js");

// ---------------------------
// Create new investment
// ---------------------------
router.post(
  "/invest",
  auth,
  validateRequest([
    body("amount").isFloat({ min: 1 }),
    body("planId").isInt(),
  ]),
  async (req, res) => {
    try {
      const { amount, planId } = req.body;
      const userId = req.user.id;

      // ✅ Verify plan exists
      const plan = await prisma.investmentPlan.findUnique({
        where: { id: planId },
      });
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      // ✅ Verify amount within plan limits
      if (amount < plan.minAmount || amount > plan.maxAmount) {
        return res.status(400).json({ error: "Amount outside plan limits" });
      }

      // ✅ Create user investment record
      const investment = await prisma.userInvestment.create({
        data: {
          userId,
          planId,
          amount,
          status: "active",
        },
      });

      // ✅ Link transaction to user's wallet
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        return res.status(400).json({ error: "User wallet not found" });
      }

      await prisma.transaction.create({
        data: {
          wallet: { connect: { id: wallet.id } },
          type: "investment",
          crypto: "USD", // placeholder
          amount,
          status: "pending",
        },
      });

      res.json(investment);
    } catch (err) {
      console.error("❌ Error creating investment:", err);
      res.status(500).json({ error: "Failed to create investment" });
    }
  }
);

// ---------------------------
// Investment summary (dashboard)
// ---------------------------
router.get("/summary/:userId", getInvestmentSummary);

// ---------------------------
// Get authenticated user's investment history
// ---------------------------
router.get("/history", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const investments = await prisma.userInvestment.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { startDate: "desc" },
    });
    res.json(investments);
  } catch (err) {
    console.error("❌ Error fetching investments:", err);
    res.status(500).json({ error: "Failed to fetch investments" });
  }
});

// ---------------------------
// Get investments by userId (admin/dashboard)
// ---------------------------
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const investments = await prisma.userInvestment.findMany({
      where: { userId }, // keep as string (UUID)
      include: { plan: true },
      orderBy: { startDate: "desc" },
    });
    res.json(investments);
  } catch (err) {
    console.error("❌ Error fetching investments:", err);
    res.status(500).json({ error: "Failed to fetch investments" });
  }
});

module.exports = router;
