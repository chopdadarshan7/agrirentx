const Booking = require("../models/booking");
const Availability = require("../models/availability");
const Equipment = require("../models/equipment");
const { BOOKING_STATUS } = require("../constants");
const Notification = require("../models/notification");
const User = require("../models/user");
const sendNotification = require("../utils/sendNotification");
const {
    sendBookingCreatedEmail,
    sendBookingConfirmedEmail,
    sendBookingCancelledEmail,
    sendEmail,
} = require("../services/emailService");
const { bookingEmail } = require("../utils/emailTemplates");

const {
    sendBookingSMS,
} = require("../services/smsService");

/**
 * Helper to check if a booking can be cancelled
 */
const canCancel = (booking) => {
  if (booking.booking_status === "pending_payment") return true;
  if (booking.booking_status === "confirmed") {
    const cancelWindow = parseFloat(process.env.CANCELLATION_WINDOW_HOURS) || 2;
    const hoursSinceCreation = (Date.now() - new Date(booking.createdAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation <= cancelWindow && new Date(booking.start_date) > new Date();
  }
  return false;
};

/**
 * Create Booking
 */
const createBooking = async (req, res) => {
  try {
    const {
      equipment_id,
      start_date,
      end_date,
    } = req.body;

    const equipment = await Equipment.findById(equipment_id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found.",
      });
    }

    // Check if equipment is approved and available
    if (
      equipment.approval_status !== "approved" ||
      equipment.status !== "available"
    ) {
      return res.status(400).json({
        success: false,
        message: "Equipment is not available for booking.",
      });
    }

    // Prevent booking own equipment
    if (equipment.rentaler_id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own equipment.",
      });
    }

    // Check overlapping bookings
    const start = new Date(start_date);
    const end = new Date(end_date);

    const existingBooking = await Booking.findOne({
      equipment_id,
      booking_status: {
        $in: ["pending_payment", "confirmed", "active"],
      },
      $or: [
        {
          start_date: { $lte: end },
          end_date: { $gte: start },
        },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Equipment is already booked for the selected dates.",
      });
    }

    // Check blocked / maintenance availability dates
    const availabilityConflict = await Availability.findOne({
      equipment_id,
      status: {
        $in: ["blocked", "maintenance"],
      },
      start_date: {
        $lte: end,
      },
      end_date: {
        $gte: start,
      },
    });

    if (availabilityConflict) {
      return res.status(400).json({
        success: false,
        message:
          availabilityConflict.status === "maintenance"
            ? "Equipment is under maintenance for the selected dates."
            : "Equipment is unavailable for the selected dates.",
      });
    }

    // Pricing calculation
    const timeDiff = end.getTime() - start.getTime();
    const computedDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalDays = computedDays > 0 ? computedDays : 1;

    const baseAmount = equipment.price_per_day * totalDays;
    const commissionPercent = parseFloat(process.env.PLATFORM_COMMISSION_PERCENT) || 10;
    const platformFee = Math.round((baseAmount * commissionPercent) / 100);
    const depositAmount = equipment.security_deposit || 0;
    const deliveryCharge = parseFloat(req.body.delivery_charge) || 0;
    const totalAmount = baseAmount + depositAmount + platformFee + deliveryCharge;

    const booking = await Booking.create({
      farmer_id: req.user._id,
      rentaler_id: equipment.rentaler_id,
      equipment_id,
      start_date: start,
      end_date: end,
      total_days: totalDays,
      base_amount: baseAmount,
      deposit_amount: depositAmount,
      platform_fee: platformFee,
      total_amount: totalAmount,
      booking_status: "pending_payment",
      payment_status: "pending",
    });

    // Notify Rentaler
    await sendNotification({
        receiver_id: equipment.rentaler_id,
        title: "New Booking",
        message: "You have received a new booking request.",
        type: "booking",
        reference_id: booking._id,
    });

    const farmer = req.user;
    await sendBookingCreatedEmail({
        email: farmer.email,
        farmerName: farmer.fullName,
        equipmentName: equipment.title,
        bookingDate: booking.start_date,
        totalAmount: booking.total_amount,
    });

    await sendEmail({
        to: farmer.email,
        subject: "Booking Confirmation",
        html: bookingEmail(farmer.fullName),
    });

    await sendBookingSMS({
        phone: farmer.phone,
        equipmentName: equipment.title,
    });

    return res.status(201).json({
      success: true,
      message: "Booking request created successfully.",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * Get My Bookings
 */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      farmer_id: req.user._id,
    })
      .populate("equipment_id", "title images price_per_day")
      .sort({ createdAt: -1 });

    const bookingsData = bookings.map((b) => {
      const obj = b.toObject();
      obj.can_cancel = canCancel(b);
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: bookingsData.length,
      data: bookingsData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * Get Rentaler Bookings
 */
const getRentalerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      rentaler_id: req.user._id,
    })
      .populate("equipment_id", "title images")
      .populate("farmer_id", "fullName phone")
      .sort({ createdAt: -1 });

    const bookingsData = bookings.map((b) => {
      const obj = b.toObject();
      obj.can_cancel = canCancel(b);
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: bookingsData.length,
      data: bookingsData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Approve Booking
 */
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Only the equipment owner can approve
    if (booking.rentaler_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to approve this booking.",
      });
    }

    // Booking must be confirmed (paid) before accepting/approving
    if (booking.booking_status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Booking must be confirmed (paid) before it can be accepted.",
      });
    }

    booking.booking_status = "active";
    await booking.save();

    const farmer = await User.findById(booking.farmer_id);
    const equipment = await Equipment.findById(booking.equipment_id);
    await sendBookingConfirmedEmail({
        email: farmer.email,
        farmerName: farmer.fullName,
        equipmentName: equipment.title,
    });

    // Notify Farmer
    await Notification.create({
      receiver_id: booking.farmer_id,
      title: "Booking Approved",
      message: "Your booking request has been approved by the rentaler.",
      type: "booking",
    });

    return res.status(200).json({
      success: true,
      message: "Booking approved successfully.",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reject Booking
 */
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Only the equipment owner can reject
    if (booking.rentaler_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this booking.",
      });
    }

    booking.booking_status = "rejected";
    await booking.save();

    // Notify Farmer
    await Notification.create({
      receiver_id: booking.farmer_id,
      title: "Booking Rejected",
      message: "Your booking request has been rejected by the rentaler.",
      type: "booking",
    });

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully.",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cancel Booking by Farmer (before approval)
 * @deprecated - use cancelBooking which handles both pending and confirmed cancellations with guards.
 */
const cancelBookingByFarmer = async (req, res) => {
  return cancelBooking(req, res);
};

/**
 * Cancel Booking
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Only farmer who created the booking can cancel
    if (booking.farmer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking.",
      });
    }

    // Enforce constraints
    if (booking.booking_status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be cancelled.",
      });
    }

    if (booking.booking_status === "confirmed") {
      const cancelWindow = parseFloat(process.env.CANCELLATION_WINDOW_HOURS) || 2;
      const hoursSinceCreation = (Date.now() - new Date(booking.createdAt).getTime()) / (1000 * 60 * 60);
      const bookingStart = new Date(booking.start_date);
      const now = new Date();

      if (hoursSinceCreation > cancelWindow) {
        return res.status(400).json({
          success: false,
          message: `Confirmed bookings can only be cancelled within ${cancelWindow} hours of booking creation.`,
        });
      }
      if (bookingStart <= now) {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel a booking after the start date.",
        });
      }
    } else if (booking.booking_status !== "pending_payment") {
      return res.status(400).json({
        success: false,
        message: `Bookings with status "${booking.booking_status}" cannot be cancelled.`,
      });
    }

    booking.booking_status = "cancelled";
    booking.cancelled_at = new Date();
    await booking.save();

    const farmer = await User.findById(booking.farmer_id);
    const equipment = await Equipment.findById(booking.equipment_id);
    await sendBookingCancelledEmail({
        email: farmer.email,
        farmerName: farmer.fullName,
        equipmentName: equipment.title,
    });

    // Notify Rentaler
    await Notification.create({
      receiver_id: booking.rentaler_id,
      title: "Booking Cancelled",
      message: "The farmer has cancelled the booking.",
      type: "booking",
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Complete Booking
 */
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Only equipment owner can complete booking
    if (booking.rentaler_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to complete this booking.",
      });
    }

    // Booking must be active
    if (booking.booking_status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active bookings can be completed.",
      });
    }

    booking.booking_status = BOOKING_STATUS.COMPLETED;
    booking.completed_at = new Date();
    await booking.save();

    // Notify Farmer
    await Notification.create({
      receiver_id: booking.farmer_id,
      title: "Booking Completed",
      message: "Your booking has been marked as completed.",
      type: "booking",
    });

    // Notify Rentaler
    await Notification.create({
      receiver_id: booking.rentaler_id,
      title: "Booking Completed",
      message: "The booking has been completed successfully.",
      type: "booking",
    });

    return res.status(200).json({
      success: true,
      message: "Booking completed successfully.",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getRentalerBookings,
  approveBooking,
  rejectBooking,
  cancelBookingByFarmer,
  cancelBooking,
  completeBooking,
};