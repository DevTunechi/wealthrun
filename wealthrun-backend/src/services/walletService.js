const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const creditWallet = async (userId, crypto, amount) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error("Wallet not found");

  // Update balance
  const field = crypto.toLowerCase() + "Balance"; // e.g., btcBalance
  wallet[field] += amount;

  await prisma.wallet.update({
    where: { userId },
    data: { [field]: wallet[field] },
  });

  // Record transaction
  await prisma.transaction.create({
    data: { walletId: wallet.id, type: "credit", crypto, amount, status: "confirmed" }
  });

  return wallet;
};

const debitWallet = async (userId, crypto, amount) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  const field = crypto.toLowerCase() + "Balance";

  if (wallet[field] < amount) throw new Error("Insufficient balance");

  wallet[field] -= amount;

  await prisma.wallet.update({
    where: { userId },
    data: { [field]: wallet[field] },
  });

  await prisma.transaction.create({
    data: { walletId: wallet.id, type: "debit", crypto, amount, status: "pending" }
  });

  return wallet;
};

module.exports = { creditWallet, debitWallet };
