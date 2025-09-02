const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    console.log('🌱 Starting setup process...');
    
    // Create or find a dummy user
    let user = await prisma.user.findFirst({ where: { email: 'wealthruninfo@gmail.com' } });
    if (!user) {
      const hashedPassword = await bcrypt.hash('wealthrun$88', 10);
      user = await prisma.user.create({
        data: {
          name: 'Williams Vicky',
          email: 'wealthruninfo@gmail.com',
          password: hashedPassword,
          role: 'user',
        },
      });
      console.log('✅ User created.');
    } else {
      console.log('✅ User already exists.');
    }

    // Create or find a wallet
    let wallet = await prisma.wallet.findFirst({ where: { userId: user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          btcBalance: 2.809,
          ethBalance: 14.12,
          usdtBalance: 69.09,
          piBalance: 0.0,
        },
      });
      console.log('✅ Wallet created.');
    } else {
      console.log('✅ Wallet already exists.');
    }

    // Create or find investment plans
    const plansData = [
      { name: 'Basic Plan', minAmount: 100.00, maxAmount: 999.00, roiPercent: 10.0, durationDays: 30 },
      { name: 'Premium Plan', minAmount: 1000.00, maxAmount: 1000000.00, roiPercent: 15.0, durationDays: 30 },
    ];
    for (const planData of plansData) {
      const plan = await prisma.investmentPlan.findFirst({ where: { name: planData.name } });
      if (!plan) {
        await prisma.investmentPlan.create({ data: planData });
      }
    }
    console.log('✅ Investment plans ensured.');
    
    // Create a user investment
    const basicPlan = await prisma.investmentPlan.findFirst({ where: { name: 'Basic Plan' } });
    const existingInvestment = await prisma.userInvestment.findFirst({ where: { userId: user.id, planId: basicPlan.id } });
    if (!existingInvestment) {
      await prisma.userInvestment.create({
        data: {
          userId: user.id,
          planId: basicPlan.id,
          amount: 150.00,
          status: 'active',
        },
      });
      console.log('✅ User investment created.');
    } else {
      console.log('✅ User investment already exists.');
    }

    // Add transactions
    const transactionsData = [
      { type: 'deposit', crypto: 'BTC', amount: 51.00, status: 'completed' },
      { type: 'withdrawal', crypto: 'ETH', amount: 30.00, status: 'completed' },
      { type: 'deposit', crypto: 'USDT', amount: 50.00, status: 'completed' },
    ];
    for (const tx of transactionsData) {
      const existingTx = await prisma.transaction.findFirst({
        where: { userId: user.id, walletId: wallet.id, type: tx.type, crypto: tx.crypto, amount: tx.amount },
      });
      if (!existingTx) {
        await prisma.transaction.create({
          data: {
            user: { connect: { id: user.id } },
            wallet: { connect: { id: wallet.id } },
            ...tx,
          },
        });
      }
    }
    console.log('✅ Transactions ensured.');

    console.log('🎉 Setup process completed successfully.');
    res.json({ message: 'Setup completed successfully. You can now use the app.' });
  } catch (error) {
    console.error('❌ Setup failed:', error);
    res.status(500).json({ error: 'Setup failed. Check the server logs for details.' });
  }
});

module.exports = router;
