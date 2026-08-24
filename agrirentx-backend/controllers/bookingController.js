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
    sendOTP,
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

    // Check overlapping bookings
    const start = new Date(start_date);
    const end = new Date(end_date);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (start < startOfToday) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past.",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

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
    const deliveryRequired =
      req.body.delivery_required === true ||
      req.body.delivery_required === "true";
    const deliveryAddress = (req.body.delivery_address || "").trim();

    if (deliveryRequired && !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: "Enter a delivery address.",
      });
    }

    const deliveryCharge = deliveryRequired
      ? parseFloat(process.env.DELIVERY_CHARGE_FLAT) || 0
      : 0;
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
      delivery_required: deliveryRequired,
      delivery_address: deliveryAddress,
      contact_phone: req.body.contact_phone,
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

    // The OTP only proves anything if the rentaler has to hear it from the
    // farmer in person — never expose the raw value to the rentaler's own view.
    const bookingsData = bookings.map((b) => {
      const obj = b.toObject();
      obj.can_cancel = canCancel(b);
      delete obj.delivery_otp;
      delete obj.return_otp;
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
 * Get Booking By Id
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("equipment_id", "title images price_per_day")
      .populate("farmer_id", "fullName phone")
      .populate("rentaler_id", "fullName phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const isParty = [booking.farmer_id?._id, booking.rentaler_id?._id].some(
      (id) => id && id.toString() === req.user._id.toString()
    );

    if (!isParty && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking.",
      });
    }

    const obj = booking.toObject();
    obj.can_cancel = canCancel(booking);

    // Only the farmer should ever see the raw OTP — the rentaler must hear
    // it from the farmer in person for the confirmation to mean anything.
    const isFarmerViewing = booking.farmer_id?._id?.toString() === req.user._id.toString();
    if (!isFarmerViewing) {
      delete obj.delivery_otp;
      delete obj.return_otp;
    }

    return res.status(200).json({
      success: true,
      data: obj,
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

    // Equipment has been returned — make it bookable again
    const returnedEquipment = await Equipment.findById(booking.equipment_id);
    if (returnedEquipment) {
      returnedEquipment.status = "available";
      await returnedEquipment.save();
    }

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

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * EqTrack — Generate Delivery OTP
 * Rentaler triggers this before heading out; OTP goes to the farmer,
 * who reads it back to the rentaler at the doorstep to confirm handoff.
 */
const generateDeliveryOtp = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.rentaler_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this booking's delivery.",
      });
    }

    if (!booking.delivery_required) {
      return res.status(400).json({
        success: false,
        message: "This booking doesn't require delivery.",
      });
    }

    if (booking.logistics_status !== "awaiting_delivery") {
      return res.status(400).json({
        success: false,
        message: "Delivery has already been confirmed for this booking.",
      });
    }

    const otp = generateOtp();
    booking.delivery_otp = otp;
    booking.delivery_otp_generated_at = new Date();
    await booking.save();

    const farmer = await User.findById(booking.farmer_id);
    if (farmer?.phone) {
      await sendOTP({ phone: farmer.phone, otp });
    }
    await sendNotification({
      receiver_id: booking.farmer_id,
      title: "Delivery OTP",
      message: `Your delivery OTP is ${otp}. Share it with the rentaler when the equipment arrives.`,
      type: "booking",
      reference_id: booking._id,
    });

    return res.status(200).json({
      success: true,
      message: "Delivery OTP sent to the farmer.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * EqTrack — Verify Delivery OTP
 * Rentaler enters the OTP the farmer read out to confirm the equipment
 * has physically reached the farmer.
 */
const verifyDeliveryOtp = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.rentaler_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this booking's delivery.",
      });
    }

    if (booking.logistics_status !== "awaiting_delivery") {
      return res.status(400).json({
        success: false,
        message: "Delivery has already been confirmed for this booking.",
      });
    }

    if (!booking.delivery_otp || !req.body.otp || req.body.otp !== booking.delivery_otp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP." });
    }

    booking.logistics_status = "delivered";
    booking.delivered_at = new Date();
    booking.delivery_otp = "";
    await booking.save();

    await sendNotification({
      receiver_id: booking.farmer_id,
      title: "Equipment Delivered",
      message: "Delivery confirmed — the equipment is now with you.",
      type: "booking",
      reference_id: booking._id,
    });

    return res.status(200).json({
      success: true,
      message: "Delivery confirmed.",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * EqTrack — Generate Return OTP
 * Rentaler triggers this when it's time to collect the equipment back;
 * OTP goes to the farmer, who gives it to the rentaler at pickup to confirm return.
 */
const generateReturnOtp = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.rentaler_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this booking's return.",
      });
    }

    if (booking.logistics_status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Equipment must be marked delivered before a return can be started.",
      });
    }

    const otp = generateOtp();
    booking.return_otp = otp;
    booking.return_otp_generated_at = new Date();
    await booking.save();

    const farmer = await User.findById(booking.farmer_id);
    if (farmer?.phone) {
      await sendOTP({ phone: farmer.phone, otp });
    }
    await sendNotification({
      receiver_id: booking.farmer_id,
      title: "Return OTP",
      message: `Your return OTP is ${otp}. Give it to the rentaler when they collect the equipment.`,
      type: "booking",
      reference_id: booking._id,
    });

    return res.status(200).json({
      success: true,
      message: "Return OTP sent to the farmer.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * EqTrack — Verify Return OTP
 * Rentaler enters the OTP the farmer gave them to confirm the equipment
 * has been physically returned.
 */
const verifyReturnOtp = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.rentaler_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this booking's return.",
      });
    }

    if (booking.logistics_status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "This booking isn't awaiting a return confirmation.",
      });
    }

    if (!booking.return_otp || !req.body.otp || req.body.otp !== booking.return_otp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP." });
    }

    booking.logistics_status = "returned";
    booking.returned_at = new Date();
    booking.return_otp = "";
    await booking.save();

    await sendNotification({
      receiver_id: booking.farmer_id,
      title: "Return Confirmed",
      message: "Thanks — your return has been confirmed by the rentaler.",
      type: "booking",
      reference_id: booking._id,
    });

    return res.status(200).json({
      success: true,
      message: "Return confirmed.",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getRentalerBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBookingByFarmer,
  cancelBooking,
  completeBooking,
  generateDeliveryOtp,
  verifyDeliveryOtp,
  generateReturnOtp,
  verifyReturnOtp,
};