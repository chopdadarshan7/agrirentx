const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        booking_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },

        razorpay_order_id: {
            type: String,
            required: true,
            unique: true,
        },

        razorpay_payment_id: {
            type: String,
            default: "",
        },

        razorpay_signature: {
            type: String,
            default: "",
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
        },

        payment_method: {
            type: String,
            default: "",
        },

        payment_status: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded"
            ],
            default: "pending",
        },

        refund_id: {
            type: String,
            default: "",
        },

        refund_status: {
            type: String,
            enum: [
                "none",
                "pending",
                "processed",
                "failed"
            ],
            default: "none",
        },

        commission_amount: {
            type: Number,
            default: 0,
            min: 0,
        },

        payout_amount: {
            type: Number,
            default: 0,
            min: 0,
        },

        payout_status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "completed"
            ],
            default: "pending",
        },

        paid_at: {
            type: Date,
        },

        refunded_at: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);
paymentSchema.index({ booking_id: 1 }); // index via schema.index() — inline index:true removed
paymentSchema.index({ payment_status: 1 });
module.exports = mongoose.model("Payment", paymentSchema);