const express = require("express");
const router = express.Router();

// Example auth placeholder routes
router.post("/login", (req, res) => {
  res.send("Login route placeholder");
});

router.post("/register", (req, res) => {
  res.send("Register route placeholder");
});

module.exports = router;
