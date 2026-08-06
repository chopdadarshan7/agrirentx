const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
    {
        equipment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Equipment",
            required: true,
            index: true,
        },

        owner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        start_date: {
            type: Date,
            required: true,
        },

        end_date: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "available",
                "booked",
                "blocked",
                "maintenance",
            ],
            default: "available",
        },

        reason: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

availabilitySchema.index({
    equipment_id: 1,
    start_date: 1,
    end_date: 1,
});

module.exports = mongoose.model("Availability", availabilitySchema);