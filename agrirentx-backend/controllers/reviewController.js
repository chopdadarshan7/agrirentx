const { successResponse } = require("../utils/responseHandler");
const asyncHandler = require("../middleware/asyncHandler");
const {
    createReviewService,
    updateReviewService,
    deleteReviewService,
    getReviewByIdService,
    getEquipmentReviewsService,
    getRentalerReviewsService,
    getReviewStatisticsService,
    getTopRatedEquipmentsService,
    getTopRatedRentalersService,
} = require("../services/reviewService");

/**
 * Create Review
 */
const createReview = asyncHandler(async (req, res) => {
    const review = await createReviewService(
        req.body,
        req.user._id
    );

    return successResponse(
        res,
        201,
        "Review submitted successfully.",
        review
    );
});

/**
 * Update Review
 */
const updateReview = asyncHandler(async (req, res) => {
    const review = await updateReviewService(
        req.params.id,
        req.user._id,
        req.body
    );

    return successResponse(
        res,
        200,
        "Review updated successfully.",
        review
    );
});

/**
 * Delete Review
 */
const deleteReview = asyncHandler(async (req, res) => {
    await deleteReviewService(
        req.params.id,
        req.user._id
    );

    return successResponse(
        res,
        200,
        "Review deleted successfully."
    );
});

/**
 * Get Review By ID
 */
const getReviewById = asyncHandler(async (req, res) => {
    const review = await getReviewByIdService(
        req.params.id
    );

    return successResponse(
        res,
        200,
        "Review fetched successfully.",
        review
    );
});

/**
 * Get Equipment Reviews
 */
const getEquipmentReviews = asyncHandler(async (req, res) => {
    const reviews = await getEquipmentReviewsService(
        req.params.equipmentId
    );

    return successResponse(
        res,
        200,
        "Equipment reviews fetched successfully.",
        reviews
    );
});

/**
 * Get Rentaler Reviews
 */
const getRentalerReviews = asyncHandler(async (req, res) => {
    const reviews = await getRentalerReviewsService(
        req.params.rentalerId
    );

    return successResponse(
        res,
        200,
        "Rentaler reviews fetched successfully.",
        reviews
    );
});


/**
 * Get Logged-in Rentaler Reviews
 */
const getMyRentalerReviews = asyncHandler(async (req, res) => {
    const reviews = await getRentalerReviewsService(
        req.user._id
    );

    return successResponse(
        res,
        200,
        "Rentaler reviews fetched successfully.",
        reviews
    );
});

/**
 * Get Review Statistics
 */
const getReviewStatistics = asyncHandler(async (req, res) => {
    const statistics = await getReviewStatisticsService();

    return successResponse(
        res,
        200,
        "Review statistics fetched successfully.",
        statistics
    );
});

/**
 * Get Top Rated Equipments
 */
const getTopRatedEquipments = asyncHandler(async (req, res) => {
    const equipments = await getTopRatedEquipmentsService();

    return successResponse(
        res,
        200,
        "Top rated equipments fetched successfully.",
        equipments
    );
});

/**
 * Get Top Rated Rentalers
 */
const getTopRatedRentalers = asyncHandler(async (req, res) => {
    const rentalers = await getTopRatedRentalersService();

    return successResponse(
        res,
        200,
        "Top rated rentalers fetched successfully.",
        rentalers
    );
});

module.exports = {
    createReview,
    updateReview,
    deleteReview,
    getReviewById,
    getEquipmentReviews,
    getRentalerReviews,
    getMyRentalerReviews,
    getReviewStatistics,
    getTopRatedEquipments,
    getTopRatedRentalers,
};