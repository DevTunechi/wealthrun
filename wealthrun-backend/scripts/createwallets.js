const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking users without wallets...");

  // Get all users
  const users = await prisma.user.findMany();

  for (const user of users) {
    const wallet = await prisma.wallet.findFirst({
      where: { userId: user.id },
    });

    if (!wallet) {
      await prisma.wallet.create({
        data: {
          userId: user.id,
          btcBalance: 0,
          ethBalance: 0,
          usdtBalance: 0,
          piBalance: 0,
        },
      });
      console.log(`🆕 Wallet created for user ${user.id} (${user.email})`);
    } else {
      console.log(`✅ Wallet already exists for user ${user.id}`);
    }
  }

  console.log("🎉 Wallet sync complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error running wallet sync:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
