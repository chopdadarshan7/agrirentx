/**
 * Success Response
 */
const successResponse = (
    res,
    arg2 = 200,
    arg3 = "Success",
    arg4 = null
) => {
    let statusCode = 200;
    let message = "Success";
    let data = null;

    if (typeof arg2 === "number") {
        statusCode = arg2;
        message = typeof arg3 === "string" ? arg3 : "Success";
        data = arg4 !== undefined ? arg4 : (typeof arg3 !== "string" ? arg3 : null);
    } else if (typeof arg2 === "string") {
        message = arg2;
        data = arg3 !== undefined ? arg3 : null;
        statusCode = typeof arg4 === "number" ? arg4 : 200;
    }

    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Error Response
 */
const errorResponse = (
    res,
    arg2 = 500,
    arg3 = "Something went wrong"
) => {
    let statusCode = 500;
    let message = "Something went wrong";

    if (typeof arg2 === "number") {
        statusCode = arg2;
        message = typeof arg3 === "string" ? arg3 : "Something went wrong";
    } else if (typeof arg2 === "string") {
        message = arg2;
        statusCode = typeof arg3 === "number" ? arg3 : 500;
    }

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = {
    successResponse,
    errorResponse,
};