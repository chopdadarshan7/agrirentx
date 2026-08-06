const { body, validationResult } = require("express-validator");

/**
 * Allowed specification field types
 */
const ALLOWED_TYPES = [
  "text",
  "number",
  "select",
  "boolean",
  "date",
  "textarea",
];

/**
 * Validation rules for creating/updating a category
 */
const categoryValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Category name must be between 3 and 50 characters."),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug must contain only lowercase letters, numbers, and hyphens."
    ),

  body("specTemplate")
    .optional()
    .isArray()
    .withMessage("specTemplate must be an array."),

  body("specTemplate.*.label")
    .if(body("specTemplate").exists())
    .notEmpty()
    .withMessage("Each specification must have a label."),

  body("specTemplate.*.key")
    .if(body("specTemplate").exists())
    .notEmpty()
    .withMessage("Each specification must have a key."),

  body("specTemplate.*.type")
    .if(body("specTemplate").exists())
    .isIn(ALLOWED_TYPES)
    .withMessage(
      `Field type must be one of: ${ALLOWED_TYPES.join(", ")}`
    ),

  body("specTemplate.*.required")
    .optional()
    .isBoolean()
    .withMessage("required must be true or false."),

  body("specTemplate.*.options")
    .optional()
    .isArray()
    .withMessage("options must be an array."),
];

/**
 * Handles validation errors
 */
const validateCategory = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array(),
    });
  }

  next();
};

module.exports = {
  categoryValidationRules,
  validateCategory,
};