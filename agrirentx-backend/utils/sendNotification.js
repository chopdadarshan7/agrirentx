const {
    createNotificationService,
} = require("../services/notificationService");

const {
    getIO,
    getUserSocket,
} = require("../config/socket");

const sendNotification = async ({
    receiver_id,
    title,
    message,
    type,
    reference_id = null,
}) => {
    const notification = await createNotificationService({
        receiver_id,
        title,
        message,
        type,
        reference_id,
    });

    const socketId = getUserSocket(receiver_id);

    if (socketId && getIO()) {
        getIO().to(socketId).emit(
            "new_notification",
            notification
        );
    }

    return notification;
};

module.exports = sendNotification;
