const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        booking_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true, // One review per booking
        },

        equipment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Equipment",
            required: true,
        },

        farmer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        rentaler_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        review: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        isVisible: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

reviewSchema.index({ equipment_id: 1 });

module.exports = mongoose.model("Review", reviewSchema);