const logger = require("../utils/logger");

let io;

const userSockets = new Map();

const initializeSocket = (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        logger.info(`Socket Connected: ${socket.id}`);

        socket.on("register", (userId) => {
            if (userId) {
                userSockets.set(userId.toString(), socket.id);
            }
        });

        socket.on("disconnect", () => {
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });
};

const getIO = () => io;

const getUserSocket = (userId) =>
    userId ? userSockets.get(userId.toString()) : undefined;

module.exports = {
    initializeSocket,
    getIO,
    getUserSocket,
};
