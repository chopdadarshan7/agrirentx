const logger = require("./logger");

const auditLog = (
    action,
    userId,
    resource,
    resourceId,
    metadata = {}
) => {
    logger.info(
        JSON.stringify({
            timestamp: new Date(),
            action,
            userId,
            resource,
            resourceId,
            metadata,
        })
    );
};

module.exports = auditLog;