const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/farmerController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/farmer/dashboard
router.get("/dashboard", protect, getDashboardStats);

module.exports = router;
