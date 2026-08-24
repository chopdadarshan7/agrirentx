const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { uploadLimiter } = require("../middleware/rateLimitMiddleware");
const User = require("../models/user");

// ==========================================
// Placeholder controller (to be built in Phase 3/4)
// ==========================================
const uploadKycDocument = (req, res) => {
    res.status(200).json({ message: "KYC upload placeholder" });
};

const uploadProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded.",
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        user.avatar = `/${req.file.path.replace(/\\/g, "/")}`;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully.",
            data: { avatar: user.avatar },
        });
    } catch (error) {
        next(error);
    }
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