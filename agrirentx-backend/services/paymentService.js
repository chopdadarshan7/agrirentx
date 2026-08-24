const razorpay = require("../config/razorpay");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Equipment = require("../models/equipment");
const Notification = require("../models/notification");
const crypto = require("crypto");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const User = require("../models/user");
const auditLog = require("../utils/auditLogger");
const paymentEventLogger = require("../utils/paymentEventLogger");
const sendNotification = require("../utils/sendNotification");
const { sendEmail } = require("./emailService");
const { paymentEmail } = require("../utils/emailTemplates");

const createPaymentOrder = async (bookingId) => {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new Error("Booking not found.");
    }

    const existingPayment = await Payment.findOne({
        booking_id: bookingId,
        payment_status: {
            $in: ["pending", "paid"],
        },
    });

    if (existingPayment) {
        return {
            payment: existingPayment,
            order: {
                id: existingPayment.razorpay_order_id,
            },
        };
    }

    const options = {
        amount: booking.total_amount * 100,
        currency: "INR",
        receipt: `booking_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
        booking_id: booking._id,
        amount: booking.total_amount,
        currency: "INR",
        razorpay_order_id: order.id,
        payment_status: "pending",
        commission_amount: booking.platform_fee || 0,
        payout_amount:
            (booking.total_amount || 0) -
            (booking.platform_fee || 0) -
            (booking.deposit_amount || 0),
    });

    paymentEventLogger(payment._id, "PAYMENT_CREATED", {
        amount: payment.amount,
        booking: payment.booking_id,
    });
    auditLog("PAYMENT_CREATED", booking.farmer_id, "Payment", payment._id, {
        amount: payment.amount,
    });

    return {
        payment,
        order,
    };
};

const verifyPaymentService = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}) => {

    const generatedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
        throw new Error("Payment verification failed.");
    }

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const payment = await Payment.findOne({
            razorpay_order_id,
        }).session(session);

        if (!payment) {
            throw new Error("Payment not found.");
        }

        payment.razorpay_payment_id =
            razorpay_payment_id;

        payment.razorpay_signature =
            razorpay_signature;

        payment.payment_status = "paid";

        payment.payment_date = new Date();

        await payment.save({ session });

        paymentEventLogger(payment._id, "PAYMENT_SUCCESS", {
            razorpay_payment_id: payment.razorpay_payment_id,
        });
        auditLog("PAYMENT_VERIFIED", payment.farmer_id, "Payment", payment._id);

        const booking =
            await Booking.findByIdAndUpdate(
                payment.booking_id,
                {
                    payment_status: "paid",
                    booking_status: "confirmed",
                },
                {
                    new: true,
                    session,
                }
            );

        await Equipment.findByIdAndUpdate(
            booking.equipment_id,
            {
                status: "rented",
            },
            {
                session,
            }
        );

        await session.commitTransaction();

        session.endSession();

        await sendNotification({
            receiver_id: booking.rentaler_id,
            title: "Payment Received",
            message: "A payment has been completed for your booking.",
            type: "payment",
            reference_id: payment._id,
        });

        const user = await User.findById(booking.farmer_id || payment.farmer_id);
        if (user && user.email) {
            await sendEmail({
                to: user.email,
                subject: "Payment Successful",
                html: paymentEmail(user.fullName),
            });
        }

        return payment;

    } catch (error) {

        await session.abortTransaction();

        session.endSession();

        throw error;

    }

};

const refundPaymentService = async (paymentId) => {

    const payment = await Payment.findById(paymentId);

    if (!payment) {
        throw new Error("Payment not found.");
    }

    if (payment.payment_status !== "paid") {
        throw new Error("Only paid payments can be refunded.");
    }

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const refund =
            await razorpay.payments.refund(
                payment.razorpay_payment_id,
                {
                    amount: payment.amount * 100,
                }
            );

        payment.payment_status = "refunded";

        payment.refund_id = refund.id;

        await payment.save({ session });

        const booking =
            await Booking.findByIdAndUpdate(
                payment.booking_id,
                {
                    payment_status: "refunded",
                    booking_status: "cancelled",
                },
                {
                    new: true,
                    session,
                }
            );

        await Equipment.findByIdAndUpdate(
            booking.equipment_id,
            {
                status: "available",
            },
            {
                session,
            }
        );

        await session.commitTransaction();

        session.endSession();

        return refund;

    } catch (error) {

        await session.abortTransaction();

        session.endSession();

        throw error;

    }

};

const retryPaymentService = async (paymentId) => {

    const payment = await Payment.findById(paymentId);

    if (!payment) {
        throw new Error("Payment not found.");
    }

    if (payment.payment_status !== "failed") {
        throw new Error("Only failed payments can be retried.");
    }

    const booking = await Booking.findById(
        payment.booking_id
    );

    if (!booking) {
        throw new Error("Booking not found.");
    }

    const options = {
        amount: payment.amount * 100,
        currency: payment.currency,
        receipt: `retry_${booking._id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    payment.razorpay_order_id = order.id;
    payment.payment_status = "pending";

    await payment.save();

    return {
        payment,
        order,
    };

};

const getPaymentByIdService = async (paymentId) => {
    const payment = await Payment.findById(paymentId)
        .populate({
            path: "booking_id",
            populate: [
                {
                    path: "equipment_id",
                    select: "title images price_per_day",
                },
                {
                    path: "farmer_id",
                    select: "fullName email phone",
                },
                {
                    path: "rentaler_id",
                    select: "fullName email phone",
                },
            ],
        });

    if (!payment) {
        throw new Error("Payment not found.");
    }

    return payment;
};

const getPaymentHistoryService = async (farmerId) => {
    const payments = await Payment.find()
        .populate({
            path: "booking_id",
            match: { farmer_id: farmerId },
            populate: {
                path: "equipment_id",
                select: "title images price_per_day",
            },
        })
        .sort({ createdAt: -1 });

    return payments.filter((payment) => payment.booking_id !== null);
};

const getAllPaymentsService = async () => {
    return await Payment.find()
        .populate({
            path: "booking_id",
            populate: [
                { path: "farmer_id", select: "fullName email" },
                { path: "rentaler_id", select: "fullName email" },
            ],
        })
        .sort({ createdAt: -1 });
};

const getFailedPaymentsService = async (farmerId) => {
    return await Payment.find({
        farmer_id: farmerId,
        payment_status: "failed",
    })
        .populate({
            path: "booking_id",
            populate: {
                path: "equipment_id",
                select: "title images price_per_day",
            },
        })
        .sort({ createdAt: -1 });
};

const getPaymentStatisticsService = async () => {
    const totalPayments = await Payment.countDocuments();

    const successfulPayments = await Payment.countDocuments({
        payment_status: "paid",
    });

    const failedPayments = await Payment.countDocuments({
        payment_status: "failed",
    });

    const refundedPayments = await Payment.countDocuments({
        payment_status: "refunded",
    });

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
            },
        },
    ]);

    return {
        totalPayments,
        successfulPayments,
        failedPayments,
        refundedPayments,
        totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
    };
};


const getPaymentDashboardService = async () => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const totalRevenue = await Payment.aggregate([
        {
            $match: {
                payment_status: "paid",
            },
        },
        {
            $group: {
                _id: null,
                revenue: {
                    $sum: "$amount",
                },
            },
        },
    ]);


    const handleWebhookService = async (payload) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const event = payload.event;

        switch (event) {

            case "payment.captured": {

                const paymentEntity =
                    payload.payload.payment.entity;

                const payment =
                    await Payment.findOneAndUpdate(
                        {
                            razorpay_order_id:
                                paymentEntity.order_id,
                        },
                        {
                            razorpay_payment_id:
                                paymentEntity.id,

                            payment_status: "paid",

                            payment_date: new Date(),
                        },
                        {
                            new: true,
                            session,
                        }
                    );

                if (payment) {

                    const booking =
                        await Booking.findByIdAndUpdate(
                            payment.booking_id,
                            {
                                payment_status: "paid",
                                booking_status: "confirmed",
                            },
                            {
                                new: true,
                                session,
                            }
                        );

                    if (booking) {

                        await Equipment.findByIdAndUpdate(
                            booking.equipment_id,
                            {
                                status: "rented",
                            },
                            {
                                session,
                            }
                        );

                    }

                }

                break;
            }

            case "payment.failed": {

                const paymentEntity =
                    payload.payload.payment.entity;

                await Payment.findOneAndUpdate(
                    {
                        razorpay_order_id:
                            paymentEntity.order_id,
                    },
                    {
                        payment_status: "failed",
                    },
                    {
                        session,
                    }
                );

                break;
            }

            case "refund.processed": {

                const refundEntity =
                    payload.payload.refund.entity;

                await Payment.findOneAndUpdate(
                    {
                        razorpay_payment_id:
                            refundEntity.payment_id,
                    },
                    {
                        payment_status: "refunded",
                    },
                    {
                        session,
                    }
                );

                break;
            }

            default:
                break;

        }

        await session.commitTransaction();

        session.endSession();

        return true;

    } catch (error) {

        await session.abortTransaction();

        session.endSession();

        throw error;

    }

};
    const todayRevenue = await Payment.aggregate([
        {
            $match: {
                payment_status: "paid",
                createdAt: {
                    $gte: today,
                },
            },
        },
        {
            $group: {
                _id: null,
                revenue: {
                    $sum: "$amount",
                },
            },
        },
    ]);

    const monthRevenue = await Payment.aggregate([
        {
            $match: {
                payment_status: "paid",
                createdAt: {
                    $gte: monthStart,
                },
            },
        },
        {
            $group: {
                _id: null,
                revenue: {
                    $sum: "$amount",
                },
            },
        },
    ]);

    const recentPayments = await Payment.find()
        .populate("farmer_id", "fullName")
        .sort({ createdAt: -1 })
        .limit(10);

    return {

        totalRevenue:
            totalRevenue[0]?.revenue || 0,

        todayRevenue:
            todayRevenue[0]?.revenue || 0,

        monthRevenue:
            monthRevenue[0]?.revenue || 0,

        recentPayments,

    };

};

const verifyWebhookSignature = (body, signature) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(body))
        .digest("hex");

    return expectedSignature === signature;
};

const handleWebhookService = async (payload, signature) => {
    const verified = verifyWebhookSignature(payload, signature);

    if (!verified) {
        throw new Error("Invalid webhook signature.");
    }

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (event === "payment.captured" && paymentEntity) {
        const payment = await Payment.findOne({
            razorpay_order_id: paymentEntity.order_id,
        });

        if (payment && payment.payment_status !== "paid") {
            payment.payment_status = "paid";
            payment.razorpay_payment_id = paymentEntity.id;
            payment.paid_at = new Date();
            await payment.save();

            const booking = await Booking.findById(payment.booking_id);

            if (booking) {
                booking.payment_status = "paid";
                booking.booking_status = "confirmed";
                await booking.save();

                if (booking.equipment_id) {
                    await Equipment.findByIdAndUpdate(booking.equipment_id, {
                        status: "rented",
                    });
                }
            }
        }
    } else if (event === "payment.failed" && paymentEntity) {
        await Payment.findOneAndUpdate(
            { razorpay_order_id: paymentEntity.order_id },
            { payment_status: "failed" }
        );
    } else if (event === "refund.processed" && payload.payload?.refund?.entity) {
        const refundEntity = payload.payload.refund.entity;
        await Payment.findOneAndUpdate(
            { razorpay_payment_id: refundEntity.payment_id },
            { payment_status: "refunded" }
        );
    }

    return { received: true };
};

const getRentalerPaymentsService = async (rentalerId) => {
    const bookings = await Booking.find({ rentaler_id: rentalerId }).select("_id");
    const bookingIds = bookings.map((b) => b._id);

    return await Payment.find({ booking_id: { $in: bookingIds } })
        .populate({
            path: "booking_id",
            populate: [
                {
                    path: "equipment_id",
                    select: "title images price_per_day",
                },
                {
                    path: "farmer_id",
                    select: "fullName email phone",
                },
            ],
        })
        .sort({ createdAt: -1 });
};

const getRentalerPaymentStatsService = async (rentalerId) => {
    const bookings = await Booking.find({ rentaler_id: rentalerId }).select("_id");
    const bookingIds = bookings.map((b) => b._id);

    const payments = await Payment.find({ booking_id: { $in: bookingIds } });

    let totalEarnings = 0;
    let totalPayments = payments.length;
    let pendingPayments = 0;
    let refundedPayments = 0;

    payments.forEach((p) => {
        if (p.payment_status === "paid") {
            totalEarnings += p.payout_amount || 0;
        } else if (p.payment_status === "pending") {
            pendingPayments++;
        } else if (p.payment_status === "refunded") {
            refundedPayments++;
        }
    });

    return {
        totalEarnings,
        totalPayments,
        pendingPayments,
        refundedPayments,
    };
};

module.exports = {
    createPaymentOrder,
    verifyPaymentService,
    refundPaymentService,
    retryPaymentService,
    getPaymentByIdService,
    getPaymentHistoryService,
    getAllPaymentsService,
    getFailedPaymentsService,
    getPaymentStatisticsService,
    getPaymentDashboardService,
    handleWebhookService,

    // Rentaler
    getRentalerPaymentsService,
    getRentalerPaymentStatsService,
};
