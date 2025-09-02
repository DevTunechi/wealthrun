const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create or find dummy user
  let user = await prisma.user.findFirst({
    where: { email: "wealthruninfo@gmail.com" },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash("wealthrun$88", 10);
    user = await prisma.user.create({
      data: {
        name: "Williams Vicky",
        email: "wealthruninfo@gmail.com",
        password: hashedPassword,
        role: "user",
      },
    });
    console.log("✅ User created:", user.id);
  } else {
    console.log("✅ User already exists:", user.id);
  }

  // 2. Create or find wallet
  let wallet = await prisma.wallet.findFirst({
    where: { userId: user.id },
  });

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
    console.log("✅ Wallet created:", wallet.id);
  } else {
    console.log("✅ Wallet already exists:", wallet.id);
  }

  // 3. Ensure investment plans exist
  const plansData = [
    {
      name: "Basic Plan",
      description: "Perfect for new investors",
      minAmount: 100.00,
      maxAmount: 999.00,
      roiPercent: 10.0,
      durationDays: 30,
    },
    {
      name: "Premium Plan",
      description: "Higher returns for committed investors",
      minAmount: 1000.00,
      maxAmount: 1000000.00,
      roiPercent: 15.0,
      durationDays: 30,
    },
  ];

  for (const planData of plansData) {
    const plan = await prisma.investmentPlan.findFirst({
      where: { name: planData.name },
    });

    if (!plan) {
      await prisma.investmentPlan.create({ data: planData });
      console.log(`✅ Investment plan created: ${planData.name}`);
    } else {
      console.log(`✅ Investment plan already exists: ${planData.name}`);
    }
  }

  // 4. Create a dummy user investment (Basic Plan)
  const basicPlan = await prisma.investmentPlan.findFirst({
    where: { name: "Basic Plan" },
  });

  if (basicPlan) {
    const existingInvestment = await prisma.userInvestment.findFirst({
      where: { userId: user.id, planId: basicPlan.id },
    });

    if (!existingInvestment) {
      await prisma.userInvestment.create({
        data: {
          userId: user.id,
          planId: basicPlan.id,
          amount: 150.00,
          status: "active",
        },
      });
      console.log("✅ User investment created.");
    } else {
      console.log("✅ User investment already exists.");
    }
  }

// 5. Add dummy transactions
const transactionsData = [
  { type: "deposit", crypto: "BTC", amount: 51.0, status: "completed" },
  { type: "withdrawal", crypto: "ETH", amount: 30.0, status: "completed" },
  { type: "deposit", crypto: "USDT", amount: 50.0, status: "completed" },
];

for (const tx of transactionsData) {
  await prisma.transaction.create({
    data: {
      user: { connect: { id: user.id } },
      wallet: { connect: { id: wallet.id } },
      type: tx.type,
      crypto: tx.crypto,
      amount: tx.amount,
      status: tx.status,
      createdAt: new Date(),
    },
  });

    if (!existingTx) {
      // ✅ FIX: Use `connect` syntax to link the new transaction
      // to the existing user and wallet records.
      await prisma.transaction.create({
        data: {
          user: { connect: { id: user.id } },
          wallet: { connect: { id: wallet.id } },
          type: tx.type,
          crypto: tx.crypto,
          amount: tx.amount,
          status: tx.status,
        },
      });
      console.log(`✅ Transaction created: ${tx.type} ${tx.crypto}`);
    } else {
      console.log(`✅ Transaction already exists: ${tx.type} ${tx.crypto}`);
    }
  }
}

// Run seeding
main()
  .then(async () => {
    console.log("🌱 Seeding completed successfully.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
