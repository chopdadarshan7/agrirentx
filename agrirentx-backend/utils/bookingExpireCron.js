const Booking = require("../models/booking");
const Equipment = require("../models/equipment");
const Notification = require("../models/notification");
const logger = require("./logger");

/**
 * Sweeps and cancels pending_payment bookings that have been abandoned for > 30 minutes.
 */
const sweepExpiredBookings = async () => {
  try {
    const expirationLimit = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

    // Find all bookings that are still pending_payment and were created before the limit
    const expiredBookings = await Booking.find({
      booking_status: "pending_payment",
      createdAt: { $lt: expirationLimit },
    });

    if (expiredBookings.length === 0) {
      return;
    }

    logger.info(`[Sweeper] Found ${expiredBookings.length} expired pending_payment bookings.`);

    for (const booking of expiredBookings) {
      booking.booking_status = "cancelled";
      booking.cancellation_reason = "Payment window expired (30 minutes timeout)";
      booking.cancelled_at = new Date();
      await booking.save();

      // Ensure the equipment is marked as available
      await Equipment.findByIdAndUpdate(booking.equipment_id, {
        status: "available",
      });

      // Notify the farmer that their booking expired
      await Notification.create({
        receiver_id: booking.farmer_id,
        title: "Booking Expired",
        message: "Your booking request expired due to non-payment within 30 minutes.",
        type: "booking",
      });

      // Notify the rentaler as well
      await Notification.create({
        receiver_id: booking.rentaler_id,
        title: "Booking Expired",
        message: "A booking request for your equipment expired due to non-payment.",
        type: "booking",
      });

      logger.info(`[Sweeper] Cancelled booking ${booking._id} due to payment timeout.`);
    }
  } catch (error) {
    logger.error("[Sweeper] Error running booking expiration sweep:", error);
  }
};

/**
 * Starts the sweeper job to run at a regular interval.
 * @param {number} intervalMs - Interval in milliseconds (default: 10 minutes)
 */
const startBookingExpireSweeper = (intervalMs = 10 * 60 * 1000) => {
  logger.info(`[Sweeper] Starting booking expiration sweeper. Interval: ${intervalMs / (60 * 1000)} minutes.`);
  // Run once immediately on start
  sweepExpiredBookings();
  
  // Set up the interval
  setInterval(sweepExpiredBookings, intervalMs);
};

module.exports = {
  sweepExpiredBookings,
  startBookingExpireSweeper,
};
