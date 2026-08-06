/**
 * AgriRentX — Dummy Equipment Seeder
 * Run: node seeders/dummyEquipmentSeeder.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const Category = require("../models/category");
const Equipment = require("../models/equipment");
const logger = require("../utils/logger");

async function seedDummyEquipment() {
  try {
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to MongoDB successfully!");

    // 1. Find a Rentaler User
    let rentaler = await User.findOne({ is_rentaler: true });
    if (!rentaler) {
      logger.info("No rentaler user found. Creating a seed rentaler...");
      rentaler = await User.create({
        fullName: "Seed Rentaler",
        email: "rentaler.seed@agrirentx.com",
        phone: "9100000001",
        password: "Rentaler@1234",
        is_rentaler: true,
        is_farmer: false,
        rentaler_status: "approved",
      });
      logger.info(`Created new rentaler user: ${rentaler.email}`);
    } else {
      logger.info(`Using existing rentaler user: ${rentaler.email}`);
    }

    // 2. Find a Category
    let category = await Category.findOne({});
    if (!category) {
      logger.info("No category found. Creating a default category...");
      category = await Category.create({
        name: "Tractors",
        slug: "tractors",
        description: "Heavy-duty farm tractors",
        specFields: [
          { name: "Horsepower", type: "number", required: true },
          { name: "Fuel Type", type: "string", required: true },
        ],
      });
      logger.info(`Created new category: ${category.name}`);
    } else {
      logger.info(`Using existing category: ${category.name}`);
    }

    // 3. Create the Dummy Equipment
    const dummyTitle = "Prestige Crop Harvester 9000";
    
    // Check if it already exists
    let existingEquipment = await Equipment.findOne({ title: dummyTitle, rentaler_id: rentaler._id });
    if (existingEquipment) {
      logger.info(`Equipment already exists: ${existingEquipment.title}`);
    } else {
      const newEquipment = await Equipment.create({
        rentaler_id: rentaler._id,
        category_id: category._id,
        title: dummyTitle,
        description: "High-performance crop harvester with automatic blade height adjustment and 150L fuel capacity. Perfect for fast harvesting during the peak season.",
        specifications: {
          "Horsepower": "90 HP",
          "Fuel Capacity": "150L",
          "Transmission": "Automatic",
        },
        price_per_day: 2500,
        security_deposit: 8000,
        location: {
          address: "Solapur Road, Near Bypass",
          village: "Solapur",
          taluka: "Solapur",
          district: "Solapur",
          state: "Maharashtra",
          pincode: "413001",
          latitude: 17.6599,
          longitude: 75.9064,
        },
        images: [
          "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop",
        ],
        status: "available",
        approval_status: "approved",
      });
      logger.info(`Successfully created dummy equipment: "${newEquipment.title}" (${newEquipment._id})`);
    }
  } catch (error) {
    logger.error("Error seeding dummy equipment:", error);
  } finally {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB.");
  }
}

seedDummyEquipment();
