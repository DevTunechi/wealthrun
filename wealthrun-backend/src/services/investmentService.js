const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { creditWallet } = require('./walletService.js');

const createInvestment = async (userId, planId, amount) => {
  const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("Investment plan not found");

  if (amount < plan.minAmount || amount > plan.maxAmount) {
    throw new Error(`Amount must be between ${plan.minAmount} and ${plan.maxAmount}`);
  }

  const investment = await prisma.userInvestment.create({
    data: { userId, planId, amount, status: "active" }
  });

  return investment;
};

// Monthly ROI calculation
const creditROI = async () => {
  // NOTE: Your Prisma model is likely called 'UserInvestment'.
  // This uses `findMany` correctly to get all active investments.
  const activeInvestments = await prisma.userInvestment.findMany({
    where: { status: "active" },
    include: { plan: true, user: true }
  });

  for (const inv of activeInvestments) {
    const roi = (inv.amount * inv.plan.roiPercent) / 100;
    // This call assumes the 'creditWallet' service exists and is working correctly.
    await creditWallet(inv.userId, 'btc', roi); // example: credit ROI in BTC
    
    // ❌ OLD: The `where` clause used `userId`, which is not a unique identifier for an investment.
    // await prisma.userInvestment.update({ where: { userId }, data: { lastCredited: new Date() } });

    // ✅ NEW: Update the specific investment record from the loop using its unique `id`.
    await prisma.userInvestment.update({
      where: { id: inv.id },
      data: { lastCredited: new Date() }
    });
  }
};

module.exports = { createInvestment, creditROI };
