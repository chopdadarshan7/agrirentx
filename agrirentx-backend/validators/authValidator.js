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
});

const loginValidator = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .required(),
});

const updateProfileValidator = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(100),

  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .messages({
      "string.pattern.base": "Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210)",
    }),

  address: Joi.string().trim().max(200).allow(""),
  city: Joi.string().trim().max(100).allow(""),
  state: Joi.string().trim().max(100).allow(""),
  pincode: Joi.string().trim().max(10).allow(""),
});

const upgradeToRentalerValidator = Joi.object({
  account_holder: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.min": "Enter the account holder's name.",
      "any.required": "Account holder name is required.",
    }),

  account_number: Joi.string()
    .trim()
    .pattern(/^\d{9,18}$/)
    .required()
    .messages({
      "string.pattern.base": "Enter a valid account number (9-18 digits).",
      "any.required": "Account number is required.",
    }),

  ifsc_code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Enter a valid IFSC code (e.g. HDFC0001234).",
      "any.required": "IFSC code is required.",
    }),

  bank_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.min": "Enter the bank name.",
      "any.required": "Bank name is required.",
    }),
});

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  upgradeToRentalerValidator,
};