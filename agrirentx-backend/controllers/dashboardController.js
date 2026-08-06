const Equipment = require("../models/equipment");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Review = require("../models/review");
const logger = require("../utils/logger");

exports.getRentalerDashboard = async (req, res) => {
    try {
        const rentalerId = req.user._id;

        // Total equipments listed by this rentaler
        const totalEquipments = await Equipment.countDocuments({
            rentaler_id: rentalerId,
            is_deleted: false,
        });

        // Active (confirmed) rentals
        const activeRentals = await Booking.countDocuments({
            rentaler_id: rentalerId,
            booking_status: "confirmed",
        });

        // Pending booking requests
        const pendingBookings = await Booking.countDocuments({
            rentaler_id: rentalerId,
            booking_status: "pending",
        });

        // Total reviews received
        const totalReviews = await Review.countDocuments({
            rentaler_id: rentalerId,
        });

        // Total revenue from paid payments
        const revenueResult = await Payment.aggregate([
            {
                $match: {
                    rentaler_id: rentalerId,
                    payment_status: "paid",
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

        const totalRevenue =
            revenueResult.length > 0
                ? revenueResult[0].totalRevenue
                : 0;

        // Monthly revenue breakdown (last 6 months)
        const monthlyRevenue = await Payment.aggregate([
            {
                $match: {
                    rentaler_id: rentalerId,
                    payment_status: "paid",
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    revenue: {
                        $sum: "$amount",
                    },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
            {
                $limit: 6,
            },
        ]);

        // Pending payout — owner_amount not available yet, will be calculated later
        const payout = 0;

        const recentBookings = await Booking.find({
            rentaler_id: rentalerId,
        })
        .populate("farmer_id", "full_name profile_image")
        .populate("equipment_id", "title images")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

        const equipmentStatus = await Equipment.aggregate([
            {
                $match: {
                    rentaler_id: rentalerId,
                    is_deleted: false,
                },
            },
            {
                $group: {
                    _id: "$status",
                    total: {
                        $sum: 1,
                    },
                },
            },
        ]);

        const recentReviews = await Review.find({
            rentaler_id: rentalerId,
        })
        .populate("user_id", "full_name profile_image")
        .populate("equipment_id", "title")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalEquipments,
                    activeRentals,
                    pendingBookings,
                    totalReviews,
                    totalRevenue,
                    pendingPayout: payout,
                },
                monthlyRevenue,
                equipmentStatus,
                recentBookings,
                recentReviews,
            },
        });
    } catch (error) {
        logger.error(error);

        return res.status(500).json({
            success: false,
            message: "Dashboard Error",
            error: error.message,
        });
    }
};