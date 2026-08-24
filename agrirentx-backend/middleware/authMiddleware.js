const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Equipment = require("../models/equipment");

// ===============================
// Protect Route
// ===============================
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// ===============================
// Admin Only
// ===============================
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
};

// ===============================
// Rentaler Only
// ===============================
const isRentaler = (req, res, next) => {
  if (!req.user.is_rentaler) {
    return res.status(403).json({
      success: false,
      message: "Rentaler access required.",
    });
  }

  next();
};

// ===============================
// Approved Rentaler Only
// ===============================
const isApprovedRentaler = (req, res, next) => {
  if (
    !req.user.is_rentaler ||
    req.user.rentaler_status !== "approved"
  ) {
    return res.status(403).json({
      success: false,
      message: "Rentaler is not approved.",
    });
  }

  next();
};

// ===============================
// Farmer Only
// ===============================
const isFarmer = (req, res, next) => {
  if (!req.user.is_farmer) {
    return res.status(403).json({
      success: false,
      message: "Farmer access required.",
    });
  }

  next();
};

// ===============================
// Prevent Blocked Users
// ===============================
const isNotBlocked = (req, res, next) => {
  if (req.user.isBlocked) {
    return res.status(403).json({
      success: false,
      message: "Your account has been blocked. Please contact support.",
    });
  }

  next();
};
// ===============================
// Equipment Owner Only
// ===============================
const isEquipmentOwner = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found.",
      });
    }

    if (equipment.rentaler_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this equipment.",
      });
    }

    req.equipment = equipment;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  protect,
  isAdmin,
  isRentaler,
  isApprovedRentaler,
  isFarmer,
  isNotBlocked,
  isEquipmentOwner,
};