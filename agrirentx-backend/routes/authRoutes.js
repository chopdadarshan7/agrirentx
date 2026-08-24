const express = require("express");

const router = express.Router();

const {
  register,
  login,
  refresh,
  logout,
  getMe,
  upgradeToRentaler,
  updateMe,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");
const {
  authLimiter,
} = require("../middleware/rateLimitMiddleware");

// ==========================================
// Public Routes
// ==========================================

// Register User
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register New User
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User Registered
 */
router.post("/register", authLimiter, register);

// Login User
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login User
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login Successful
 */
router.post("/login", authLimiter, login);

// Refresh Access Token
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh JWT Token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token Refreshed
 */
router.post("/refresh-token", authLimiter, refresh);
router.post("/refresh", authLimiter, refresh);

// ==========================================
// Protected Routes
// ==========================================

// Logout
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout User
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout Successful
 */
router.post("/logout", protect, logout);

// Get Logged-in User
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Current Logged In User
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current User Details
 */
router.get("/me", protect, getMe);

// Update Current User Profile
/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Update Current User Profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile Updated Successfully
 */
router.put("/me", protect, updateMe);

// Upgrade Farmer → Rentaler
/**
 * @swagger
 * /api/auth/upgrade-rentaler:
 *   put:
 *     summary: Upgrade Farmer To Rentaler
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rentaler Upgrade Request Submitted
 */
router.put("/upgrade-rentaler", protect, upgradeToRentaler);

module.exports = router;