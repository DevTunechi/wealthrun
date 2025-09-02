const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const creditWallet = async (userId, crypto, amount) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error("Wallet not found");

  // ✅ FIX: Use Prisma's `increment` to perform an atomic update.
  // This prevents race conditions where simultaneous updates could overwrite each other.
  const field = crypto.toLowerCase() + "Balance"; // e.g., btcBalance

  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      [field]: {
        increment: amount
      }
    },
  });

  // ✅ FIX: Use the `connect` syntax to correctly link the transaction to the wallet.
  await prisma.transaction.create({
    data: {
      wallet: {
        connect: { id: wallet.id }
      },
      type: "credit",
      crypto,
      amount,
      status: "confirmed"
    }
  });

  return updatedWallet;
};

const debitWallet = async (userId, crypto, amount) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  const field = crypto.toLowerCase() + "Balance";

  if (!wallet || wallet[field] < amount) throw new Error("Insufficient balance or wallet not found");

  // ✅ FIX: Use Prisma's `decrement` for a safe, atomic subtraction.
  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      [field]: {
        decrement: amount
      }
    },
  });

  // ✅ FIX: Use the `connect` syntax to correctly link the transaction to the wallet.
  await prisma.transaction.create({
    data: {
      wallet: {
        connect: { id: wallet.id }
      },
      type: "debit",
      crypto,
      amount,
      status: "pending"
    }
  });

  return updatedWallet;
};

module.exports = { creditWallet, debitWallet };
