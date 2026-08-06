const Review = require("../models/review");
const Booking = require("../models/booking");
const Equipment = require("../models/equipment");
const User = require("../models/user");

const createReviewService = async (data, farmerId) => {

    const booking = await Booking.findById(data.booking_id);

    if (!booking) {
        throw new Error("Booking not found.");
    }

    if (booking.booking_status !== "completed") {
        throw new Error("Review can only be submitted after booking completion.");
    }

    const existingReview = await Review.findOne({
        booking_id: data.booking_id,
        farmer_id: farmerId,
    });

    if (existingReview) {
        throw new Error("Review already submitted.");
    }

    const review = await Review.create({

        booking_id: data.booking_id,

        equipment_id: data.equipment_id,

        farmer_id: farmerId,

        rentaler_id: data.rentaler_id,

        rating: data.rating,

        review: data.review,

    });

    return review;

};

module.exports = {
    createReviewService,
};