const { sendEmail } = require('../utils/mailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Deposit notification
const notifyDeposit = async (userId, amount, crypto) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const subject = `Deposit Received: ${crypto}`;
  const text = `Hello ${user.name},\n\nWe received your deposit of ${amount} ${crypto}. Your wallet has been updated.`;
  
  await sendEmail({ to: user.email, subject, text });
};

// Withdrawal notification
const notifyWithdrawal = async (userId, amount, crypto, status) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const subject = `Withdrawal ${status}: ${crypto}`;
  const text = `Hello ${user.name},\n\nYour withdrawal of ${amount} ${crypto} has been ${status}.`;
  
  await sendEmail({ to: user.email, subject, text });
};

// ROI credit notification
const notifyROICredit = async (userId, amount, crypto) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const subject = `Monthly ROI Credited: ${crypto}`;
  const text = `Hello ${user.name},\n\nYour monthly ROI of ${amount} ${crypto} has been credited to your wallet.`;
  
  await sendEmail({ to: user.email, subject, text });
};

module.exports = { notifyDeposit, notifyWithdrawal, notifyROICredit };
