const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
app.set("socketio", io);
const cors = require("cors");
require("dotenv").config();
const logger = require("./utils/logger");

// ─── Validate critical environment variables on startup ────────────────────────
const requiredEnvVars = [
  "PORT",
  "URI_MON",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "FRONTEND_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  // STRIPE_WEBHOOK_SECRET is required in production — enforced in stripe.webhook.js
  // but we warn here so it's visible at startup
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Prevent process from crashing on unhandled async errors
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  // Optional: process.exit(1) if you want it to restart via PM2/Docker
});

require("./connection/connection");

// ─── Route Imports ────────────────────────────────────────────────────────────
const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");
const favouriteRoutes = require("./routes/favourite");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const reviewRoutes = require("./routes/review");       // Phase 2
const analyticsRoutes = require("./routes/analytics"); // Phase 2
const couponRoutes = require("./routes/coupon");       // Phase 4
const stripeRoutes = require("./routes/stripe");       // Phase 4 (NEW)

const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: logger.stream }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (Increased for Dev)
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "id", "bookid"],
  })
);

// ─── Stripe Webhook (MUST be before express.json) ─────────────────────────────
app.post(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/stripe.webhook")
);

app.use(express.json());
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1", userRoutes);
app.use("/api/v1", bookRoutes);
app.use("/api/v1", favouriteRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1", analyticsRoutes);
app.use("/api/v1/coupon", couponRoutes);
app.use("/api/v1", stripeRoutes);
app.use("/api/v1", require("./routes/audit"));
app.use("/api/v1", require("./routes/upload"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "BookHeaven API is running", version: "2.0" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: Date.now() });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);
  if (!isProduction) console.error(err.stack);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({ message: `${field} already exists` });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(403).json({ message: "Invalid token" });
  }

  return res.status(err.statusCode || 500).json({
    message: isProduction ? "Something went wrong" : err.message,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
server.listen(process.env.PORT, () => {
  console.log(`✅ BookHeaven v2.0 started on port ${process.env.PORT}`);
});

// Export io for controllers
module.exports = { app, io };