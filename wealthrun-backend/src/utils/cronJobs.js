// backend/src/jobs/cronJobs.js
const cron = require("node-cron");
const { creditROI } = require("../services/investmentService.js");
const { fetchMarketData } = require("../services/marketService.js");

// ✅ Monthly ROI Credit Job
// Runs at 00:00 on the 1st day of every month
cron.schedule("0 0 1 * *", async () => {
  console.log("⏳ [CRON] Starting monthly ROI credit job...");

  try {
    await creditROI();
    console.log("✅ [CRON] ROI credited successfully.");
  } catch (err) {
    console.error("❌ [CRON] Error running ROI cron job:", err.message);
  }
});

// ✅ Daily Market Data Snapshot
// Runs every day at 00:00
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ [CRON] Fetching daily crypto market snapshot...");

  try {
    await fetchMarketData();
    console.log("✅ [CRON] Market snapshot saved.");
  } catch (err) {
    console.error("❌ [CRON] Error fetching market snapshot:", err.message);
  }
});

module.exports = cron;
