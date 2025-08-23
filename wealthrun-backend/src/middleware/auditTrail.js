const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auditTransaction = async (userId, action, details) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      details: JSON.stringify(details)
    }
  });
};

module.exports = { auditTransaction };
