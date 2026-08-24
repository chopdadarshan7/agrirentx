const mongoose = require("mongoose");
const User = require("../models/user");
const Equipment = require("../models/equipment");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Review = require("../models/review");
const Notification = require("../models/notification");
const razorpay = require("../config/razorpay");
const sendNotification = require("../utils/sendNotification");
const { sendEmail } = require("./emailService");
const {
    approvalEmail,
    rejectionEmail,
} = require("../utils/emailTemplates");

const getDashboardStatisticsService = async () => {
    const today = new Date();

    const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [
        totalUsers,
        totalFarmers,
        totalRentalers,
        totalEquipments,
        approvedEquipments,
        pendingEquipments,
        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        todayBookings,
        pendingPayments,
        totalReviews,
        averageRating,
        newUsers,
        totalRevenue,
        monthlyRevenue,
        recentBookings,
        recentPayments
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ is_farmer: true }),
        User.countDocuments({ is_rentaler: true }),
        Equipment.countDocuments(),
        Equipment.countDocuments({
            approval_status: "approved"
        }),
        Equipment.countDocuments({
            approval_status: "pending"
        }),
        Booking.countDocuments(),
        Booking.countDocuments({
            booking_status: { $in: ["confirmed", "active"] }
        }),
        Booking.countDocuments({
            booking_status: "completed"
        }),
        Booking.countDocuments({
            booking_status: "cancelled"
        }),
        Booking.countDocuments({
            createdAt: { $gte: startOfToday }
        }),
        Payment.countDocuments({
            payment_status: "pending"
        }),
        Review.countDocuments(),
        Review.aggregate([
            {
                $group: {
                    _id: null,
                    average: {
                        $avg: "$rating"
                    }
                }
            }
        ]),
        User.countDocuments({
            createdAt: {
                $gte: last30Days
            }
        }),
        Payment.aggregate([
            {
                $match: {
                    payment_status: "paid"
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount"
                    }
                }
            }
        ]),
        Payment.aggregate([
            {
                $match: {
                    payment_status: "paid",
                    createdAt: {
                        $gte: startOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount"
                    }
                }
            }
        ]),
        Booking.find()
            .populate(
                "farmer_id",
                "fullName"
            )
            .populate(
                "equipment_id",
                "name title"
            )
            .sort({
                createdAt: -1
            })
            .limit(10),
        Payment.find()
            .sort({
                createdAt: -1
            })
            .limit(10)
    ]);

    return {
        users: {
            totalUsers,
            totalFarmers,
            totalRentalers,
            newUsers
        },
        equipments: {
            totalEquipments,
            approvedEquipments,
            pendingEquipments
        },
        bookings: {
            totalBookings,
            activeBookings,
            completedBookings,
            cancelledBookings,
            todayBookings
        },
        payments: {
            pendingPayments,
            totalRevenue:
                totalRevenue[0]?.total || 0,
            monthlyRevenue:
                monthlyRevenue[0]?.total || 0
        },
        reviews: {
            totalReviews,
            averageRating:
                parseFloat((averageRating[0]?.average || 0).toFixed(2))
        },
        recentBookings,
        recentPayments
    };
};

const getAllUsersService = async ({
    page = 1,
    limit = 10,
    search = "",
    role,
    status,
}) => {
    const query = {};

    if (search) {
        query.$or = [
            {
                fullName: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                email: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                phone: {
                    $regex: search,
                    $options: "i",
                },
            },
        ];
    }

    if (role === "farmer") {
        query.is_farmer = true;
    }

    if (role === "rentaler") {
        query.is_rentaler = true;
    }

    if (role === "admin") {
        query.isAdmin = true;
    }

    if (status) {
        query.account_status = status;
    }

    const total = await User.countDocuments(query);

    const users = await User.find(query)
        .select("-password")
        .sort({
            createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

    return {
        users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getUserByIdService = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user id.");
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
        throw new Error("User not found.");
    }

    return user;
};

const updateUserStatusService = async (
    id,
    account_status
) => {
    const user = await User.findByIdAndUpdate(
        id,
        {
            account_status,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password");

    if (!user) {
        throw new Error("User not found.");
    }

    return user;
};

const setUserBlockedService = async (id, isBlocked) => {
    const user = await User.findByIdAndUpdate(
        id,
        { isBlocked },
        { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
        throw new Error("User not found.");
    }

    return user;
};

const deleteUserService = async (id) => {
    const user = await User.findByIdAndUpdate(
        id,
        {
            is_deleted: true,
        },
        {
            new: true,
        }
    );

    if (!user) {
        throw new Error("User not found.");
    }

    return true;
};

const approveRentalerService = async (id) => {
    const rentaler = await User.findById(id);

    if (!rentaler) {
        throw new Error("Rentaler not found.");
    }

    rentaler.rentaler_status = "approved";
    rentaler.is_rentaler = true;

    await rentaler.save();

    await sendNotification({
        receiver_id: rentaler._id,
        title: "Rentaler Approved",
        message: "Congratulations! Your rentaler account has been approved.",
        type: "system",
        reference_id: rentaler._id,
    });

    await sendEmail({
        to: rentaler.email,
        subject: "Rentaler Approval",
        html: approvalEmail(rentaler.fullName),
    });

    return rentaler;
};

const rejectRentalerService = async (
    id,
    reason
) => {
    const rentaler = await User.findById(id);

    if (!rentaler) {
        throw new Error("Rentaler not found.");
    }

    rentaler.rentaler_status = "rejected";

    await rentaler.save();

    await sendNotification({
        receiver_id: rentaler._id,
        title: "Rentaler Rejected",
        message: reason || "Your application was rejected.",
        type: "system",
        reference_id: rentaler._id,
    });

    await sendEmail({
        to: rentaler.email,
        subject: "Rentaler Application Rejected",
        html: rejectionEmail(
            rentaler.fullName,
            reason
        ),
    });

    return rentaler;
};

const suspendRentalerService = async (id) => {
    const rentaler = await User.findByIdAndUpdate(
        id,
        {
            account_status: "suspended",
        },
        {
            new: true,
        }
    );

    if (!rentaler) {
        throw new Error("Rentaler not found.");
    }

    return rentaler;
};

const reactivateRentalerService = async (id) => {
    const rentaler = await User.findByIdAndUpdate(
        id,
        {
            account_status: "active",
        },
        {
            new: true,
        }
    );

    if (!rentaler) {
        throw new Error("Rentaler not found.");
    }

    return rentaler;
};

const getPendingRentalersService = async () => {
    return await User.find({
        rentaler_status: "pending",
        is_rentaler: true,
    }).select("-password");
};

const getApprovedRentalersService = async () => {
    return await User.find({
        rentaler_status: "approved",
        is_rentaler: true,
    }).select("-password");
};

const getPendingEquipmentsService = async () => {
    return await Equipment.find({
        approval_status: "pending",
    })
    .populate("rentaler_id", "fullName email phone")
    .populate("category_id", "name")
    .sort({
        createdAt: -1,
    });
};

const getApprovedEquipmentsService = async () => {
    return await Equipment.find({
        approval_status: "approved",
    })
    .populate("rentaler_id", "fullName email phone")
    .populate("category_id", "name")
    .sort({
        createdAt: -1,
    });
};

const approveEquipmentService = async (
    equipmentId
) => {
    const equipment = await Equipment.findById(equipmentId)
        .populate("rentaler_id");

    if (!equipment) {
        throw new Error("Equipment not found.");
    }

    equipment.approval_status = "approved";

    await equipment.save();

    const owner = equipment.rentaler_id || equipment.owner_id;
    const name = equipment.title || equipment.name;

    if (owner) {
        await sendNotification({
            receiver_id: owner._id,
            title: "Equipment Approved",
            message: `${name} has been approved.`,
            type: "system",
            reference_id: equipment._id,
        });

        await sendEmail({
            to: owner.email,
            subject: "Equipment Approved",
            html: approvalEmail(owner.fullName),
        });
    }

    return equipment;
};

const rejectEquipmentService = async (
    equipmentId,
    reason
) => {
    const equipment = await Equipment.findById(equipmentId)
        .populate("rentaler_id");

    if (!equipment) {
        throw new Error("Equipment not found.");
    }

    equipment.approval_status = "rejected";
    equipment.rejection_reason = reason;

    await equipment.save();

    const owner = equipment.rentaler_id || equipment.owner_id;

    if (owner) {
        await sendNotification({
            receiver_id: owner._id,
            title: "Equipment Rejected",
            message: reason || "Your equipment application was rejected.",
            type: "system",
            reference_id: equipment._id,
        });

        await sendEmail({
            to: owner.email,
            subject: "Equipment Rejected",
            html: rejectionEmail(
                owner.fullName,
                reason
            ),
        });
    }

    return equipment;
};

const getAllBookingsService = async ({
    page = 1,
    limit = 10,
    status,
    payment_status,
    search = "",
}) => {
    const query = {};

    if (status) {
        query.booking_status = status;
    }

    if (payment_status) {
        query.payment_status = payment_status;
    }

    const bookings = await Booking.find(query)
        .populate("farmer_id", "fullName email phone")
        .populate("rentaler_id", "fullName email phone")
        .populate("equipment_id", "title name")
        .sort({
            createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Booking.countDocuments(query);

    return {
        bookings,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getBookingByIdService = async (
    bookingId
) => {
    const booking = await Booking.findById(bookingId)
        .populate("farmer_id", "fullName email phone")
        .populate("rentaler_id", "fullName email phone")
        .populate("equipment_id");

    if (!booking) {
        throw new Error(
            "Booking not found."
        );
    }

    return booking;
};

const updateBookingStatusService = async (
    bookingId,
    booking_status
) => {
    const booking = await Booking.findById(
        bookingId
    );

    if (!booking) {
        throw new Error(
            "Booking not found."
        );
    }

    booking.booking_status = booking_status;

    await booking.save();

    return booking;
};

const cancelBookingService = async (
    bookingId
) => {
    const booking = await Booking.findById(
        bookingId
    );

    if (!booking) {
        throw new Error(
            "Booking not found."
        );
    }

    booking.booking_status = "cancelled";

    await booking.save();

    return booking;
};

const getAllPaymentsService = async ({
    page = 1,
    limit = 10,
    payment_status,
    payment_method,
}) => {
    const query = {};

    if (payment_status) {
        query.payment_status = payment_status;
    }

    if (payment_method) {
        query.payment_method = payment_method;
    }

    const payments = await Payment.find(query)
        .populate({
            path: "booking_id",
            populate: [
                { path: "equipment_id", select: "title images price_per_day" },
                { path: "farmer_id", select: "fullName email phone" },
                { path: "rentaler_id", select: "fullName email phone" },
            ],
        })
        .sort({
            createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Payment.countDocuments(query);

    return {
        payments,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getPaymentByIdService = async (
    paymentId
) => {
    const payment = await Payment.findById(paymentId)
        .populate({
            path: "booking_id",
            populate: [
                { path: "equipment_id", select: "title images price_per_day" },
                { path: "farmer_id", select: "fullName email phone" },
                { path: "rentaler_id", select: "fullName email phone" },
            ],
        });

    if (!payment) {
        throw new Error(
            "Payment not found."
        );
    }

    return payment;
};

const updatePaymentStatusService = async (
    paymentId,
    payment_status
) => {
    const payment = await Payment.findById(
        paymentId
    );

    if (!payment) {
        throw new Error(
            "Payment not found."
        );
    }

    payment.payment_status = payment_status;

    await payment.save();

    return payment;
};

const refundPaymentService = async (
    paymentId
) => {
    const payment = await Payment.findById(
        paymentId
    );

    if (!payment) {
        throw new Error(
            "Payment not found."
        );
    }

    if (payment.payment_status === "refunded") {
        throw new Error("Payment has already been refunded.");
    }

    let refundId = "";
    if (payment.razorpay_payment_id && razorpay && razorpay.payments) {
        try {
            const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
                amount: payment.amount * 100,
            });
            refundId = refund ? refund.id : "";
        } catch (err) {
            // Log razorpay refund attempt
        }
    }

    payment.payment_status = "refunded";
    payment.refund_status = "processed";
    if (refundId) payment.refund_id = refundId;
    payment.refunded_at = new Date();

    await payment.save();

    if (payment.booking_id) {
        const booking = await Booking.findById(payment.booking_id);
        if (booking) {
            booking.payment_status = "refunded";
            booking.booking_status = "cancelled";
            await booking.save();

            const equipment = await Equipment.findById(booking.equipment_id);
            if (equipment) {
                equipment.status = "available";
                await equipment.save();
            }

            if (booking.farmer_id) {
                await sendNotification({
                    receiver_id: booking.farmer_id,
                    title: "Payment Refunded",
                    message: "Your payment has been refunded by the administrator.",
                    type: "payment",
                    reference_id: payment._id,
                });
            }
        }
    }

    return payment;
};

const getAllReviewsService = async ({
    page = 1,
    limit = 10,
    rating,
}) => {
    const query = {};

    if (rating) {
        query.rating = Number(rating);
    }

    const reviews = await Review.find(query)
        .populate("farmer_id", "fullName email")
        .populate("equipment_id", "title name")
        .populate("booking_id")
        .sort({
            createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Review.countDocuments(query);

    return {
        reviews,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getReviewByIdService = async (
    reviewId
) => {
    const review = await Review.findById(reviewId)
        .populate("farmer_id", "fullName email")
        .populate("equipment_id")
        .populate("booking_id");

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    return review;
};

const hideReviewService = async (
    reviewId
) => {
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    review.is_hidden = true;
    review.isVisible = false;

    await review.save();

    return review;
};

const restoreReviewService = async (
    reviewId
) => {
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    review.is_hidden = false;
    review.isVisible = true;

    await review.save();

    return review;
};

const deleteReviewService = async (
    reviewId
) => {
    const review = await Review.findByIdAndDelete(
        reviewId
    );

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    return true;
};

const getAllNotificationsService = async ({
    page = 1,
    limit = 10,
    type,
    is_read,
}) => {
    const query = {};

    if (type) {
        query.type = type;
    }

    if (is_read !== undefined) {
        query.isRead = is_read === "true";
    }

    const notifications = await Notification.find(query)
        .populate("receiver_id", "fullName email phone")
        .sort({
            createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Notification.countDocuments(query);

    return {
        notifications,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getNotificationByIdService = async (
    notificationId
) => {
    const notification = await Notification.findById(
        notificationId
    ).populate(
        "receiver_id",
        "fullName email phone"
    );

    if (!notification) {
        throw new Error(
            "Notification not found."
        );
    }

    return notification;
};

const markNotificationAsReadService = async (
    notificationId
) => {
    const notification = await Notification.findById(
        notificationId
    );

    if (!notification) {
        throw new Error(
            "Notification not found."
        );
    }

    notification.isRead = true;

    await notification.save();

    return notification;
};

const deleteNotificationService = async (
    notificationId
) => {
    const notification = await Notification.findByIdAndDelete(
        notificationId
    );

    if (!notification) {
        throw new Error(
            "Notification not found."
        );
    }

    return true;
};

const broadcastNotificationService = async ({
    title,
    message,
    type = "system",
    audience = "all",
}) => {
    const query = {
        isBlocked: false,
        isDeleted: { $ne: true },
    };

    if (audience === "farmers") {
        query.is_farmer = true;
    } else if (audience === "rentalers") {
        query.is_rentaler = true;
    }

    const users = await User.find(query).select("_id");

    const notifications = users.map((user) => ({
        receiver_id: user._id,
        title,
        message,
        type,
    }));

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);

        try {
            const { getIO, getUserSocket } = require("../config/socket");
            const io = getIO();
            if (io) {
                users.forEach((user) => {
                    const socketId = getUserSocket(user._id.toString());
                    if (socketId) {
                        io.to(socketId).emit("new_notification", {
                            title,
                            message,
                            type,
                            createdAt: new Date(),
                        });
                    }
                });
            }
        } catch (socketErr) {
            // Optional socket emission
        }
    }

    return {
        totalSent: notifications.length,
    };
};

const getRevenueAnalyticsService = async () => {
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
                totalTransactions: {
                    $sum: 1,
                },
                averageTransaction: {
                    $avg: "$amount",
                },
            },
        },
    ]);

    return revenue[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0,
    };
};

const getBookingAnalyticsService = async () => {
    const analytics = await Booking.aggregate([
        {
            $group: {
                _id: "$booking_status",
                total: {
                    $sum: 1,
                },
            },
        },
    ]);

    return analytics;
};

const getUserAnalyticsService = async () => {
    const [
        totalUsers,
        totalFarmers,
        totalRentalers,
        activeUsers,
        blockedUsers,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({
            is_farmer: true,
        }),
        User.countDocuments({
            is_rentaler: true,
        }),
        User.countDocuments({
            account_status: "active",
        }),
        User.countDocuments({
            account_status: "blocked",
        }),
    ]);

    return {
        totalUsers,
        totalFarmers,
        totalRentalers,
        activeUsers,
        blockedUsers,
    };
};

const getEquipmentAnalyticsService = async () => {
    const [
        total,
        approved,
        pending,
        rejected,
    ] = await Promise.all([
        Equipment.countDocuments(),
        Equipment.countDocuments({
            approval_status: "approved",
        }),
        Equipment.countDocuments({
            approval_status: "pending",
        }),
        Equipment.countDocuments({
            approval_status: "rejected",
        }),
    ]);

    return {
        total,
        approved,
        pending,
        rejected,
    };
};

const getAdminAnalyticsDashboardService = async () => {
    const [
        revenue,
        bookings,
        users,
        equipments,
    ] = await Promise.all([
        getRevenueAnalyticsService(),
        getBookingAnalyticsService(),
        getUserAnalyticsService(),
        getEquipmentAnalyticsService(),
    ]);

    return {
        revenue,
        bookings,
        users,
        equipments,
    };
};

module.exports = {
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
};
