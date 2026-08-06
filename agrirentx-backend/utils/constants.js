// Application Constants

module.exports = {
  // Booking statuses
  BOOKING_STATUS: {
    PENDING_PAYMENT: "pending_payment",
    CONFIRMED: "confirmed",
    ACTIVE: "active",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    REJECTED: "rejected",
  },

  // Payment statuses
  PAYMENT_STATUS: {
    CREATED: "created",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
  },

  // Equipment statuses
  EQUIPMENT_STATUS: {
    AVAILABLE: "available",
    RENTED: "rented",
    MAINTENANCE: "maintenance",
    INACTIVE: "inactive",
  },

  // Rentaler statuses
  RENTALER_STATUS: {
    NONE: "none",
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  },
};
