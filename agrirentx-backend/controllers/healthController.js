const mongoose = require("mongoose");

const healthCheck = async (req, res) => {

    const health = {

        status: "UP",

        timestamp: new Date(),

        uptime: process.uptime(),

        database:
            mongoose.connection.readyState === 1
                ? "CONNECTED"
                : "DISCONNECTED",

        environment:
            process.env.NODE_ENV,

    };

    return res.status(200).json(health);

};

module.exports = {
    healthCheck,
};