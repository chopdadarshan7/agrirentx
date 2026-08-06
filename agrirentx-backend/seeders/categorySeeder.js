require("dotenv").config();

const mongoose = require("mongoose");
const Category = require("../models/category");
const connectDB = require("../config/db");

// ==========================================
// Seed Data — 10 Agricultural Categories
// ==========================================
const categories = [
    {
        name: "Tractor",
        slug: "tractor",
        description: "Heavy-duty farm tractors for ploughing, tilling, and general field work.",
        spec_template: [
            { label: "Horse Power (HP)", key: "horse_power", type: "number", required: true },
            { label: "Drive Type", key: "drive_type", type: "select", options: ["2WD", "4WD"], required: true },
            { label: "Fuel Type", key: "fuel_type", type: "select", options: ["Diesel", "Petrol", "CNG"], required: true },
            { label: "Brand", key: "brand", type: "text", required: false },
            { label: "Year of Manufacture", key: "year", type: "number", required: false },
        ],
    },
    {
        name: "Harvester",
        slug: "harvester",
        description: "Combine harvesters for efficient wheat, paddy, and soybean harvesting.",
        spec_template: [
            { label: "Cutting Width (ft)", key: "cutting_width", type: "number", required: true },
            { label: "Crop Type", key: "crop_type", type: "select", options: ["Wheat", "Paddy", "Soybean", "Maize", "Other"], required: true },
            { label: "Engine Power (HP)", key: "engine_power", type: "number", required: false },
            { label: "Brand", key: "brand", type: "text", required: false },
        ],
    },
    {
        name: "Rotavator",
        slug: "rotavator",
        description: "Rotary tillers for seedbed preparation and soil mixing.",
        spec_template: [
            { label: "Working Width (ft)", key: "working_width", type: "number", required: true },
            { label: "Number of Blades", key: "blade_count", type: "number", required: false },
            { label: "Compatible HP", key: "compatible_hp", type: "number", required: false },
        ],
    },
    {
        name: "Thresher",
        slug: "thresher",
        description: "Threshing machines for separating grain from stalks and husks.",
        spec_template: [
            { label: "Type", key: "type", type: "select", options: ["Wheat Thresher", "Paddy Thresher", "Multi-crop Thresher"], required: true },
            { label: "Capacity (quintal/hr)", key: "capacity", type: "number", required: false },
            { label: "Power Source", key: "power_source", type: "select", options: ["Tractor PTO", "Electric Motor", "Diesel Engine"], required: true },
        ],
    },
    {
        name: "Sprayer",
        slug: "sprayer",
        description: "Agricultural sprayers for pesticides, herbicides, and fertilizer application.",
        spec_template: [
            { label: "Type", key: "type", type: "select", options: ["Knapsack", "Boom Sprayer", "Air Blast", "Self-Propelled"], required: true },
            { label: "Tank Capacity (L)", key: "tank_capacity", type: "number", required: true },
            { label: "Boom Width (ft)", key: "boom_width", type: "number", required: false },
            { label: "Power Source", key: "power_source", type: "select", options: ["Manual", "Battery", "Tractor PTO", "Engine"], required: false },
        ],
    },
    {
        name: "Cultivator",
        slug: "cultivator",
        description: "Tillage equipment for soil preparation and weed control between crop rows.",
        spec_template: [
            { label: "Number of Tines", key: "tines", type: "number", required: true },
            { label: "Working Width (ft)", key: "working_width", type: "number", required: false },
            { label: "Compatible HP", key: "compatible_hp", type: "number", required: false },
        ],
    },
    {
        name: "Seed Drill",
        slug: "seed-drill",
        description: "Precision seed sowing machines for uniform seed placement and spacing.",
        spec_template: [
            { label: "Number of Rows", key: "rows", type: "number", required: true },
            { label: "Row Spacing (cm)", key: "row_spacing", type: "number", required: false },
            { label: "Crop Type", key: "crop_type", type: "select", options: ["Wheat", "Paddy", "Cotton", "Sunflower", "Multi-crop"], required: false },
            { label: "Compatible HP", key: "compatible_hp", type: "number", required: false },
        ],
    },
    {
        name: "Pump Set",
        slug: "pump-set",
        description: "Water pump sets for irrigation — diesel and electric powered.",
        spec_template: [
            { label: "Power Type", key: "power_type", type: "select", options: ["Diesel", "Electric"], required: true },
            { label: "Discharge (LPM)", key: "discharge", type: "number", required: false },
            { label: "Suction Head (ft)", key: "suction_head", type: "number", required: false },
            { label: "Pipe Diameter (inch)", key: "pipe_diameter", type: "number", required: false },
        ],
    },
    {
        name: "Mini Tractor",
        slug: "mini-tractor",
        description: "Compact tractors suitable for small farms, orchards, and vegetable gardens.",
        spec_template: [
            { label: "Horse Power (HP)", key: "horse_power", type: "number", required: true },
            { label: "Drive Type", key: "drive_type", type: "select", options: ["2WD", "4WD"], required: false },
            { label: "Brand", key: "brand", type: "text", required: false },
        ],
    },
    {
        name: "Power Tiller",
        slug: "power-tiller",
        description: "Walk-behind tillers for paddy fields, kitchen gardens, and hilly terrain.",
        spec_template: [
            { label: "Engine Power (HP)", key: "engine_power", type: "number", required: true },
            { label: "Tilling Width (cm)", key: "tilling_width", type: "number", required: false },
            { label: "Fuel Type", key: "fuel_type", type: "select", options: ["Diesel", "Petrol"], required: false },
            { label: "Brand", key: "brand", type: "text", required: false },
        ],
    },
];

// ==========================================
// Run Seeder
// ==========================================
const seedCategories = async () => {
    try {
        await connectDB();

        // Clear existing categories
        const existing = await Category.countDocuments();
        if (existing > 0) {
            await Category.deleteMany({});
            console.log(`🗑️  Cleared ${existing} existing categories.`);
        }

        // Insert new categories
        const inserted = await Category.insertMany(categories);

        console.log(`✅ Successfully seeded ${inserted.length} categories:\n`);
        inserted.forEach((cat, i) => {
            console.log(`  ${i + 1}. ${cat.name} (slug: ${cat.slug})`);
        });

        console.log("\n🎉 Category seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeder failed:", error.message);
        process.exit(1);
    }
};

seedCategories();
