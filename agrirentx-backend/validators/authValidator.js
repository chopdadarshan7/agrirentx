const Joi = require("joi");

const registerValidator = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210)",
      "any.required": "Phone number is required",
    }),

  password: Joi.string()
    .min(6)
    .max(30)
    .required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
    }),

  role: Joi.string()
    .valid("farmer", "rentaler")
    .optional(),
});

const loginValidator = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .required(),
});

module.exports = {
  registerValidator,
  loginValidator,
};