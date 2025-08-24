const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendWelcomeEmail } = require('../services/mailer');

// ------------------------
// List all users
// ------------------------
const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------
// Get single user by ID
// ------------------------
const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { wallets: true, transactions: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------
// Delete user
// ------------------------
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(userId) } });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------
// (Optional) Send Welcome Email manually
// ------------------------
const sendWelcome = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await sendWelcomeEmail(user.email, {
      username: user.name,
      verifyUrl: `https://wealthrun.com/verify?token=SAMPLETOKEN`,
    });

    res.json({ message: "Welcome email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listUsers, getUserById, deleteUser, sendWelcome };
