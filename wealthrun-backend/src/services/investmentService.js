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
  const activeInvestments = await prisma.userInvestment.findMany({
    where: { status: "active" },
    include: { plan: true, user: true }
  });

  for (const inv of activeInvestments) {
    const roi = (inv.amount * inv.plan.roiPercent) / 100;
    await creditWallet(inv.userId, 'usdt', roi); // example: credit ROI in USDT
    await prisma.userInvestment.update({
      where: { id: inv.id },
      data: { lastCredited: new Date() }
    });
  }
};

module.exports = { createInvestment, creditROI };
