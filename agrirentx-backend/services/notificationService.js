const Notification = require("../models/notification");

const createNotificationService = async (data) => {
    const notification = await Notification.create({
        receiver_id: data.receiver_id,
        title: data.title,
        message: data.message,
        type: data.type,
        reference_id: data.reference_id || null,
        is_read: false,
    });

    return notification;
};

const getUserNotificationsService = async (userId) => {
    return await Notification.find({
        receiver_id: userId,
    })
    .sort({
        createdAt: -1,
    });
};

const markNotificationAsReadService = async (
    notificationId,
    userId
) => {
    const notification =
        await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                receiver_id: userId,
            },
            {
                is_read: true,
                read_at: new Date(),
            },
            {
                new: true,
            }
        );

    if (!notification) {
        throw new Error(
            "Notification not found."
        );
    }

    return notification;
};

const markAllNotificationsAsReadService = async (
    userId
) => {
    await Notification.updateMany(
        {
            receiver_id: userId,
            is_read: false,
        },
        {
            is_read: true,
            read_at: new Date(),
        }
    );

    return true;
};

const deleteNotificationService = async (
    notificationId,
    userId
) => {
    const notification =
        await Notification.findOneAndDelete({
            _id: notificationId,
            receiver_id: userId,
        });

    if (!notification) {
        throw new Error(
            "Notification not found."
        );
    }

    return true;
};

const getNotificationStatisticsService = async (
    userId
) => {
    const total =
        await Notification.countDocuments({
            receiver_id: userId,
        });

    const unread =
        await Notification.countDocuments({
            receiver_id: userId,
            is_read: false,
        });

    const read =
        await Notification.countDocuments({
            receiver_id: userId,
            is_read: true,
        });

    return {
        total,
        read,
        unread,
    };
};

module.exports = {
    createNotificationService,
    getUserNotificationsService,
    markNotificationAsReadService,
    markAllNotificationsAsReadService,
    deleteNotificationService,
    getNotificationStatisticsService,
};
