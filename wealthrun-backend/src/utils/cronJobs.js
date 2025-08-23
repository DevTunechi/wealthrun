const cron = require('node-cron');
const { creditROI } = require('../services/investmentService.js');
const { fetchMarketData } = require('../services/marketService.js');

// Run monthly ROI credit job at 00:00 on the 1st of every month
cron.schedule('0 0 1 * *', async () => {
  try {
    console.log("Running monthly ROI credit job...");
    await creditROI();
    console.log("ROI credited successfully");
  } catch (err) {
    console.error("Error running ROI cron job:", err.message);
  }
});

// Run daily market snapshot at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    console.log("Fetching daily crypto snapshot...");
    await fetchMarketData();
    console.log("Snapshot saved.");
  } catch (err) {
    console.error("Error fetching market snapshot:", err.message);
  }
});
