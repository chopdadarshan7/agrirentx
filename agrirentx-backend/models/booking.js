const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
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

        equipment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Equipment",
            required: true,
        },

        start_date: {
            type: Date,
            required: true,
        },

        end_date: {
            type: Date,
            required: true,
        },

        total_days: {
            type: Number,
            required: true,
            min: 1,
        },

        base_amount: {
            type: Number,
            required: true,
            min: 0,
        },

        deposit_amount: {
            type: Number,
            default: 0,
            min: 0,
        },

        platform_fee: {
            type: Number,
            default: 0,
            min: 0,
        },

        total_amount: {
            type: Number,
            required: true,
            min: 0,
        },

        booking_status: {
            type: String,
            enum: [
                "pending_payment",
                "confirmed",
                "active",
                "completed",
                "cancelled",
                "rejected"
            ],
            default: "pending_payment",
        },

        payment_status: {
            type: String,
            enum: [
                "pending",
                "paid",
                "refunded",
                "failed"
            ],
            default: "pending",
        },

        cancellation_reason: {
            type: String,
            default: "",
        },

        cancelled_at: {
            type: Date,
        },

        completed_at: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

bookingSchema.index({ farmer_id: 1 });
bookingSchema.index({ rentaler_id: 1 });
bookingSchema.index({ equipment_id: 1 });
bookingSchema.index({ booking_status: 1 });
bookingSchema.index({ payment_status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);