const { body, validationResult } = require("express-validator");

const notificationValidationRules = [
    body("receiver_id")
        .notEmpty()
        .withMessage("Receiver ID is required."),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required.")
        .isLength({ max: 150 })
        .withMessage("Title cannot exceed 150 characters."),

    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required.")
        .isLength({ max: 1000 })
        .withMessage("Message cannot exceed 1000 characters."),

    body("type")
        .isIn([
            "booking",
            "payment",
            "review",
            "system",
            "promotion",
        ])
        .withMessage("Invalid notification type."),
];

const validateNotification = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }

    next();
};

module.exports = {
    notificationValidationRules,
    validateNotification,
};