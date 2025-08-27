// backend/src/server.js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");

const rateLimitMiddleware = require("./middleware/rateLimitMiddleware");
require("./utils/cronJobs");

dotenv.config();

const app = express();

// ------------------------
// Security headers & CORS
// ------------------------
app.use(helmet());

// ✅ Allow requests from frontend domains
app.use(cors({
  origin: [
    "https://wealthrun.vercel.app",  // production frontend
    "http://localhost:5173",         // Vite local dev
    "http://localhost:3000"          // CRA local dev
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ------------------------
// Middleware
// ------------------------
app.use(express.json());
app.use(rateLimitMiddleware);

// ------------------------
// Test route
// ------------------------
app.get("/", (req, res) => {
  res.send("WealthRun Backend API is running...");
});

// ------------------------
// Routes
// ------------------------
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const userRoutes = require("./routes/userRoutes");
const emailPreviewRoutes = require("./routes/emailPreview");

// ✅ Mount under /api namespace
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/preview", emailPreviewRoutes);

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
