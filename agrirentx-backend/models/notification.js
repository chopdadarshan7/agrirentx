const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        receiver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: [
                "booking",
                "payment",
                "kyc",
                "equipment",
                "review",
                "system"
            ],
            default: "system",
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        actionUrl: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Notification", notificationSchema);