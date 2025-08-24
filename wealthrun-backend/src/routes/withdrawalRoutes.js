const express = require("express");
const router = express.Router();

// Example withdrawal placeholder routes
router.get("/", (req, res) => {
  res.send("List of withdrawals placeholder");
});

router.post("/", (req, res) => {
  res.send("Request withdrawal placeholder");
});

module.exports = router;
