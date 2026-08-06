const { body, validationResult } = require("express-validator");

const equipmentValidationRules = [
    body("category_id")
        .notEmpty()
        .withMessage("Category is required.")
        .isMongoId()
        .withMessage("Invalid category ID."),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Equipment title is required.")
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be between 3 and 100 characters."),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required.")
        .isLength({ min: 20, max: 2000 })
        .withMessage("Description must be between 20 and 2000 characters."),

    body("price_per_day")
        .notEmpty()
        .withMessage("Price per day is required.")
        .isFloat({ min: 0 })
        .withMessage("Price per day must be greater than or equal to 0."),

    body("security_deposit")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Security deposit cannot be negative."),

    body("location.address")
        .notEmpty()
        .withMessage("Address is required."),

    body("location.latitude")
        .notEmpty()
        .withMessage("Latitude is required.")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude."),

    body("location.longitude")
        .notEmpty()
        .withMessage("Longitude is required.")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude."),
];

const validateEquipment = (req, res, next) => {
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
    equipmentValidationRules,
    validateEquipment,
};