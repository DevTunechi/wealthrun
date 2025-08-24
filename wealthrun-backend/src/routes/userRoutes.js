const express = require("express");
const router = express.Router();

// Example user placeholder routes
router.get("/", (req, res) => {
  res.send("List of users placeholder");
});

router.get("/:id", (req, res) => {
  res.send(`User details placeholder for ID: ${req.params.id}`);
});

module.exports = router;
