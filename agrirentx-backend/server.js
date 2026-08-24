

require("dotenv").config();
const validateEnv = require("./utils/validateEnv");
validateEnv();
const logger = require("./utils/logger");

const http = require("http");
const compression = require("compression");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const { initializeSocket } = require("./config/socket");


const healthRoutes = require("./routes/healthRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const requestLogger = require("./middleware/requestLogger");
const requestId = require("./middleware/requestId");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const farmerRoutes = require("./routes/farmerRoutes");
const userRoutes = require("./routes/userRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const {
  apiLimiter,
} = require("./middleware/rateLimitMiddleware");
const { startBookingExpireSweeper } = require("./utils/bookingExpireCron");

const app = express();

connectDB().then(() => {
  // Start background sweeper for expired pending bookings (every 10 minutes)
  startBookingExpireSweeper();
});

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


app.use(express.json());
app.use(compression());
app.use(requestLogger);
app.use(requestId);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ==========================================
// Rate Limiting
// ==========================================

app.use("/api", apiLimiter);

// Health Route
app.use("/api/health", healthRoutes);
app.use("/api/dashboard", dashboardRoutes);


// ==========================================
// API Routes
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/admin", adminRoutes);

app.use(
    ["/api-docs", "/api/docs"],
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// ==========================================
// Global Error Middleware
// ==========================================

app.use(notFound);
app.use(errorHandler);

// ==========================================
// Server
// ==========================================

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
    logger.info(`Server running on Port ${PORT}`);
});

process.on("SIGINT", async () => {

    console.log("Shutting down server...");

    server.close(() => {

        console.log("Server Closed");

        process.exit(0);

    });

});