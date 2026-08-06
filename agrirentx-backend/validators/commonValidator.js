const Joi = require("joi");

const mongoId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

module.exports = {
    mongoId,
};