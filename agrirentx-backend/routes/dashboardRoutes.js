const express = require("express");
const router = express.Router();
const { getRentalerDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/dashboard/rentaler
router.get("/rentaler", protect, getRentalerDashboard);

module.exports = router;