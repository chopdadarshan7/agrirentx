const rateLimit = require("express-rate-limit");

// ==========================================
// General API Rate Limiter
// ==========================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: process.env.NODE_ENV === "production" ? 100 : 100000,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// ==========================================
// Authentication Rate Limiter
// ==========================================
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour

  max: process.env.NODE_ENV === "production" ? 50 : 100000, // 50 attempts per hour per IP

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 1 hour.",
  },
});

// ==========================================
// Upload Rate Limiter
// ==========================================
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Upload limit exceeded. Please try again later.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
};