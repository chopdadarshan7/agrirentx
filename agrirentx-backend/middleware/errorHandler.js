// =========================================
// Global Error Handler
// =========================================

const {
    errorResponse,
} = require("../utils/responseHandler");

const {
    HTTP_STATUS,
} = require("../constants");

const errorHandler = (
    err,
    req,
    res,
    next
) => {

    console.error(err);

    return errorResponse(

        res,

        err.message ||

        "Internal Server Error",

        err.statusCode ||

        HTTP_STATUS.INTERNAL_SERVER_ERROR

    );

};

module.exports = errorHandler;