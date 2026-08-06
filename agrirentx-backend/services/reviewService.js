const Review = require("../models/review");
const Booking = require("../models/booking");
const Equipment = require("../models/equipment");
const User = require("../models/user");
const sendNotification = require("../utils/sendNotification");
const { sendEmail } = require("./emailService");
const { reviewEmail } = require("../utils/emailTemplates");

const updateEquipmentRating = async (equipmentId) => {
    const result = await Review.aggregate([
        {
            $match: {
                equipment_id: equipmentId,
            },
        },
        {
            $group: {
                _id: "$equipment_id",
                averageRating: {
                    $avg: "$rating",
                },
                totalReviews: {
                    $sum: 1,
                },
            },
        },
    ]);

    if (!result.length) return;

    await Equipment.findByIdAndUpdate(
        equipmentId,
        {
            average_rating: Number(
                result[0].averageRating.toFixed(1)
            ),
            total_reviews: result[0].totalReviews,
        }
    );
};

const updateRentalerRating = async (rentalerId) => {
    const result = await Review.aggregate([
        {
            $match: {
                rentaler_id: rentalerId,
            },
        },
        {
            $group: {
                _id: "$rentaler_id",
                averageRating: {
                    $avg: "$rating",
                },
                totalReviews: {
                    $sum: 1,
                },
            },
        },
    ]);

    if (!result.length) return;

    await User.findByIdAndUpdate(
        rentalerId,
        {
            average_rating: Number(
                result[0].averageRating.toFixed(1)
            ),
            total_reviews: result[0].totalReviews,
        }
    );
};

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

    await updateEquipmentRating(review.equipment_id);
    await updateRentalerRating(review.rentaler_id);

    await sendNotification({
        receiver_id: review.rentaler_id,
        title: "New Review",
        message: "Your equipment received a new review.",
        type: "review",
        reference_id: review._id,
    });

    const rentaler = await User.findById(review.rentaler_id);
    if (rentaler && rentaler.email) {
        await sendEmail({
            to: rentaler.email,
            subject: "New Review Received",
            html: reviewEmail(rentaler.fullName),
        });
    }

    return review;
};

const updateReviewService = async (
    reviewId,
    farmerId,
    data
) => {
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new Error("Review not found.");
    }

    if (
        review.farmer_id.toString() !==
        farmerId.toString()
    ) {
        throw new Error(
            "You can update only your own review."
        );
    }

    review.rating =
        data.rating ?? review.rating;

    review.review =
        data.review ?? data.comment ?? review.review;

    await review.save();

    await updateEquipmentRating(
        review.equipment_id
    );

    await updateRentalerRating(
        review.rentaler_id
    );

    return review;
};

const deleteReviewService = async (
    reviewId,
    farmerId
) => {
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new Error("Review not found.");
    }

    if (
        review.farmer_id.toString() !==
        farmerId.toString()
    ) {
        throw new Error(
            "You can delete only your own review."
        );
    }

    const equipmentId = review.equipment_id;
    const rentalerId = review.rentaler_id;

    await review.deleteOne();

    await updateEquipmentRating(
        equipmentId
    );

    await updateRentalerRating(
        rentalerId
    );

    return true;
};

const getReviewByIdService = async (reviewId) => {
    const review = await Review.findById(reviewId)
        .populate("farmer_id", "fullName avatar")
        .populate("equipment_id", "title images")
        .populate("rentaler_id", "fullName");

    if (!review) {
        throw new Error("Review not found.");
    }

    return review;
};

const getEquipmentReviewsService = async (equipmentId) => {
    return await Review.find({
        equipment_id: equipmentId,
    })
        .populate("farmer_id", "fullName avatar")
        .sort({
            createdAt: -1,
        });
};

const getRentalerReviewsService = async (rentalerId) => {
    return await Review.find({
        rentaler_id: rentalerId,
    })
        .populate("farmer_id", "fullName avatar")
        .populate("equipment_id", "title")
        .sort({
            createdAt: -1,
        });
};

const getReviewStatisticsService = async () => {
    const statistics = await Review.aggregate([
        {
            $group: {
                _id: null,
                totalReviews: {
                    $sum: 1,
                },
                averageRating: {
                    $avg: "$rating",
                },
                oneStar: {
                    $sum: {
                        $cond: [
                            { $eq: ["$rating", 1] },
                            1,
                            0,
                        ],
                    },
                },
                twoStar: {
                    $sum: {
                        $cond: [
                            { $eq: ["$rating", 2] },
                            1,
                            0,
                        ],
                    },
                },
                threeStar: {
                    $sum: {
                        $cond: [
                            { $eq: ["$rating", 3] },
                            1,
                            0,
                        ],
                    },
                },
                fourStar: {
                    $sum: {
                        $cond: [
                            { $eq: ["$rating", 4] },
                            1,
                            0,
                        ],
                    },
                },
                fiveStar: {
                    $sum: {
                        $cond: [
                            { $eq: ["$rating", 5] },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    return statistics[0] || {
        totalReviews: 0,
        averageRating: 0,
        oneStar: 0,
        twoStar: 0,
        threeStar: 0,
        fourStar: 0,
        fiveStar: 0,
    };
};

const getTopRatedEquipmentsService = async (
    limit = 10
) => {
    return await Equipment.find({
        total_reviews: {
            $gt: 0,
        },
        approval_status: "approved",
    })
        .select(
            "title images average_rating total_reviews price_per_day"
        )
        .sort({
            average_rating: -1,
            total_reviews: -1,
        })
        .limit(limit);
};

const getTopRatedRentalersService = async (
    limit = 10
) => {
    return await User.find({
        is_rentaler: true,
        rentaler_status: "approved",
        total_reviews: {
            $gt: 0,
        },
    })
        .select(
            "fullName profile_image average_rating total_reviews phone"
        )
        .sort({
            average_rating: -1,
            total_reviews: -1,
        })
        .limit(limit);
};

module.exports = {
    createReviewService,
    updateReviewService,
    deleteReviewService,
    updateEquipmentRating,
    updateRentalerRating,
    getReviewByIdService,
    getEquipmentReviewsService,
    getRentalerReviewsService,
    getReviewStatisticsService,
    getTopRatedEquipmentsService,
    getTopRatedRentalersService,
};
