// testPrisma.js
require("dotenv").config(); // ensure .env is loaded
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Fetching users from DB...");
  const users = await prisma.user.findMany();
  console.log("✅ Users:", users);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
