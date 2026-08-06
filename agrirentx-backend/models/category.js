const mongoose = require("mongoose");

const specFieldSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true,
        },

        key: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        type: {
            type: String,
            enum: [
                "text",
                "number",
                "select",
                "boolean",
                "date"
            ],
            required: true,
        },

        options: {
            type: [String],
            default: [],
        },

        required: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        image: {
            type: String,
            default: "",
        },

        spec_template: {
            type: [specFieldSchema],
            default: [],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Category", categorySchema);