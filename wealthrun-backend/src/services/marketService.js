const { getPrices } = require('../utils/coingeckoAPI.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fetchMarketData = async () => {
  const prices = await getPrices();

  // Optionally save daily snapshots
  for (const [crypto, data] of Object.entries(prices)) {
    await prisma.marketSnapshot.create({
      data: { crypto, price: data.usd }
    });
  }

  return prices;
};

module.exports = { fetchMarketData };
