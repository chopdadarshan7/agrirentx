const {
    errorResponse,
} = require("../utils/responseHandler");

const {
    HTTP_STATUS,
} = require("../constants");

const notFound = (req, res) => {

    return errorResponse(

        res,

        `Route ${req.originalUrl} not found`,

        HTTP_STATUS.NOT_FOUND

    );

};

module.exports = notFound;
