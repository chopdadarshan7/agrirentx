const mongoose = require("mongoose");
const crypto = require("crypto");

const razorpay = require("../config/razorpay");

const Booking = require("../models/booking");

const Payment = require("../models/payment");

const Equipment = require("../models/equipment");

const Notification = require("../models/notification");

const {
    sendPaymentSuccessEmail,
    sendPaymentRefundEmail,
} = require("../services/emailService");

const {
    sendPaymentSMS,
} = require("../services/smsService");

const logger = require("../utils/logger");
const {
    successResponse,
    errorResponse,
} = require("../utils/responseHandler");
const {
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

    // Rentaler
    getRentalerPaymentsService,
    getRentalerPaymentStatsService,
} = require("../services/paymentService");
// ===============================
// Create Razorpay Order
// ===============================
exports.createOrder = async (req, res) => {
  try {
    const bookingId = req.body.bookingId || req.body.booking_id;
    const data = await createPaymentOrder(bookingId);

    return successResponse(
      res,
      201,
      "Razorpay order created successfully.",
      data
    );
  } catch (error) {
    logger.error(error);

    if (error.message === "Booking not found.") {
      return errorResponse(res, 404, error.message);
    }
    if (error.message === "Payment already completed.") {
      return errorResponse(res, 400, error.message);
    }

    return errorResponse(
      res,
      500,
      error.message || "Internal Server Error"
    );
  }
};

// ===============================
// Verify Razorpay Payment
// ===============================
exports.verifyPayment = async (req, res) => {
  try {
    const payment = await verifyPaymentService(req.body);

    return successResponse(
      res,
      200,
      "Payment verified successfully.",
      payment
    );
  } catch (error) {
    logger.error(error);

    if (error.message === "Payment verification failed.") {
      return errorResponse(res, 400, error.message);
    }
    if (error.message === "Payment not found.") {
      return errorResponse(res, 404, error.message);
    }

    return errorResponse(
      res,
      500,
      error.message || "Internal Server Error"
    );
  }
};

// ===============================
// Get Payment History
// ===============================
exports.getPaymentHistory = async (req, res) => {
  try {
    const paymentHistory = await getPaymentHistoryService(req.user._id);

    return res.status(200).json({
      success: true,
      count: paymentHistory.length,
      data: paymentHistory,
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

// ===============================
// Get Payment By ID
// ===============================
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await getPaymentByIdService(req.params.id);

    const ownerIds = [
      payment.booking_id?.farmer_id?._id,
      payment.booking_id?.rentaler_id?._id,
    ];
    const isOwner = ownerIds.some(
      (id) => id && id.toString() === req.user._id.toString()
    );

    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this payment.",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error(error);

    if (error.message === "Payment not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ===============================
// Get All Payments (Admin)
// ===============================
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await getAllPaymentsService();

    return successResponse(
      res,
      200,
      "Payments fetched successfully.",
      payments
    );
  } catch (error) {
    logger.error(error);

    return errorResponse(
      res,
      500,
      error.message || "Internal Server Error"
    );
  }
};

// ===============================
// Get Payment Statistics (Admin)
// ===============================
exports.getPaymentStatistics = async (req, res) => {
  try {
    const statistics = await getPaymentStatisticsService();

    return successResponse(
      res,
      200,
      "Payment statistics fetched successfully.",
      statistics
    );
  } catch (error) {
    logger.error(error);

    return errorResponse(
      res,
      500,
      error.message || "Internal Server Error"
    );
  }
};

// ===============================
// Refund Payment
// ===============================
exports.refundPayment = async (req, res) => {
  try {
    const refund = await refundPaymentService(req.params.id);

    return successResponse(
      res,
      200,
      "Payment refunded successfully.",
      refund
    );
  } catch (error) {
    logger.error(error);

    if (error.message === "Payment not found.") {
      return errorResponse(res, 404, error.message);
    }
    if (error.message === "Only paid transactions can be refunded.") {
      return errorResponse(res, 400, error.message);
    }

    return errorResponse(
      res,
      500,
      error.message || "Internal Server Error"
    );
  }
};

// ===============================
// Get Failed Payments
// ===============================
exports.getFailedPayments = async (req, res) => {
  try {
    const payments = await getFailedPaymentsService(req.user._id);

    return successResponse(
      res,
      200,
      "Failed payments fetched successfully.",
      payments
    );
  } catch (error) {
    logger.error(error);

    return errorResponse(
      res,
      500,
      error.message || "Internal Server Error"
    );
  }
};

// ===============================
// Retry Failed Payment
// ===============================
exports.retryPayment = async (req, res) => {
  try {
    const data = await retryPaymentService(req.params.id);

    return successResponse(
      res,
      200,
      "Retry payment order created successfully.",
      data
    );
  } catch (error) {
    logger.error(error);

    if (
      error.message === "Payment not found." ||
      error.message === "Booking not found."
    ) {
      return errorResponse(res, 404, error.message);
    }
    if (error.message === "Only failed payments can be retried.") {
      return errorResponse(res, 400, error.message);
    }

    return errorResponse(
      res,
      500,
      error.message || "Internal Server Error"
    );
  }
};

// ===============================
// Get Payment Dashboard (Admin)
// ===============================
exports.getPaymentDashboard = async (req, res) => {
  try {
    const dashboard = await getPaymentDashboardService();

    return successResponse(
      res,
      200,
      "Payment dashboard fetched successfully.",
      dashboard
    );
  } catch (error) {
    logger.error(error);

    return errorResponse(
      res,
      500,
      error.message || "Internal Server Error"
    );
  }
};

// ===============================
// Get Rentaler Payments
// ===============================
exports.getRentalerPayments = async (req, res) => {
    try {
        const payments =
            await getRentalerPaymentsService(
                req.user._id
            );

        return successResponse(
            res,
            200,
            "Rentaler payments fetched successfully.",
            payments
        );
    } catch (error) {
        logger.error(error);

        return errorResponse(
            res,
            500,
            error.message ||
                "Failed to fetch rentaler payments."
        );
    }
};


// ===============================
// Get Rentaler Payment Statistics
// ===============================
exports.getRentalerPaymentStats = async (req, res) => {
    try {
        const statistics =
            await getRentalerPaymentStatsService(
                req.user._id
            );

        return successResponse(
            res,
            200,
            "Rentaler payment statistics fetched successfully.",
            statistics
        );
    } catch (error) {
        logger.error(error);

        return errorResponse(
            res,
            500,
            error.message ||
                "Failed to fetch rentaler payment statistics."
        );
    }
};

// ===============================
// Handle Razorpay Webhook
// ===============================
exports.handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    if (event === "payment.captured" && paymentEntity) {
      const payment = await Payment.findOne({
        razorpay_order_id: paymentEntity.order_id,
      });

      if (payment && payment.payment_status !== "paid") {
        const { PAYMENT_STATUS } = require("../constants");

        payment.payment_status = PAYMENT_STATUS.PAID;
        payment.razorpay_payment_id = paymentEntity.id;
        payment.paid_at = new Date();
        await payment.save();

        const booking = await Booking.findById(payment.booking_id);

        if (booking) {
          booking.payment_status = "paid";
          booking.booking_status = "confirmed";
          await booking.save();

          const equipment = await Equipment.findById(booking.equipment_id);

          if (equipment) {
            equipment.status = "rented";
            await equipment.save();
          }

          await Notification.create({
            receiver_id: booking.farmer_id,
            title: "Payment Successful",
            message: "Your payment has been received successfully.",
            type: "payment",
          });

          await Notification.create({
            receiver_id: booking.rentaler_id,
            title: "Payment Received",
            message: "A payment has been received for your equipment booking.",
            type: "payment",
          });
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};