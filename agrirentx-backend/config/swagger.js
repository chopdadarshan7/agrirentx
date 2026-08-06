const swaggerJsdoc = require("swagger-jsdoc");
const schemas = require("../docs/swaggerSchemas");

const options = {
    definition: {
        openapi: "3.0.3",

        info: {
            title: "AgriRentX API",
            version: "1.0.0",
            description: "REST API Documentation for AgriRentX Backend",
            contact: {
                name: "AgriRentX Team",
                email: "support@agrirentx.com",
            },
        },

        servers: [
            {
                url: "http://localhost:8000",
                description: "Local Server",
            },
        ],

        tags: [
            { name: "Authentication", description: "User Auth & Profile endpoints" },
            { name: "Users", description: "User management endpoints" },
            { name: "Categories", description: "Equipment categories" },
            { name: "Equipments", description: "Equipment listing & management" },
            { name: "Bookings", description: "Booking operations" },
            { name: "Payments", description: "Payment & refund management" },
            { name: "Reviews", description: "Review & rating system" },
            { name: "Notifications", description: "Notification system" },
            { name: "Admin", description: "Admin administrative panel" },
            { name: "Analytics", description: "Reports & analytics" },
        ],

        components: {
            schemas,

            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },

        security: [
            {
                bearerAuth: [],
            },
        ],
    },

    apis: [
        "./routes/*.js",
        "./controllers/*.js",
    ],
};

module.exports = swaggerJsdoc(options);
