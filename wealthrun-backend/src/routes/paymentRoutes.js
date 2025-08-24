const express = require("express");
const router = express.Router();

// Example payment placeholder routes
router.get("/", (req, res) => {
  res.send("List of payments placeholder");
});

router.post("/", (req, res) => {
  res.send("Create payment placeholder");
});

module.exports = router;
