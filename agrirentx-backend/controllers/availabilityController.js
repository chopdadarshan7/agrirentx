const Availability = require("../models/availability");
const Equipment = require("../models/equipment");
const Booking = require("../models/booking");
const asyncHandler = require("../middleware/asyncHandler");
const { successResponse } = require("../utils/responseHandler");

// Create Availability
const createAvailability = asyncHandler(async (req, res) => {
    const owner_id = req.user._id;

    const {
        equipment_id,
        start_date,
        end_date,
        status = "blocked",
        reason = "",
    } = req.body;

    if (!equipment_id || !start_date || !end_date) {
        return res.status(400).json({
            success: false,
            message: "Equipment, start date and end date are required.",
        });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid start or end date.",
        });
    }

    if (end < start) {
        return res.status(400).json({
            success: false,
            message: "End date cannot be before start date.",
        });
    }

    const allowedStatuses = [
        "available",
        "blocked",
        "maintenance",
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid availability status.",
        });
    }

    const equipment = await Equipment.findById(equipment_id);

    if (!equipment) {
        return res.status(404).json({
            success: false,
            message: "Equipment not found.",
        });
    }

    // Only equipment owner can manage availability
    if (
        equipment.rentaler_id.toString() !==
        owner_id.toString()
    ) {
        return res.status(403).json({
            success: false,
            message:
                "You are not authorized to manage this equipment.",
        });
    }

    // Prevent blocking dates that already have bookings
    if (
        status === "blocked" ||
        status === "maintenance"
    ) {
        const bookingConflict = await Booking.findOne({
            equipment_id,
            booking_status: {
                $in: [
                    "pending_payment",
                    "confirmed",
                    "active",
                ],
            },
            start_date: {
                $lte: end,
            },
            end_date: {
                $gte: start,
            },
        });

        if (bookingConflict) {
            return res.status(400).json({
                success: false,
                message:
                    "These dates already contain an active or pending booking.",
            });
        }
    }

    // Prevent overlapping blocked/maintenance periods
    const availabilityConflict =
        await Availability.findOne({
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

    if (
        availabilityConflict &&
        (status === "blocked" ||
            status === "maintenance")
    ) {
        return res.status(400).json({
            success: false,
            message:
                "An availability restriction already exists for these dates.",
        });
    }

    const availability = await Availability.create({
        equipment_id,
        owner_id,
        start_date: start,
        end_date: end,
        status,
        reason,
    });

    return successResponse(
        res,
        201,
        "Availability created successfully.",
        availability
    );
});


// Get Availability by Equipment
const getEquipmentAvailability = asyncHandler(
    async (req, res) => {
        const { equipmentId } = req.params;

        const equipment =
            await Equipment.findById(equipmentId);

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found.",
            });
        }

        const availability =
            await Availability.find({
                equipment_id: equipmentId,
            }).sort({
                start_date: 1,
            });

        return successResponse(
            res,
            200,
            "Availability fetched successfully.",
            availability
        );
    }
);


// Update Availability
const updateAvailability = asyncHandler(
    async (req, res) => {
        const { availabilityId } = req.params;

        const availability =
            await Availability.findById(
                availabilityId
            );

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: "Availability not found.",
            });
        }

        // Ownership check
        if (
            availability.owner_id.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to update this availability.",
            });
        }

        const start = req.body.start_date
            ? new Date(req.body.start_date)
            : availability.start_date;

        const end = req.body.end_date
            ? new Date(req.body.end_date)
            : availability.end_date;

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid start or end date.",
            });
        }

        if (end < start) {
            return res.status(400).json({
                success: false,
                message:
                    "End date cannot be before start date.",
            });
        }

        const status =
            req.body.status || availability.status;

        const allowedStatuses = [
            "available",
            "blocked",
            "maintenance",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid availability status.",
            });
        }

        // Check bookings before blocking dates
        if (
            status === "blocked" ||
            status === "maintenance"
        ) {
            const bookingConflict =
                await Booking.findOne({
                    equipment_id:
                        availability.equipment_id,

                    booking_status: {
                        $in: [
                            "pending_payment",
                            "confirmed",
                            "active",
                        ],
                    },

                    start_date: {
                        $lte: end,
                    },

                    end_date: {
                        $gte: start,
                    },
                });

            if (bookingConflict) {
                return res.status(400).json({
                    success: false,
                    message:
                        "These dates already contain an active or pending booking.",
                });
            }

            // Check another availability restriction
            const availabilityConflict =
                await Availability.findOne({
                    _id: {
                        $ne: availability._id,
                    },

                    equipment_id:
                        availability.equipment_id,

                    status: {
                        $in: [
                            "blocked",
                            "maintenance",
                        ],
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
                        "Another availability restriction already exists for these dates.",
                });
            }
        }

        availability.start_date = start;
        availability.end_date = end;
        availability.status = status;

        if (req.body.reason !== undefined) {
            availability.reason =
                req.body.reason;
        }

        await availability.save();

        return successResponse(
            res,
            200,
            "Availability updated successfully.",
            availability
        );
    }
);


// Delete Availability
const deleteAvailability = asyncHandler(
    async (req, res) => {
        const { availabilityId } = req.params;

        const availability =
            await Availability.findById(
                availabilityId
            );

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: "Availability not found.",
            });
        }

        // Only owner can delete
        if (
            availability.owner_id.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to delete this availability.",
            });
        }

        await availability.deleteOne();

        return successResponse(
            res,
            200,
            "Availability deleted successfully."
        );
    }
);


module.exports = {
    createAvailability,
    getEquipmentAvailability,
    updateAvailability,
    deleteAvailability,
};