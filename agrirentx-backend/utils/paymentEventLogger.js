const logger = require("./logger");

const paymentEventLogger = (paymentId, eventType, data = {}) => {
    logger.info(
        JSON.stringify({
            timestamp: new Date(),
            module: "PAYMENT",
            paymentId,
            eventType,
            data,
        })
    );
};

module.exports = paymentEventLogger;