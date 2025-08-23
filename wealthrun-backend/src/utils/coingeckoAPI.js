const axios = require("axios");

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

/**
 * Get current price of cryptocurrencies
 * @param {Array<string>} coins - e.g. ["bitcoin", "ethereum", "tether"]
 * @param {string} currency - e.g. "usd"
 */
async function getPrices(coins = ["bitcoin"], currency = "usd") {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/simple/price`, {
      params: {
        ids: coins.join(","),  // join array to "bitcoin,ethereum"
        vs_currencies: currency
      },
      timeout: 5000 // prevent hanging forever
    });
    return response.data;
  } catch (err) {
    console.error("❌ Error fetching prices from CoinGecko:", err.message);
    return null; // return null instead of crashing
  }
}

/**
 * Example: Get market chart data
 * @param {string} coinId - e.g. "bitcoin"
 * @param {string} currency - e.g. "usd"
 * @param {number} days - e.g. 7 (last 7 days)
 */
async function getMarketChart(coinId = "bitcoin", currency = "usd", days = 7) {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/coins/${coinId}/market_chart`, {
      params: { vs_currency: currency, days },
      timeout: 5000
    });
    return response.data;
  } catch (err) {
    console.error(`❌ Error fetching market chart for ${coinId}:`, err.message);
    return null;
  }
}

module.exports = {
  getPrices,
  getMarketChart
};
