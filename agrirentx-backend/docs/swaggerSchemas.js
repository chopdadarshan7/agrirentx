const schemas = {
    User: {
        type: "object",
        properties: {
            _id: {
                type: "string",
            },
            fullName: {
                type: "string",
            },
            email: {
                type: "string",
            },
            phone: {
                type: "string",
            },
            role: {
                type: "string",
            },
        },
    },

    Category: {
        type: "object",
        properties: {
            _id: {
                type: "string",
            },
            name: {
                type: "string",
            },
            description: {
                type: "string",
            },
        },
    },

    Equipment: {
        type: "object",
        properties: {
            _id: {
                type: "string",
            },
            title: {
                type: "string",
            },
            price_per_day: {
                type: "number",
            },
            status: {
                type: "string",
            },
        },
    },

    Booking: {
        type: "object",
        properties: {
            _id: {
                type: "string",
            },
            booking_status: {
                type: "string",
            },
            total_amount: {
                type: "number",
            },
        },
    },

    Payment: {
        type: "object",
        properties: {
            _id: {
                type: "string",
            },
            amount: {
                type: "number",
            },
            payment_status: {
                type: "string",
            },
        },
    },

    Review: {
        type: "object",
        properties: {
            _id: {
                type: "string",
            },
            rating: {
                type: "number",
            },
            comment: {
                type: "string",
            },
        },
    },

    Notification: {
        type: "object",
        properties: {
            _id: {
                type: "string",
            },
            title: {
                type: "string",
            },
            message: {
                type: "string",
            },
            type: {
                type: "string",
            },
        },
    },

    SuccessResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
            },
            message: {
                type: "string",
            },
            data: {
                type: "object",
            },
        },
    },

    ErrorResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
            },
            message: {
                type: "string",
            },
        },
    },
};

module.exports = schemas;
