const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// (Keep your authentication-related functions here, e.g., login, register, etc.)

// ------------------------
// Manage Investment Plans (CRUD)
// ------------------------
const createPlan = async (req, res) => {
  try {
    const plan = await prisma.investmentPlan.create({ data: req.body });
    res.json({ message: "Plan created", plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePlan = async (req, res) => {
  const { planId } = req.params;
  try {
    const plan = await prisma.investmentPlan.update({
      where: { id: parseInt(planId) },
      data: req.body,
    });
    res.json({ message: "Plan updated", plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePlan = async (req, res) => {
  const { planId } = req.params;
  try {
    await prisma.investmentPlan.delete({ where: { id: parseInt(planId) } });
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPlan,
  updatePlan,
  deletePlan,
};
