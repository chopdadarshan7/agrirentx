const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { uploadLimiter } = require("../middleware/rateLimitMiddleware");

// ==========================================
// Placeholder controllers (to be built in Phase 3/4)
// ==========================================
const uploadKycDocument = (req, res) => {
    res.status(200).json({ message: "KYC upload placeholder" });
};

const uploadProfileImage = (req, res) => {
    res.status(200).json({ message: "Profile image upload placeholder" });
};

// ==========================================
// Routes
// ==========================================

router.post(
    "/kyc",
    protect,
    uploadLimiter,
    (req, res, next) => {
        req.uploadFolder = "kyc";
        next();
    },
    upload.single("document"),
    uploadKycDocument
);


router.put(
    "/profile-image",
    protect,
    (req, res, next) => {
        req.uploadFolder = "profile";
        next();
    },
    upload.single("profileImage"),
    uploadProfileImage
);

module.exports = router;