const express = require("express");

const router = express.Router();
const {
    createOrder,
    verifyPayment,
    getPaymentHistory,
    getPaymentStatistics,
    getPaymentById,
    getAllPayments,
    getFailedPayments,
    retryPayment,
    getPaymentDashboard,
    refundPayment,
    handleWebhook,

    // Rentaler
    getRentalerPayments,
    getRentalerPaymentStats,
} = require("../controllers/paymentController");

const { protect, isAdmin } = require("../middleware/authMiddleware");
const {
    createOrderValidationRules,
    verifyPaymentValidationRules,
    refundValidationRules,
    validatePayment,
} = require("../validators/paymentValidator");

// ===============================
// Create Razorpay Order
// ===============================
/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     summary: Create Razorpay Order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *             properties:
 *               booking_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Razorpay Order Created
 *       400:
 *         description: Invalid Request
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/create-order",
    protect,
    createOrderValidationRules,
    validatePayment,
    createOrder
);

// ===============================
// Verify Payment
// ===============================
/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify Razorpay Payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment Verified
 */
router.post(
    "/verify",
    protect,
    verifyPaymentValidationRules,
    validatePayment,
    verifyPayment
);

// ===============================
// Payment History
// ===============================
/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Payment History
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment History
 */
router.get(
    "/history",
    protect,
    getPaymentHistory
);

// ===============================
// Get Payment Statistics (Admin)
// ===============================
/**
 * @swagger
 * /api/payments/statistics:
 *   get:
 *     summary: Payment Statistics
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics
 */
router.get(
    "/statistics",
    protect,
    getPaymentStatistics
);

// ===============================
// Get Payment Dashboard (Admin)
// ===============================
/**
 * @swagger
 * /api/payments/dashboard:
 *   get:
 *     summary: Payment Dashboard
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard
 */
router.get(
    "/dashboard",
    protect,
    isAdmin,
    getPaymentDashboard
);

// ===============================
// Get Failed Payments
// ===============================
router.get(
    "/failed",
    protect,
    getFailedPayments
);

// ===============================
// Retry Failed Payment
// ===============================
/**
 * @swagger
 * /api/payments/retry/{id}:
 *   post:
 *     summary: Retry Failed Payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Retry Payment
 */
router.post(
    "/retry/:id",
    protect,
    retryPayment
);

// ===============================
// Admin - Get All Payments
// ===============================
router.get(
    "/",
    protect,
    isAdmin,
    getAllPayments
);


// ===============================
// Rentaler - Payment History
// ===============================
router.get(
    "/rentaler",
    protect,
    getRentalerPayments
);


// ===============================
// Rentaler - Payment Statistics
// ===============================
router.get(
    "/rentaler/stats",
    protect,
    getRentalerPaymentStats
);


// ===============================
// Get Payment By ID
// ===============================
router.get(
    "/:id",
    protect,
    getPaymentById
);

// ===============================
// Refund Payment
// ===============================
/**
 * @swagger
 * /api/payments/refund/{id}:
 *   post:
 *     summary: Refund Payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment Refunded
 */
router.post(
    "/refund/:id",
    protect,
    isAdmin,
    refundValidationRules,
    validatePayment,
    refundPayment
);

// ===============================
// Razorpay Webhook
// ===============================
/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Razorpay Webhook
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook Processed
 */
router.post(
    "/webhook",
    handleWebhook
);

module.exports = router;