const { fetchMarketData } = require('../services/marketService');

const getMarketData = async (req, res) => {
  try {
    const data = await fetchMarketData();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMarketData };
