const User = require("../models/user");
const Equipment = require("../models/equipment");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Review = require("../models/review");
const Notification = require("../models/notification");
const razorpay = require("../config/razorpay");
const logger = require("../utils/logger");
const sendNotification = require("../utils/sendNotification");

const {
    sendEquipmentApprovedEmail,
    sendEquipmentRejectedEmail,
    sendRentalerApprovedEmail,
    sendRentalerRejectedEmail,
} = require("../services/emailService");

const asyncHandler = require("../middleware/asyncHandler");
const { successResponse } = require("../utils/responseHandler");
const {
    getDashboardStatisticsService,
    getAllUsersService,
    getUserByIdService,
    updateUserStatusService,
    setUserBlockedService,
    deleteUserService,
    approveRentalerService,
    rejectRentalerService,
    suspendRentalerService,
    reactivateRentalerService,
    getPendingRentalersService,
    getApprovedRentalersService,
    getPendingEquipmentsService,
    getApprovedEquipmentsService,
    approveEquipmentService,
    rejectEquipmentService,
    getAllBookingsService,
    getBookingByIdService,
    updateBookingStatusService,
    cancelBookingService,
    getAllPaymentsService,
    getPaymentByIdService,
    updatePaymentStatusService,
    refundPaymentService,
    getAllReviewsService,
    getReviewByIdService,
    hideReviewService,
    restoreReviewService,
    deleteReviewService,
    getAllNotificationsService,
    getNotificationByIdService,
    markNotificationAsReadService,
    deleteNotificationService,
    broadcastNotificationService,
    getRevenueAnalyticsService,
    getBookingAnalyticsService,
    getUserAnalyticsService,
    getEquipmentAnalyticsService,
    getAdminAnalyticsDashboardService,
} = require("../services/adminService");

const {
    sendApprovalSMS,
} = require("../services/smsService");

// =========================================
// Admin Dashboard
// =========================================
const getDashboardStatistics = asyncHandler(async (req, res) => {
    const statistics = await getDashboardStatisticsService();

    return successResponse(
        res,
        200,
        "Dashboard statistics fetched successfully.",
        statistics
    );
});

exports.getDashboardStatistics = getDashboardStatistics;
exports.getDashboard = getDashboardStatistics;

// =========================================
// Get All Users
// =========================================
const getAllUsers = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search = "",
        role,
        status,
    } = req.query;

    const result = await getAllUsersService({
        page: Number(page),
        limit: Number(limit),
        search,
        role,
        status,
    });

    return successResponse(
        res,
        200,
        "Users fetched successfully.",
        result
    );
});

// =========================================
// Get User By ID
// =========================================
const getUserById = asyncHandler(async (req, res) => {
    const user = await getUserByIdService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "User fetched successfully.",
        user
    );
});

// =========================================
// Update User Status
// =========================================
const updateUserStatus = asyncHandler(async (req, res) => {
    const user = await updateUserStatusService(
        req.params.id,
        req.body.account_status
    );

    return successResponse(
        res,
        200,
        "User status updated successfully.",
        user
    );
});

// =========================================
// Block / Unblock User
// =========================================
const blockUnblockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
            success: false,
            message: "You cannot block your own account",
        });
    }

    const nextBlocked = !user.isBlocked;
    const updatedUser = await setUserBlockedService(req.params.id, nextBlocked);

    return successResponse(
        res,
        200,
        nextBlocked
            ? "User blocked successfully."
            : "User unblocked successfully.",
        updatedUser
    );
});

const unblockUser = asyncHandler(async (req, res) => {
    const updatedUser = await setUserBlockedService(req.params.id, false);

    return successResponse(
        res,
        200,
        "User unblocked successfully.",
        updatedUser
    );
});

// =========================================
// Delete User
// =========================================
const deleteUser = asyncHandler(async (req, res) => {
    await deleteUserService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "User deleted successfully."
    );
});

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.updateUserStatus = updateUserStatus;
exports.blockUnblockUser = blockUnblockUser;
exports.unblockUser = unblockUser;
exports.deleteUser = deleteUser;

// =========================================
// Approve Rentaler
// =========================================
const approveRentaler = asyncHandler(async (req, res) => {
    const rentaler = await approveRentalerService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Rentaler approved successfully.",
        rentaler
    );
});

// =========================================
// Reject Rentaler
// =========================================
const rejectRentaler = asyncHandler(async (req, res) => {
    const rentaler = await rejectRentalerService(
        req.params.id,
        req.body.reason
    );

    return successResponse(
        res,
        200,
        "Rentaler rejected successfully.",
        rentaler
    );
});

// =========================================
// Suspend Rentaler
// =========================================
const suspendRentaler = asyncHandler(async (req, res) => {
    const rentaler = await suspendRentalerService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Rentaler suspended successfully.",
        rentaler
    );
});

// =========================================
// Reactivate Rentaler
// =========================================
const reactivateRentaler = asyncHandler(async (req, res) => {
    const rentaler = await reactivateRentalerService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Rentaler reactivated successfully.",
        rentaler
    );
});

// =========================================
// Get Pending Rentalers
// =========================================
const getPendingRentalers = asyncHandler(async (req, res) => {
    const rentalers = await getPendingRentalersService();

    return successResponse(
        res,
        200,
        "Pending rentalers fetched successfully.",
        rentalers
    );
});

// =========================================
// Get Approved Rentalers
// =========================================
const getApprovedRentalers = asyncHandler(async (req, res) => {
    const rentalers = await getApprovedRentalersService();

    return successResponse(
        res,
        200,
        "Approved rentalers fetched successfully.",
        rentalers
    );
});

exports.approveRentaler = approveRentaler;
exports.rejectRentaler = rejectRentaler;
exports.suspendRentaler = suspendRentaler;
exports.reactivateRentaler = reactivateRentaler;
exports.getPendingRentalers = getPendingRentalers;
exports.getApprovedRentalers = getApprovedRentalers;

// =========================================
// Get Pending Equipments
// =========================================
const getPendingEquipments = asyncHandler(async (req, res) => {
    const equipments = await getPendingEquipmentsService();

    return successResponse(
        res,
        200,
        "Pending equipments fetched successfully.",
        equipments
    );
});

// =========================================
// Get Approved Equipments
// =========================================
const getApprovedEquipments = asyncHandler(async (req, res) => {
    const equipments = await getApprovedEquipmentsService();

    return successResponse(
        res,
        200,
        "Approved equipments fetched successfully.",
        equipments
    );
});

// =========================================
// Approve Equipment
// =========================================
const approveEquipment = asyncHandler(async (req, res) => {
    const equipment = await approveEquipmentService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Equipment approved successfully.",
        equipment
    );
});

// =========================================
// Reject Equipment
// =========================================
const rejectEquipment = asyncHandler(async (req, res) => {
    const equipment = await rejectEquipmentService(
        req.params.id,
        req.body.reason
    );

    return successResponse(
        res,
        200,
        "Equipment rejected successfully.",
        equipment
    );
});

exports.getPendingEquipments = getPendingEquipments;
exports.getApprovedEquipments = getApprovedEquipments;
exports.approveEquipment = approveEquipment;
exports.rejectEquipment = rejectEquipment;

// =========================================
// Get All Equipments
// =========================================
exports.getAllEquipments = async (req, res) => {
    try {
        // ===============================
        // Query Parameters
        // ===============================
        const {
            page = 1,
            limit = 10,
            approval_status,
            category,
            search,
            sort = "-createdAt",
        } = req.query;

        // ===============================
        // Build Filter
        // ===============================
        const filter = {
            is_deleted: false,
        };

        if (approval_status) {
            filter.approval_status = approval_status;
        }

        if (category) {
            filter.category_id = category;
        }

        if (search) {
            filter.title = {
                $regex: search,
                $options: "i",
            };
        }

        // ===============================
        // Get Equipments
        // ===============================
        const equipments = await Equipment.find(filter)
            .populate("rentaler_id", "fullName email phone")
            .populate("category_id", "name")
            .sort(sort)
            .skip((page - 1) * Number(limit))
            .limit(Number(limit));

        // ===============================
        // Total Count
        // ===============================
        const total = await Equipment.countDocuments(filter);

        // ===============================
        // Return Response
        // ===============================
        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            count: equipments.length,
            data: equipments,
        });

    } catch (error) {
        logger.error("Get All Equipments Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
// =========================================
// Get All Bookings
// =========================================
const getAllBookings = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        status,
        payment_status,
        search = "",
    } = req.query;

    const result = await getAllBookingsService({
        page: Number(page),
        limit: Number(limit),
        status,
        payment_status,
        search,
    });

    return successResponse(
        res,
        200,
        "Bookings fetched successfully.",
        result
    );
});

// =========================================
// Get Booking By ID
// =========================================
const getBookingById = asyncHandler(async (req, res) => {
    const booking = await getBookingByIdService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Booking fetched successfully.",
        booking
    );
});

// =========================================
// Update Booking Status
// =========================================
const updateBookingStatus = asyncHandler(async (req, res) => {
    const booking = await updateBookingStatusService(
        req.params.id,
        req.body.booking_status
    );

    return successResponse(
        res,
        200,
        "Booking status updated successfully.",
        booking
    );
});

// =========================================
// Cancel Booking
// =========================================
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await cancelBookingService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Booking cancelled successfully.",
        booking
    );
});

exports.getAllBookings = getAllBookings;
exports.getBookingById = getBookingById;
exports.updateBookingStatus = updateBookingStatus;
exports.cancelBooking = cancelBooking;
exports.deleteBooking = cancelBooking;

// =========================================
// Get All Payments
// =========================================
const getAllPayments = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        payment_status,
        payment_method,
    } = req.query;

    const result = await getAllPaymentsService({
        page: Number(page),
        limit: Number(limit),
        payment_status,
        payment_method,
    });

    return successResponse(
        res,
        200,
        "Payments fetched successfully.",
        result
    );
});

// =========================================
// Get Payment By ID
// =========================================
const getPaymentById = asyncHandler(async (req, res) => {
    const payment = await getPaymentByIdService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Payment fetched successfully.",
        payment
    );
});

// =========================================
// Update Payment Status
// =========================================
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const payment = await updatePaymentStatusService(
        req.params.id,
        req.body.payment_status
    );

    return successResponse(
        res,
        200,
        "Payment status updated successfully.",
        payment
    );
});

// =========================================
// Refund Payment
// =========================================
const refundPayment = asyncHandler(async (req, res) => {
    const payment = await refundPaymentService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Payment refunded successfully.",
        payment
    );
});

exports.getAllPayments = getAllPayments;
exports.getPaymentById = getPaymentById;
exports.updatePaymentStatus = updatePaymentStatus;
exports.refundPayment = refundPayment;

// =========================================
// Payment Statistics
// =========================================
exports.paymentStatistics = async (req, res) => {
    try {

        // ===============================
        // Payment Counts
        // ===============================
        const totalPayments = await Payment.countDocuments();

        const paidPayments = await Payment.countDocuments({
            payment_status: "paid",
        });

        const refundedPayments = await Payment.countDocuments({
            payment_status: "refunded",
        });

        const failedPayments = await Payment.countDocuments({
            payment_status: "failed",
        });

        // ===============================
        // Revenue Statistics
        // ===============================
        const revenue = await Payment.aggregate([
            {
                $match: {
                    payment_status: "paid",
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$amount",
                    },
                    totalCommission: {
                        $sum: "$commission_amount",
                    },
                },
            },
        ]);

        // ===============================
        // Monthly Revenue
        // ===============================
        const monthlyRevenue = await Payment.aggregate([
            {
                $match: {
                    payment_status: "paid",
                },
            },
            {
                $group: {
                    _id: {
                        year: {
                            $year: "$createdAt",
                        },
                        month: {
                            $month: "$createdAt",
                        },
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
        ]);

        // ===============================
        // Recent Payments
        // ===============================
        const recentPayments = await Payment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: "booking_id",
                populate: {
                    path: "farmer_id",
                    select: "fullName",
                },
            });

        // ===============================
        // Return Response
        // ===============================
        return res.status(200).json({
            success: true,
            data: {
                totalPayments,
                paidPayments,
                refundedPayments,
                failedPayments,

                totalRevenue:
                    revenue.length > 0
                        ? revenue[0].totalRevenue
                        : 0,

                totalCommission:
                    revenue.length > 0
                        ? revenue[0].totalCommission
                        : 0,

                monthlyRevenue,

                recentPayments,
            },
        });

    } catch (error) {
        logger.error("Payment Statistics Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// =========================================
// Get All Reviews
// =========================================
const getAllReviews = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        rating,
    } = req.query;

    const result = await getAllReviewsService({
        page: Number(page),
        limit: Number(limit),
        rating,
    });

    return successResponse(
        res,
        200,
        "Reviews fetched successfully.",
        result
    );
});

// =========================================
// Get Review By ID
// =========================================
const getReviewById = asyncHandler(async (req, res) => {
    const review = await getReviewByIdService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Review fetched successfully.",
        review
    );
});

// =========================================
// Hide Review
// =========================================
const hideReview = asyncHandler(async (req, res) => {
    const review = await hideReviewService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Review hidden successfully.",
        review
    );
});

// =========================================
// Restore Review
// =========================================
const restoreReview = asyncHandler(async (req, res) => {
    const review = await restoreReviewService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Review restored successfully.",
        review
    );
});

// =========================================
// Delete Review
// =========================================
const deleteReview = asyncHandler(async (req, res) => {
    await deleteReviewService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Review deleted successfully."
    );
});

exports.getAllReviews = getAllReviews;
exports.getReviewById = getReviewById;
exports.hideReview = hideReview;
exports.restoreReview = restoreReview;
exports.deleteReview = deleteReview;

// =========================================
// Get All Notifications
// =========================================
const getAllNotifications = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        type,
        is_read,
    } = req.query;

    const result = await getAllNotificationsService({
        page: Number(page),
        limit: Number(limit),
        type,
        is_read,
    });

    return successResponse(
        res,
        200,
        "Notifications fetched successfully.",
        result
    );
});

// =========================================
// Get Notification By ID
// =========================================
const getNotificationById = asyncHandler(async (req, res) => {
    const notification = await getNotificationByIdService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Notification fetched successfully.",
        notification
    );
});

// =========================================
// Mark Notification As Read
// =========================================
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await markNotificationAsReadService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Notification marked as read.",
        notification
    );
});

// =========================================
// Delete Notification
// =========================================
const deleteNotification = asyncHandler(async (req, res) => {
    await deleteNotificationService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Notification deleted successfully."
    );
});

// =========================================
// Broadcast Notification
// =========================================
const broadcastNotification = asyncHandler(async (req, res) => {
    const result = await broadcastNotificationService({
        title: req.body.title,
        message: req.body.message,
        type: req.body.type,
        audience: req.body.audience,
    });

    return successResponse(
        res,
        201,
        "Notification broadcasted successfully.",
        result
    );
});

exports.getAllNotifications = getAllNotifications;
exports.getNotificationById = getNotificationById;
exports.markNotificationAsRead = markNotificationAsRead;
exports.deleteNotification = deleteNotification;
exports.broadcastNotification = broadcastNotification;

// =========================================
// Get Revenue Analytics
// =========================================
const getRevenueAnalytics = asyncHandler(async (req, res) => {
    const analytics = await getRevenueAnalyticsService();

    return successResponse(
        res,
        200,
        "Revenue analytics fetched successfully.",
        analytics
    );
});

// =========================================
// Get Booking Analytics
// =========================================
const getBookingAnalytics = asyncHandler(async (req, res) => {
    const analytics = await getBookingAnalyticsService();

    return successResponse(
        res,
        200,
        "Booking analytics fetched successfully.",
        analytics
    );
});

// =========================================
// Get User Analytics
// =========================================
const getUserAnalytics = asyncHandler(async (req, res) => {
    const analytics = await getUserAnalyticsService();

    return successResponse(
        res,
        200,
        "User analytics fetched successfully.",
        analytics
    );
});

// =========================================
// Get Equipment Analytics
// =========================================
const getEquipmentAnalytics = asyncHandler(async (req, res) => {
    const analytics = await getEquipmentAnalyticsService();

    return successResponse(
        res,
        200,
        "Equipment analytics fetched successfully.",
        analytics
    );
});

// =========================================
// Get Admin Dashboard Analytics
// =========================================
const getAdminAnalyticsDashboard = asyncHandler(async (req, res) => {
    const analytics = await getAdminAnalyticsDashboardService();

    return successResponse(
        res,
        200,
        "Admin dashboard analytics fetched successfully.",
        analytics
    );
});

exports.getRevenueAnalytics = getRevenueAnalytics;
exports.getBookingAnalytics = getBookingAnalytics;
exports.getUserAnalytics = getUserAnalytics;
exports.getEquipmentAnalytics = getEquipmentAnalytics;
exports.getAdminAnalyticsDashboard = getAdminAnalyticsDashboard;

// =========================================
// Notification Statistics
// =========================================
exports.notificationStatistics = async (req, res) => {
    try {
        // ===============================
        // Notification Statistics
        // ===============================
        const totalNotifications = await Notification.countDocuments();

        const unreadNotifications = await Notification.countDocuments({
            isRead: false,
        });

        const readNotifications = await Notification.countDocuments({
            isRead: true,
        });

        const bookingNotifications = await Notification.countDocuments({
            type: "booking",
        });

        const paymentNotifications = await Notification.countDocuments({
            type: "payment",
        });

        const equipmentNotifications = await Notification.countDocuments({
            type: "equipment",
        });

        const reviewNotifications = await Notification.countDocuments({
            type: "review",
        });

        const systemNotifications = await Notification.countDocuments({
            type: "system",
        });

        // ===============================
        // Return Response
        // ===============================
        return res.status(200).json({
            success: true,
            data: {
                totalNotifications,
                unreadNotifications,
                readNotifications,
                bookingNotifications,
                paymentNotifications,
                equipmentNotifications,
                reviewNotifications,
                systemNotifications,
            },
        });

    } catch (error) {
        logger.error("Notification Statistics Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};



// =========================================
// Analytics Dashboard
// =========================================
exports.getAnalytics = async (req, res) => {
    try {
        // ===============================
        // User Statistics
        // ===============================
        const totalUsers = await User.countDocuments();

        const totalFarmers = await User.countDocuments({
            is_farmer: true,
        });

        const totalRentalers = await User.countDocuments({
            is_rentaler: true,
        });

        const blockedUsers = await User.countDocuments({
            isBlocked: true,
        });

        // ===============================
        // Equipment Statistics
        // ===============================
        const totalEquipments = await Equipment.countDocuments();

        const approvedEquipments = await Equipment.countDocuments({
            approval_status: "approved",
        });

        const pendingEquipments = await Equipment.countDocuments({
            approval_status: "pending",
        });

        const rejectedEquipments = await Equipment.countDocuments({
            approval_status: "rejected",
        });

        // ===============================
        // Booking Statistics
        // ===============================
        const totalBookings = await Booking.countDocuments();

        const completedBookings = await Booking.countDocuments({
            booking_status: "completed",
        });

        const activeBookings = await Booking.countDocuments({
            booking_status: "active",
        });

        const cancelledBookings = await Booking.countDocuments({
            booking_status: "cancelled",
        });

        // ===============================
        // Payment Statistics
        // ===============================
        const totalPayments = await Payment.countDocuments();

        const successfulPayments = await Payment.countDocuments({
            payment_status: "paid",
        });

        const refundedPayments = await Payment.countDocuments({
            payment_status: "refunded",
        });

        // ===============================
        // Revenue Statistics
        // ===============================
        const revenue = await Payment.aggregate([
            {
                $match: {
                    payment_status: "paid",
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$amount",
                    },
                    totalCommission: {
                        $sum: "$commission_amount",
                    },
                },
            },
        ]);

        // ===============================
        // Monthly User Registrations
        // ===============================
        const monthlyUsers = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    users: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]);

        // ===============================
        // Monthly Bookings
        // ===============================
        const monthlyBookings = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    bookings: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]);

        // ===============================
        // Monthly Revenue
        // ===============================
        const monthlyRevenue = await Payment.aggregate([
            {
                $match: {
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
        ]);

        // ===============================
        // Top Rated Equipments
        // ===============================
        const topEquipments = await Equipment.find({
            approval_status: "approved",
        })
            .sort({
                average_rating: -1,
                total_reviews: -1,
            })
            .limit(5)
            .select("title average_rating total_reviews");

        // ===============================
        // Top Rentalers
        // ===============================
        const topRentalers = await User.find({
            is_rentaler: true,
        })
            .select("fullName email")
            .limit(5);

        const calculatedTotalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;

        // ===============================
        // Return Analytics
        // ===============================
        return res.status(200).json({
            success: true,
            data: {
                // Flat shape for direct page compatibility
                totalUsers,
                totalFarmers,
                totalRentalers,
                totalEquipments,
                totalBookings,
                completedBookings,
                totalRevenue: calculatedTotalRevenue,
                monthlyRevenue,
                monthlyBookings,
                monthlyUsers,

                // Nested shape for backwards compatibility
                users: {
                    totalUsers,
                    totalFarmers,
                    totalRentalers,
                    blockedUsers,
                },

                equipments: {
                    totalEquipments,
                    approvedEquipments,
                    pendingEquipments,
                    rejectedEquipments,
                },

                bookings: {
                    totalBookings,
                    completedBookings,
                    activeBookings,
                    cancelledBookings,
                },

                payments: {
                    totalPayments,
                    successfulPayments,
                    refundedPayments,
                },

                revenue: {
                    totalRevenue: calculatedTotalRevenue,
                    totalCommission:
                        revenue.length > 0
                            ? revenue[0].totalCommission
                            : 0,
                },

                topEquipments,
                topRentalers,
            },
        });

    } catch (error) {
        logger.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// =========================================
// Get Reports
// =========================================
exports.getReports = async (req, res) => {
    try {
        const { from, to } = req.query;

        // Build optional date range filter
        const dateFilter = {};
        if (from || to) {
            dateFilter.createdAt = {};
            if (from) dateFilter.createdAt.$gte = new Date(from);
            if (to) dateFilter.createdAt.$lte = new Date(to);
        }

        // ===============================
        // Booking Report
        // ===============================
        const bookings = await Booking.find(dateFilter)
            .populate("farmer_id", "fullName email")
            .populate("rentaler_id", "fullName email")
            .populate("equipment_id", "title")
            .sort({ createdAt: -1 })
            .select("booking_status payment_status total_amount start_date end_date createdAt");

        // ===============================
        // Payment Report
        // ===============================
        const payments = await Payment.find(dateFilter)
            .populate({
                path: "booking_id",
                populate: { path: "farmer_id", select: "fullName email" },
            })
            .sort({ createdAt: -1 })
            .select("payment_status amount commission_amount payout_amount paid_at refunded_at createdAt");

        // ===============================
        // Revenue Summary
        // ===============================
        const [revenueSummary] = await Payment.aggregate([
            { $match: { ...dateFilter, payment_status: "paid" } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                    totalCommission: { $sum: "$commission_amount" },
                    totalPayout: { $sum: "$payout_amount" },
                    totalPayments: { $sum: 1 },
                },
            },
        ]);

        // ===============================
        // User Summary
        // ===============================
        const totalUsers = await User.countDocuments(dateFilter);
        const totalFarmers = await User.countDocuments({ ...dateFilter, is_farmer: true });
        const totalRentalers = await User.countDocuments({ ...dateFilter, is_rentaler: true });

        // ===============================
        // Equipment Summary
        // ===============================
        const totalEquipments = await Equipment.countDocuments(dateFilter);
        const approvedEquipments = await Equipment.countDocuments({ ...dateFilter, approval_status: "approved" });
        const pendingEquipments = await Equipment.countDocuments({ ...dateFilter, approval_status: "pending" });

        // ===============================
        // Review Summary
        // ===============================
        const [reviewSummary] = await Review.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$rating" },
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            period: { from: from || null, to: to || null },
            data: {
                summary: {
                    users: { totalUsers, totalFarmers, totalRentalers },
                    equipments: { totalEquipments, approvedEquipments, pendingEquipments },
                    revenue: revenueSummary
                        ? {
                            totalRevenue: revenueSummary.totalRevenue,
                            totalCommission: revenueSummary.totalCommission,
                            totalPayout: revenueSummary.totalPayout,
                            totalPayments: revenueSummary.totalPayments,
                        }
                        : { totalRevenue: 0, totalCommission: 0, totalPayout: 0, totalPayments: 0 },
                    reviews: reviewSummary
                        ? {
                            totalReviews: reviewSummary.totalReviews,
                            averageRating: parseFloat(reviewSummary.averageRating.toFixed(2)),
                        }
                        : { totalReviews: 0, averageRating: 0 },
                },
                bookings,
                payments,
            },
        });

    } catch (error) {
        logger.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};