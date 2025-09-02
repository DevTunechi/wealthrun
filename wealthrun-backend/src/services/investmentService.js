// backend/src/services/investmentService.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { creditWallet } = require("./walletService.js");

/**
 * Create a new investment
 */
const createInvestment = async (userId, planId, amount) => {
  const plan = await prisma.investmentPlan.findUnique({
    where: { id: planId },
  });
  if (!plan) throw new Error("Investment plan not found");

  if (amount < plan.minAmount || amount > plan.maxAmount) {
    throw new Error(
      `Amount must be between ${plan.minAmount} and ${plan.maxAmount}`
    );
  }

  const investment = await prisma.userInvestment.create({
    data: {
      userId, // String
      planId, // Int
      amount, // Float
      status: "active",
      startDate: new Date(),
    },
    include: { plan: true },
  });

  return investment;
};

/**
 * Monthly ROI crediting
 */
const creditROI = async () => {
  const activeInvestments = await prisma.userInvestment.findMany({
    where: { status: "active" },
    include: { plan: true, user: true },
  });

  for (const inv of activeInvestments) {
    const roi = (inv.amount * inv.plan.roiPercent) / 100;

    // ✅ Credit ROI into wallet (assuming creditWallet handles balances by currency)
    await creditWallet(inv.userId, "btc", roi);

    // ✅ Mark this investment as last credited
    await prisma.userInvestment.update({
      where: { id: inv.id },
      data: { lastCredited: new Date() },
    });
  }
};

module.exports = { createInvestment, creditROI };
