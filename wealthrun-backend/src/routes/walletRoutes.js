const express = require('express');
const { deposit, withdraw } = require('../controllers/walletController');
const { auth, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/deposit', auth, deposit);             // any logged-in user
router.post('/withdraw', auth, withdraw);           // any logged-in user

// Admin approval route could be added here later
router.post('/withdraw/approve', auth, authorize(['admin']), (req, res) => {
  // implement admin approval logic
});

module.exports = router;
