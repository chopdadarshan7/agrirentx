const express = require("express");

const router = express.Router();

const {
    protect,
} = require("../middleware/authMiddleware");

const {
    notificationValidationRules,
    validateNotification,
} = require("../validators/notificationValidator");

const {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getNotificationStatistics,
} = require("../controllers/notificationController");

// ===============================
// Create Notification
// ===============================
/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create Notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Notification Created
 */
router.post(
    "/",
    protect,
    notificationValidationRules,
    validateNotification,
    createNotification
);

// ===============================
// Get Logged-in User Notifications
// ===============================
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get Notifications
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification List
 */
router.get(
    "/",
    protect,
    getUserNotifications
);

// ===============================
// Notification Statistics
// ===============================
/**
 * @swagger
 * /api/notifications/statistics:
 *   get:
 *     summary: Notification Statistics
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification Statistics
 */
router.get(
    "/statistics",
    protect,
    getNotificationStatistics
);

// ===============================
// Mark All Notifications as Read
// ===============================
router.patch(
    "/read-all",
    protect,
    markAllNotificationsAsRead
);
router.put(
    "/read-all",
    protect,
    markAllNotificationsAsRead
);

// ===============================
// Mark Notification as Read
// ===============================
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark Notification Read
 *     tags: [Notification]
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
 *         description: Notification Updated
 */
router.patch(
    "/:id/read",
    protect,
    markNotificationAsRead
);
router.put(
    "/:id/read",
    protect,
    markNotificationAsRead
);

// ===============================
// Delete Notification
// ===============================
/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete Notification
 *     tags: [Notification]
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
 *         description: Notification Deleted
 */
router.delete(
    "/:id",
    protect,
    deleteNotification
);

module.exports = router;