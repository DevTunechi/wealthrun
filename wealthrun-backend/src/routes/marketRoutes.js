const express = require('express');
const { getMarketData } = require('../controllers/marketController');
const router = express.Router();

// Public endpoint for frontend carousel
router.get('/prices', getMarketData);

module.exports = router;
