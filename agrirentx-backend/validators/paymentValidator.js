const Joi = require("joi");
const { mongoId } = require("./commonValidator");

const createOrderSchema = Joi.object({
    booking_id: mongoId.optional(),
    bookingId: mongoId.optional(),
});

const verifyPaymentSchema = Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
});

const refundSchema = Joi.object({
    reason: Joi.string().optional(),
});

const createOrderValidationRules = (req, res, next) => {
    const { error } = createOrderSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};

const verifyPaymentValidationRules = (req, res, next) => {
    const { error } = verifyPaymentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};

const refundValidationRules = (req, res, next) => {
    const { error } = refundSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};

const validatePayment = (req, res, next) => {
    // Pass-through since specific rules are checked in individual middlewares
    next();
};

module.exports = {
    createOrderValidationRules,
    verifyPaymentValidationRules,
    refundValidationRules,
    validatePayment,
};