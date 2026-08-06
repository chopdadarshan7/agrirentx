const asyncHandler = require("../middleware/asyncHandler");

const {
    successResponse,
} = require("../utils/responseHandler");

const {
    createNotificationService,
    getUserNotificationsService,
    markNotificationAsReadService,
    markAllNotificationsAsReadService,
    deleteNotificationService,
    getNotificationStatisticsService,
} = require("../services/notificationService");

const createNotification = asyncHandler(async (req, res) => {
    const notification =
        await createNotificationService(req.body);

    return successResponse(
        res,
        201,
        "Notification created successfully.",
        notification
    );
});

const getUserNotifications = asyncHandler(async (req, res) => {
    const notifications =
        await getUserNotificationsService(
            req.user._id
        );

    return successResponse(
        res,
        200,
        "Notifications fetched successfully.",
        notifications
    );
});

const getNotificationById = asyncHandler(async (req, res) => {
    const Notification = require("../models/notification");
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: "Notification not found",
        });
    }

    if (notification.receiver_id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to view this notification",
        });
    }

    return successResponse(
        res,
        200,
        "Notification fetched successfully.",
        notification
    );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification =
        await markNotificationAsReadService(
            req.params.id,
            req.user._id
        );

    return successResponse(
        res,
        200,
        "Notification marked as read.",
        notification
    );
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await markAllNotificationsAsReadService(
        req.user._id
    );

    return successResponse(
        res,
        200,
        "All notifications marked as read."
    );
});

const deleteNotification = asyncHandler(async (req, res) => {
    await deleteNotificationService(
        req.params.id,
        req.user._id
    );

    return successResponse(
        res,
        200,
        "Notification deleted successfully."
    );
});

const getNotificationStatistics = asyncHandler(async (req, res) => {
    const statistics =
        await getNotificationStatisticsService(
            req.user._id
        );

    return successResponse(
        res,
        200,
        "Notification statistics fetched successfully.",
        statistics
    );
});

module.exports = {
    createNotification,
    getUserNotifications,
    getMyNotifications: getUserNotifications,
    getNotificationById,
    markNotificationAsRead,
    markAsRead: markNotificationAsRead,
    markAllNotificationsAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    deleteNotification,
    getNotificationStatistics,
};