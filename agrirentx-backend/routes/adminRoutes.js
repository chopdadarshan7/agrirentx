const express = require("express");

const router = express.Router();

const {
    getDashboard,
    getDashboardStatistics,
    getAllUsers,
    getUserById,
    updateUserStatus,
    blockUnblockUser,
    unblockUser,
    deleteUser,
    approveRentaler,
    rejectRentaler,
    suspendRentaler,
    reactivateRentaler,
    getPendingRentalers,
    getApprovedRentalers,
    getPendingEquipments,
    getApprovedEquipments,
    getAllEquipments,
    approveEquipment,
    rejectEquipment,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    getAllPayments,
    getPaymentById,
    updatePaymentStatus,
    paymentStatistics,
    refundPayment,
    getAllReviews,
    getReviewById,
    hideReview,
    restoreReview,
    deleteReview,
    getAllNotifications,
    getNotificationById,
    markNotificationAsRead,
    deleteNotification,
    broadcastNotification,
    notificationStatistics,
    getAnalytics,
    getReports,
    getRevenueAnalytics,
    getBookingAnalytics,
    getUserAnalytics,
    getEquipmentAnalytics,
    getAdminAnalyticsDashboard,
} = require("../controllers/adminController");

const { protect, isAdmin } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Middleware shorthand
const auth = [protect, isAdmin || adminOnly];

// ===============================
// Dashboard
// ===============================
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Admin Dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard Data
 */
router.get(
    "/dashboard",
    protect,
    isAdmin,
    getDashboardStatistics || getDashboard
);

// ===============================
// User Management
// ===============================
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get All Users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User List
 */
router.get("/users", protect, isAdmin, getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get User By ID
 *     operationId: admin_getUserById
 *     tags:
 *       - Admin
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
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get("/users/:id", protect, isAdmin, getUserById);

// Update User Status
/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update User Status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: User status updated successfully
 */
router.put("/users/:id/status", protect, isAdmin, updateUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   put:
 *     summary: Block / Unblock User (Toggle)
 *     operationId: blockUnblockUser
 *     tags:
 *       - Admin
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
 *         description: User blocked or unblocked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put("/users/:id/block", ...auth, blockUnblockUser);

/**
 * @swagger
 * /api/admin/users/{id}/unblock:
 *   put:
 *     summary: Unblock User (Explicit)
 *     operationId: unblockUser
 *     tags:
 *       - Admin
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
 *         description: User unblocked successfully
 *       400:
 *         description: User is not blocked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put("/users/:id/unblock", ...auth, unblockUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete User
 *     operationId: admin_deleteUser
 *     tags:
 *       - Admin
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
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", protect, isAdmin, deleteUser);

// ===============================
// Rentaler Management
// ===============================
router.get(
    "/rentalers/pending",
    protect,
    isAdmin,
    getPendingRentalers
);

router.get(
    "/rentalers/approved",
    protect,
    isAdmin,
    getApprovedRentalers
);

router.put(
    "/rentalers/:id/approve",
    protect,
    isAdmin,
    approveRentaler
);

router.put(
    "/rentalers/:id/reject",
    protect,
    isAdmin,
    rejectRentaler
);

router.put(
    "/rentalers/:id/suspend",
    protect,
    isAdmin,
    suspendRentaler
);

router.put(
    "/rentalers/:id/reactivate",
    protect,
    isAdmin,
    reactivateRentaler
);

/**
 * @swagger
 * /api/admin/users/{id}/approve-rentaler:
 *   put:
 *     summary: Approve Rentaler Application
 *     operationId: approveRentaler
 *     tags:
 *       - Admin
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
 *         description: Rentaler approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put("/users/:id/approve-rentaler", ...auth, approveRentaler);

/**
 * @swagger
 * /api/admin/users/{id}/reject-rentaler:
 *   put:
 *     summary: Reject Rentaler Application
 *     operationId: rejectRentaler
 *     tags:
 *       - Admin
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
 *         description: Rentaler rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put("/users/:id/reject-rentaler", ...auth, rejectRentaler);

/**
 * @swagger
 * /api/admin/kyc/{id}:
 *   put:
 *     summary: Approve / Reject KYC
 *     tags: [Admin]
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
 *         description: KYC Updated
 */
router.put("/kyc/:id", ...auth, approveRentaler);

// ===============================
// Equipment Management
// NOTE: /pending and base list before /:id to avoid param conflict
// ===============================
/**
 * @swagger
 * /api/admin/equipments/pending:
 *   get:
 *     summary: Get Pending Equipments
 *     operationId: getPendingEquipments
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending equipment
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/equipments/pending", protect, isAdmin, getPendingEquipments);
router.get("/equipments/approved", protect, isAdmin, getApprovedEquipments);
router.get("/equipments", protect, isAdmin, getAllEquipments);
router.put("/equipments/:id/approve", protect, isAdmin, approveEquipment);
router.put("/equipments/:id/reject", protect, isAdmin, rejectEquipment);

// ===============================
// Booking Management
// ===============================
router.get("/bookings", protect, isAdmin, getAllBookings);
router.get("/bookings/:id", protect, isAdmin, getBookingById);
router.put("/bookings/:id/status", protect, isAdmin, updateBookingStatus);
router.put("/bookings/:id/cancel", protect, isAdmin, cancelBooking);
router.delete("/bookings/:id", protect, isAdmin, cancelBooking);

// ===============================
// Payment Management
// ===============================
router.get("/payments", protect, isAdmin, getAllPayments);
router.get("/payments/statistics", protect, isAdmin, paymentStatistics);
router.get("/payments/:id", protect, isAdmin, getPaymentById);
router.put("/payments/:id/status", protect, isAdmin, updatePaymentStatus);
router.put("/payments/:id/refund", protect, isAdmin, refundPayment);

// ===============================
// Review Moderation
// ===============================
router.get("/reviews", protect, isAdmin, getAllReviews);
router.get("/reviews/:id", protect, isAdmin, getReviewById);
router.put("/reviews/:id/hide", protect, isAdmin, hideReview);
router.put("/reviews/:id/restore", protect, isAdmin, restoreReview);
router.delete("/reviews/:id", protect, isAdmin, deleteReview);

// Notification Management
// ===============================
router.post("/notifications/broadcast", protect, isAdmin, broadcastNotification);
router.get("/notifications", protect, isAdmin, getAllNotifications);
router.get("/notifications/statistics", protect, isAdmin, notificationStatistics);
router.get("/notifications/:id", protect, isAdmin, getNotificationById);
router.put("/notifications/:id/read", protect, isAdmin, markNotificationAsRead);
router.delete("/notifications/:id", protect, isAdmin, deleteNotification);

// ===============================
// Analytics & Reports
// ===============================
router.get("/analytics/revenue", protect, isAdmin, getRevenueAnalytics);
router.get("/analytics/bookings", protect, isAdmin, getBookingAnalytics);
router.get("/analytics/users", protect, isAdmin, getUserAnalytics);
router.get("/analytics/equipments", protect, isAdmin, getEquipmentAnalytics);
router.get("/analytics/dashboard", protect, isAdmin, getAdminAnalyticsDashboard);

// ===============================
// Reports
// ===============================
/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Generate Reports
 *     operationId: getReports
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Returns a full report of bookings, payments, and summary statistics.
 *       Supports optional date range filtering via `from` and `to` query params (ISO 8601).
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (e.g. 2025-01-01)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (e.g. 2025-12-31)
 *     responses:
 *       200:
 *         description: Reports generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/reports", ...auth, getReports);

module.exports = router;