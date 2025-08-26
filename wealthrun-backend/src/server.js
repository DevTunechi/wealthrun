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

app.use(cors({
  origin: ["https://wealthrun.vercel.app"],
  methods: ["GET,POST,PUT,DELETE"],
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

app.use("/auth", authRoutes);
app.use("/payments", paymentRoutes);
app.use("/withdrawals", withdrawalRoutes);
app.use("/users", userRoutes);
app.use("/preview", emailPreviewRoutes);

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
  console.log(`Server running on http://localhost:${PORT}`);
});
