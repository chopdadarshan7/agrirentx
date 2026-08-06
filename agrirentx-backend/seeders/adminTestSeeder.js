/**
 * AgriRentX — Admin Test Data Seeder
 * Run: node seeders/adminTestSeeder.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const Equipment = require("../models/equipment");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Review = require("../models/review");
const Category = require("../models/category");

const G = "\x1b[32m", C = "\x1b[36m", B = "\x1b[1m", R = "\x1b[0m";
const ok = (m) => console.log(`${G}✅${R} ${m}`);
const info = (m) => console.log(`ℹ️  ${m}`);

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`\n${B}${C}=== Admin Test Seeder ===${R}\nConnected to MongoDB\n`);

    // 1. Category — use existing
    const category = await Category.findOne({});
    if (!category) { console.error("No categories found."); process.exit(1); }
    info(`Using category: ${category.name} (${category._id})`);

    // 2. Rentaler
    let rentaler = await User.findOne({ email: "rentaler.seed@agrirentx.com" });
    if (!rentaler) {
        rentaler = await User.create({
            fullName: "Seed Rentaler",
            email: "rentaler.seed@agrirentx.com",
            phone: "9100000001",
            password: "Rentaler@1234",
            is_rentaler: true,
            is_farmer: false,
            rentaler_status: "approved",
        });
        ok(`Created rentaler: ${rentaler._id}`);
    } else { info(`Rentaler exists: ${rentaler._id}`); }

    // 3. Farmer
    let farmer = await User.findOne({ email: "farmer.seed@agrirentx.com" });
    if (!farmer) {
        farmer = await User.create({
            fullName: "Seed Farmer",
            email: "farmer.seed@agrirentx.com",
            phone: "9100000002",
            password: "Farmer@1234",
            is_farmer: true,
        });
        ok(`Created farmer: ${farmer._id}`);
    } else { info(`Farmer exists: ${farmer._id}`); }

    // 4. Equipment (pending) — for approve/reject tests
    let pendingEquipment = await Equipment.findOne({ rentaler_id: rentaler._id, approval_status: "pending", is_deleted: false });
    if (!pendingEquipment) {
        pendingEquipment = await Equipment.create({
            rentaler_id: rentaler._id,
            category_id: category._id,
            title: "John Deere Tractor 5050D",
            description: "A reliable farm tractor suitable for all types of soil.",
            price_per_day: 1500,
            security_deposit: 5000,
            location: {
                address: "Village Road, Sangli", village: "Sangli", taluka: "Sangli",
                district: "Sangli", state: "Maharashtra", pincode: "416416",
                latitude: 16.8524, longitude: 74.5815,
            },
            approval_status: "pending",
            status: "available",
        });
        ok(`Created pending equipment: ${pendingEquipment._id}`);
    } else { info(`Pending equipment exists: ${pendingEquipment._id}`); }

    // 5. Equipment (approved) — for booking tests
    let approvedEquipment = await Equipment.findOne({ rentaler_id: rentaler._id, approval_status: "approved", is_deleted: false });
    if (!approvedEquipment) {
        approvedEquipment = await Equipment.create({
            rentaler_id: rentaler._id,
            category_id: category._id,
            title: "Mahindra 275 DI Tractor",
            description: "Approved tractor available for rent.",
            price_per_day: 1200,
            security_deposit: 4000,
            location: {
                address: "Kolhapur Road", village: "Kolhapur", taluka: "Kolhapur",
                district: "Kolhapur", state: "Maharashtra", pincode: "416003",
                latitude: 16.705, longitude: 74.2433,
            },
            approval_status: "approved",
            status: "available",
        });
        ok(`Created approved equipment: ${approvedEquipment._id}`);
    } else { info(`Approved equipment exists: ${approvedEquipment._id}`); }

    // 6. Booking — base_amount + total_amount required
    let booking = await Booking.findOne({ farmer_id: farmer._id, equipment_id: approvedEquipment._id });
    if (!booking) {
        const start = new Date();
        const end = new Date(); end.setDate(end.getDate() + 3);
        booking = await Booking.create({
            farmer_id: farmer._id,
            rentaler_id: rentaler._id,
            equipment_id: approvedEquipment._id,
            start_date: start,
            end_date: end,
            total_days: 3,
            base_amount: 3600,      // required
            deposit_amount: 4000,
            platform_fee: 180,
            total_amount: 7780,     // required
            booking_status: "confirmed",
            payment_status: "paid",
        });
        ok(`Created booking: ${booking._id}`);
    } else { info(`Booking exists: ${booking._id} (${booking.booking_status})`); }

    // 7. Payment — only booking_id, razorpay_order_id, amount are required
    let payment = await Payment.findOne({ booking_id: booking._id });
    if (!payment) {
        const uniqueId = Date.now();
        payment = await Payment.create({
            booking_id: booking._id,
            rentaler_id: rentaler._id,
            amount: 7780,
            commission_amount: 360,
            payout_amount: 3240,
            payment_status: "paid",
            razorpay_order_id: `order_seed_${uniqueId}`,
            razorpay_payment_id: `pay_seed_${uniqueId}`,
            razorpay_signature: `sig_seed_${uniqueId}`,
            paid_at: new Date(),
        });
        ok(`Created payment: ${payment._id}`);
    } else { info(`Payment exists: ${payment._id} (${payment.payment_status})`); }

    // 8. Review
    let review = await Review.findOne({ farmer_id: farmer._id, equipment_id: approvedEquipment._id });
    if (!review) {
        review = await Review.create({
            farmer_id: farmer._id,
            equipment_id: approvedEquipment._id,
            booking_id: booking._id,
            rentaler_id: rentaler._id,
            rating: 4,
            comment: "Great tractor! Very reliable and fuel efficient.",
        });
        await Equipment.findByIdAndUpdate(approvedEquipment._id, { average_rating: 4, total_reviews: 1 });
        ok(`Created review: ${review._id}`);
    } else { info(`Review exists: ${review._id}`); }

    console.log(`\n${B}${G}=== Seed complete ===${R}`);
    console.log(`\nTest IDs:`);
    console.log(`  PENDING_EQ_ID  = ${pendingEquipment._id}`);
    console.log(`  APPROVED_EQ_ID = ${approvedEquipment._id}`);
    console.log(`  BOOKING_ID     = ${booking._id}`);
    console.log(`  PAYMENT_ID     = ${payment._id}`);
    console.log(`  REVIEW_ID      = ${review._id}\n`);

    await mongoose.disconnect();
}

seed().catch((err) => { console.error("Seeder failed:", err.message, err.errors); process.exit(1); });
