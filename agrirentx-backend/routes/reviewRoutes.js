const express = require("express");

const router = express.Router();

const {
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
} = require("../controllers/reviewController");

const {
    reviewValidationRules,
    validateReview,
} = require("../validators/reviewValidator");

const {
    protect,
} = require("../middleware/authMiddleware");

// Create Review
/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create Review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Review Created Successfully
 */
router.post(
    "/",
    protect,
    reviewValidationRules,
    validateReview,
    createReview
);

// Top Rated Equipments (Must be before /:id)
/**
 * @swagger
 * /api/reviews/top-equipments:
 *   get:
 *     summary: Top Rated Equipments
 *     tags: [Review]
 *     responses:
 *       200:
 *         description: Top Rated Equipments
 */
router.get(
    "/top-equipments",
    getTopRatedEquipments
);

// Top Rated Rentalers (Must be before /:id)
/**
 * @swagger
 * /api/reviews/top-rentalers:
 *   get:
 *     summary: Top Rated Rentalers
 *     tags: [Review]
 *     responses:
 *       200:
 *         description: Top Rated Rentalers
 */
router.get(
    "/top-rentalers",
    getTopRatedRentalers
);

// Equipment Reviews
/**
 * @swagger
 * /api/reviews/equipment/{equipmentId}:
 *   get:
 *     summary: Get Equipment Reviews
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: equipmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Equipment Reviews
 */
router.get(
    "/equipment/:equipmentId",
    getEquipmentReviews
);

// Rentaler Reviews
/**
 * @swagger
 * /api/reviews/rentaler/{rentalerId}:
 *   get:
 *     summary: Get Rentaler Reviews
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: rentalerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rentaler Reviews
 */
// Logged-in Rentaler's Reviews
router.get(
    "/rentaler/me",
    protect,
    getMyRentalerReviews
);


// Rentaler Reviews
router.get(
    "/rentaler/:rentalerId",
    getRentalerReviews
);

// Review Statistics
/**
 * @swagger
 * /api/reviews/statistics:
 *   get:
 *     summary: Review Statistics
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review Statistics
 */
router.get(
    "/statistics",
    protect,
    getReviewStatistics
);

// Review By ID
/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get Review By ID
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review Details
 */
router.get(
    "/:id",
    getReviewById
);

// Update Review
/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update Review
 *     tags: [Review]
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
 *         description: Review Updated
 */
router.put(
    "/:id",
    protect,
    reviewValidationRules,
    validateReview,
    updateReview
);

// Delete Review
/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete Review
 *     tags: [Review]
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
 *         description: Review Deleted
 */
router.delete(
    "/:id",
    protect,
    deleteReview
);

module.exports = router;
