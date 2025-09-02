const express = require('express');
const router = express.Router();
const { invest, getHistory } = require('../controllers/investmentController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auth } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/inputSanitize');

// ✅ Create new investment
router.post(
  '/invest',
  auth,
  validateRequest([
    body('amount').isFloat({ min: 1 }),
    body('planId').isInt()
  ]),
  async (req, res) => {
    try {
      const { amount, planId } = req.body;
      const userId = req.user.id;

      // Verify plan exists
      const plan = await prisma.investmentPlan.findUnique({
        where: { id: planId }
      });
      if (!plan) return res.status(404).json({ error: 'Plan not found' });

      // Verify amount within plan limits
      if (amount < plan.minAmount || amount > plan.maxAmount) {
        return res.status(400).json({ error: 'Amount outside plan limits' });
      }

      // ✅ Create investment record
      const investment = await prisma.userInvestment.create({
        data: {
          // The userId from the auth middleware is used here
          userId, 
          planId,
          amount,
          status: 'active'
        }
      });

      // ✅ Create transaction record linked to user’s wallet
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        return res.status(400).json({ error: 'User wallet not found' });
      }

      await prisma.transaction.create({
        data: {
          // ❌ OLD: Prisma requires the 'connect' syntax for related records.
          // walletId: wallet.id,
          // ✅ NEW: Use the 'connect' syntax to link this transaction to the wallet.
          wallet: {
            connect: { id: wallet.id },
          },
          type: 'investment',
          // ❌ OLD: 'paymentData' is not defined in this scope.
          // crypto: paymentData.pay_currency || 'BTC',
          // ✅ NEW: Since this route isn't tied to a specific crypto payment,
          // we use a placeholder or hardcoded value.
          crypto: 'USD',
          amount,
          status: 'pending'
        }
      });

      res.json(investment);
    } catch (err) {
      console.error('❌ Error creating investment:', err);
      res.status(500).json({ error: 'Failed to create investment' });
    }
  }
);

// ✅ Get authenticated user’s investments
router.get('/history', auth, getHistory, async (req, res) => {
  try {
    const userId = req.user.id;
    const investments = await prisma.userInvestment.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { startDate: 'desc' }
    });
    res.json(investments);
  } catch (err) {
    console.error('❌ Error fetching investments:', err);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// ✅ For dashboard: fetch by userId param
router.get('/:userId', getInvestmentById, async (req, res) => {
  try {
    const { userId } = req.params;
    const investments = await prisma.userInvestment.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { startDate: 'desc' }
    });
    res.json(investments);
  } catch (err) {
    console.error('❌ Error fetching investments:', err);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

module.exports = router;
