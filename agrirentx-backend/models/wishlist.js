const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
    {
        farmer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        equipment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Equipment",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Prevent duplicate wishlist entries.
 * One farmer can save one equipment only once.
 */
wishlistSchema.index(
    {
        farmer_id: 1,
        equipment_id: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);