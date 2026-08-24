const { body, validationResult } = require("express-validator");

const bookingValidationRules = [
  body("equipment_id")
    .notEmpty()
    .withMessage("Equipment ID is required.")
    .isMongoId()
    .withMessage("Invalid Equipment ID."),

  body("start_date")
    .notEmpty()
    .withMessage("Start date is required.")
    .isISO8601()
    .withMessage("Invalid start date."),

  body("end_date")
    .notEmpty()
    .withMessage("End date is required.")
    .isISO8601()
    .withMessage("Invalid end date."),

  body("contact_phone")
    .notEmpty()
    .withMessage("A contact number is required.")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit mobile number."),
];

const validateBooking = (req, res, next) => {
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
  bookingValidationRules,
  validateBooking,
};