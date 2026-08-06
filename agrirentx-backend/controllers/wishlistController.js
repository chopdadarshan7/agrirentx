const Wishlist = require("../models/wishlist");
const Equipment = require("../models/equipment");
const asyncHandler = require("../middleware/asyncHandler");
const { successResponse } = require("../utils/responseHandler");

// Add to Wishlist
const addToWishlist = asyncHandler(async (req, res) => {
    const farmer_id = req.user._id;
    const { equipmentId } = req.params;

    const equipment = await Equipment.findById(equipmentId);

    if (!equipment) {
        return res.status(404).json({
            success: false,
            message: "Equipment not found.",
        });
    }

    const exists = await Wishlist.findOne({
        farmer_id,
        equipment_id: equipmentId,
    });

    if (exists) {
        return res.status(409).json({
            success: false,
            message: "Equipment already exists in wishlist.",
        });
    }

    const wishlist = await Wishlist.create({
        farmer_id,
        equipment_id: equipmentId,
    });

    return successResponse(
        res,
        201,
        "Equipment added to wishlist successfully.",
        wishlist
    );
});

// Get My Wishlist
const getMyWishlist = asyncHandler(async (req, res) => {
    const farmer_id = req.user._id;

    const wishlist = await Wishlist.find({ farmer_id })
        .populate("equipment_id")
        .sort({ createdAt: -1 });

    return successResponse(
        res,
        200,
        "Wishlist fetched successfully.",
        wishlist
    );
});

// Remove from Wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
    const farmer_id = req.user._id;
    const { equipmentId } = req.params;

    const wishlist = await Wishlist.findOneAndDelete({
        farmer_id,
        equipment_id: equipmentId,
    });

    if (!wishlist) {
        return res.status(404).json({
            success: false,
            message: "Wishlist item not found.",
        });
    }

    return successResponse(
        res,
        200,
        "Equipment removed from wishlist successfully."
    );
});

// Check Wishlist Status
const checkWishlistStatus = asyncHandler(async (req, res) => {
    const farmer_id = req.user._id;
    const { equipmentId } = req.params;

    const exists = await Wishlist.exists({
        farmer_id,
        equipment_id: equipmentId,
    });

    return successResponse(
        res,
        200,
        "Wishlist status fetched successfully.",
        {
            isWishlisted: !!exists,
        }
    );
});

module.exports = {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist,
    checkWishlistStatus,
};