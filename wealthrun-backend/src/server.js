// backend/src/server.js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

const rateLimitMiddleware = require("./middleware/rateLimitMiddleware");
require("./utils/cronJobs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------
// Security + Middleware
// ------------------------
app.use(helmet());
app.use(morgan("dev")); // Logging for debugging

// ✅ CORS configuration (frontend dev + prod)
app.use(cors({
  origin: [
    "https://wealthrun.vercel.app",  // production frontend
    "http://localhost:5173",         // Vite local dev
    "http://localhost:3000"          // CRA local dev
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true
}));

// ✅ Handle preflight
app.options("*", cors());

// JSON parsing + rate limiter
app.use(express.json());
app.use(rateLimitMiddleware);

// ------------------------
// Routes
// ------------------------
app.get("/", (req, res) => {
  res.json({ status: "WealthRun backend is running ✅" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "CORS is working 🚀" });
});

// Import and mount routes
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); // Keep existing
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const emailPreviewRoutes = require("./routes/emailPreview");
const setupRoutes = require('./routes/setupRoutes');

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes); // Payments route (keep existing)
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/preview", emailPreviewRoutes);
app.use('/api/setup', setupRoutes);

// ------------------------
// Force HTTPS in production
// ------------------------
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// ------------------------
// Start server
// ------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
