const express = require("express");

const router = express.Router();

const {
    createBooking,
    getMyBookings,
    getRentalerBookings,
    getBookingById,
    approveBooking,
    rejectBooking,
    cancelBooking,
    completeBooking,
} = require("../controllers/bookingController");

const {
    bookingValidationRules,
    validateBooking,
} = require("../validators/bookingValidator");

const {
    protect,
    isApprovedRentaler,
} = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| Farmer Routes
|--------------------------------------------------------------------------
*/

// Create Booking
/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create Booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Booking Created
 */
router.post(
    "/",
    protect,
    ...bookingValidationRules,
    validateBooking,
    createBooking
);

// Get My Bookings (Farmer)
/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get My Bookings
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My Bookings
 */
router.get(
    "/my-bookings",
    protect,
    getMyBookings
);

// Get Rentaler's Bookings
/**
 * @swagger
 * /api/bookings/rentaler-bookings:
 *   get:
 *     summary: Rentaler Bookings
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rentaler Bookings
 */
router.get(
    "/rentaler-bookings",
    protect,
    isApprovedRentaler,
    getRentalerBookings
);

// Get Booking By ID
/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get Booking By ID
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking Details
 */
router.get(
    "/:id",
    protect,
    getBookingById || getMyBookings
);

// Approve Booking
/**
 * @swagger
 * /api/bookings/{id}/approve:
 *   put:
 *     summary: Approve Booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking Approved
 */
router.put(
    "/:id/approve",
    protect,
    isApprovedRentaler,
    approveBooking
);
router.patch(
    "/:id/approve",
    protect,
    isApprovedRentaler,
    approveBooking
);

// Reject Booking
/**
 * @swagger
 * /api/bookings/{id}/reject:
 *   put:
 *     summary: Reject Booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking Rejected
 */
router.put(
    "/:id/reject",
    protect,
    isApprovedRentaler,
    rejectBooking
);
router.patch(
    "/:id/reject",
    protect,
    isApprovedRentaler,
    rejectBooking
);

// Cancel Booking
/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel Booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking Cancelled
 */
router.put(
    "/:id/cancel",
    protect,
    cancelBooking
);
router.patch(
    "/:id/cancel",
    protect,
    cancelBooking
);

// Complete Booking
/**
 * @swagger
 * /api/bookings/{id}/complete:
 *   put:
 *     summary: Complete Booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking Completed
 */
router.put(
    "/:id/complete",
    protect,
    isApprovedRentaler,
    completeBooking
);
router.patch(
    "/:id/complete",
    protect,
    isApprovedRentaler,
    completeBooking
);

module.exports = router;