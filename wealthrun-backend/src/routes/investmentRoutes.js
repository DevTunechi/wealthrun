const express = require('express');
const router = express.Router();
const { invest, getHistory } = require('../controllers/investmentController');
const { auth } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/inputSanitize');

// Protected route to create an investment with validation
router.post(
  '/invest',
  auth,
  validateRequest([
    body('amount').isFloat({ min: 1 }),
    body('planId').isInt()
  ]),
  invest
);

// Protected route to get investment history
router.get('/history', auth, getHistory);

module.exports = router;
