const logger = require("./logger");

const requiredEnv = [
    "PORT",
    "MONGO_URI",

    "JWT_SECRET",
    "JWT_REFRESH_SECRET",

    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",

    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
];

const validateEnv = () => {

    const missing = requiredEnv.filter(
        (key) => !process.env[key]
    );

    if (missing.length) {

        logger.error(
            `Missing Environment Variables: ${missing.join(", ")}`
        );

        process.exit(1);
    }

    logger.info("Environment Variables Loaded Successfully");
};

module.exports = validateEnv;
