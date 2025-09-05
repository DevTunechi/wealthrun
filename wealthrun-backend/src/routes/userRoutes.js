const express = require("express");
const router = express.Router();
const prisma = require("../prisma"); // Assuming your Prisma client is exported from this path

/**
 * @route   POST /api/users/create
 * @desc    Creates a new user in the database
 * @access  Public (should be called after Firebase signup)
 */
router.post("/create", async (req, res) => {
  const { userId, email, name } = req.body;

  // Basic validation
  if (!userId || !email) {
    return res.status(400).json({ error: "userId and email are required" });
  }

  try {
    // Check if the user already exists to prevent duplicates
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      console.log(`ℹ️ User ${userId} already exists in the database.`);
      return res.status(200).json(existingUser);
    }

    // Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email,
        name,
      },
    });

    console.log(`✅ User ${userId} created successfully.`);
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("❌ Failed to create user:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Example user placeholder routes
router.get("/", (req, res) => {
  res.send("List of users placeholder");
});

router.get("/:id", (req, res) => {
  res.send(`User details placeholder for ID: ${req.params.id}`);
});

module.exports = router;