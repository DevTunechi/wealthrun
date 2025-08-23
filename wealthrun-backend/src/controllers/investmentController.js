const { createInvestment } = require('../services/investmentService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const invest = async (req, res) => {
  const { planId, amount } = req.body;
  try {
    const investment = await createInvestment(req.user.userId, planId, amount);
    res.json({ message: "Investment successful", investment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  const investments = await prisma.userInvestment.findMany({
    where: { userId: req.user.userId },
    include: { plan: true }
  });
  res.json({ investments });
};

module.exports = { invest, getHistory };
