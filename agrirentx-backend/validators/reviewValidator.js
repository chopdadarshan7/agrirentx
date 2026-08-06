const { body, validationResult } = require("express-validator");

const reviewValidationRules = [
    body("booking_id")
        .notEmpty()
        .withMessage("Booking ID is required."),

    body("equipment_id")
        .notEmpty()
        .withMessage("Equipment ID is required."),

    body("rentaler_id")
        .notEmpty()
        .withMessage("Rentaler ID is required."),

    body("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5."),

    body("review")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Review cannot exceed 1000 characters.")
];

const validateReview = (req, res, next) => {
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
    reviewValidationRules,
    validateReview,
};