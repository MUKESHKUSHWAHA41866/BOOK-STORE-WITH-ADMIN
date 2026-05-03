

const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

/**
 * Secure key generator:
 * - Logged-in users → use user ID
 * - Guests → use IPv6-safe IP generator
 */
const keyGenerator = (req) => {
  return req.user?.id || ipKeyGenerator(req.ip);
};

/**
 * General API Rate Limiter
 * Protects all standard API routes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per user/IP per window
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  keyGenerator,

  message: {
    success: false,
    message: "Too many requests, please try again later."
  },

  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests, please try again later."
    });
  },

  skip: (req) => {
    // Optional health check bypass
    return req.path === "/health";
  }
});

/**
 * Authentication Rate Limiter
 * Strict protection for login/signup/password reset
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 auth attempts per IP/user
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,

  message: {
    success: false,
    message: "Too many authentication attempts, please try again later."
  },

  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many authentication attempts, please try again later."
    });
  }
});

/**
 * Optional Admin Limiter
 * Extra strict for admin routes
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,

  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many admin requests, please slow down."
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  adminLimiter
};