const express = require("express");

const router = express.Router();

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");

const {
    categoryValidationRules,
    validateCategory,
} = require("../validators/categoryValidator");

const {
    protect,
    isAdmin,
} = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Get all categories
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get All Categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Category List
 */
router.get("/", getAllCategories);

// Get category by ID
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get Category By ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category Details
 */
router.get("/:id", getCategoryById);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Create Category
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create Category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Category Created
 */
router.post(
    "/",
    protect,
    isAdmin,
    categoryValidationRules,
    validateCategory,
    createCategory
);

// Update Category
/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update Category
 *     tags: [Category]
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
 *         description: Category Updated
 */
router.put(
    "/:id",
    protect,
    isAdmin,
    categoryValidationRules,
    validateCategory,
    updateCategory
);

// Delete Category
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete Category
 *     tags: [Category]
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
 *         description: Category Deleted
 */
router.delete(
    "/:id",
    protect,
    isAdmin,
    deleteCategory
);

module.exports = router;