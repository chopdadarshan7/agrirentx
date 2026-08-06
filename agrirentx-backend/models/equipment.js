const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
    {
        rentaler_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        specifications: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
        },

        price_per_day: {
            type: Number,
            required: true,
            min: 0,
        },

        security_deposit: {
            type: Number,
            default: 0,
            min: 0,
        },

        location: {
    address: {
        type: String,
        required: true,
    },

    village: {
        type: String,
        default: "",
    },

    taluka: {
        type: String,
        default: "",
    },

    district: {
        type: String,
        default: "",
    },

    state: {
        type: String,
        default: "",
    },

    pincode: {
        type: String,
        default: "",
    },

    latitude: {
        type: Number,
        required: true,
    },

    longitude: {
        type: Number,
        required: true,
    },

    geo: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },

        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
        },
    },
},

        images: {
            type: [String],
            default: [],
        },

        ownership_document_url: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["available", "rented", "maintenance", "inactive"],
            default: "available",
        },

        approval_status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        average_rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        total_reviews: {
            type: Number,
            default: 0,
        },

        is_deleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// ==========================================
// 2dsphere Geospatial Index
// ==========================================
// This enables MongoDB $near / $geoWithin / $geoNear queries.
// MUST be declared on the GeoJSON object ("location.geo"),
// NOT on the coordinates array inside it.
equipmentSchema.index({
    title: "text",
    description: "text",
});

equipmentSchema.index({ "location.geo": "2dsphere" });

// ==========================================
// Pre-save Hook — Auto-sync geo from lat/lng
// ==========================================
// When a document is saved, this hook automatically
// builds the GeoJSON coordinates from latitude & longitude.
// This means callers only need to set lat/lng;
// the geo field stays in sync automatically.
equipmentSchema.pre("save", function () {
    if (
        this.location &&
        this.location.latitude != null &&
        this.location.longitude != null
    ) {
        this.location.geo = {
            type: "Point",
            coordinates: [
                this.location.longitude, // GeoJSON: longitude FIRST
                this.location.latitude,
            ],
        };
    }
});

module.exports = mongoose.model("Equipment", equipmentSchema);