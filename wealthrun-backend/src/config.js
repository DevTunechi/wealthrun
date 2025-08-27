require("dotenv").config();

const ENV = process.env.NODE_ENV || "development";

const config = {
  env: ENV,
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  nowPaymentsApiKey: process.env.NOWPAYMENTS_API_KEY,
  backendUrl:
    ENV === "production"
      ? process.env.BACKEND_URL // Railway URL
      : `http://localhost:${process.env.PORT || 5000}`, // Local
};

module.exports = config;
