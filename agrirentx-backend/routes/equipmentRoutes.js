const express = require("express");

const router = express.Router();

const {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getNearbyEquipment,
  approveEquipment,
  rejectEquipment,
  getPendingEquipment,
} = require("../controllers/equipmentController");

const {
  equipmentValidationRules,
  validateEquipment,
} = require("../validators/equipmentValidator");

const upload = require("../middleware/uploadMiddleware");

const {
  protect,
  isApprovedRentaler,
  isAdmin,
} = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Get All Equipment
/**
 * @swagger
 * /api/equipments:
 *   get:
 *     summary: Get All Equipments
 *     tags: [Equipment]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipment List
 */
router.get("/", getAllEquipment);

// Nearby Equipment
/**
 * @swagger
 * /api/equipments/nearby:
 *   get:
 *     summary: Nearby Equipments
 *     tags: [Equipment]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Nearby Equipment List
 */
router.get("/nearby", getNearbyEquipment);

// Admin — Get Pending Equipment (must be BEFORE /:id)
router.get("/pending", protect, isAdmin, getPendingEquipment);

// Get Equipment By ID
/**
 * @swagger
 * /api/equipments/{id}:
 *   get:
 *     summary: Get Equipment By ID
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Equipment Details
 */
router.get("/:id", getEquipmentById);

/*
|--------------------------------------------------------------------------
| Rentaler Routes
|--------------------------------------------------------------------------
*/

// Create Equipment
/**
 * @swagger
 * /api/equipments:
 *   post:
 *     summary: Create Equipment
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Equipment Created
 */
router.post(
  "/",
  protect,
  isApprovedRentaler,
  (req, res, next) => {
    req.uploadFolder = "equipments";
    req.uploadType = "image";
    next();
  },
  upload.array("images", 10),
  ...equipmentValidationRules,
  validateEquipment,
  createEquipment
);

// Update Equipment
/**
 * @swagger
 * /api/equipments/{id}:
 *   put:
 *     summary: Update Equipment
 *     tags: [Equipment]
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
 *         description: Equipment Updated
 */
router.put(
  "/:id",
  protect,
  isApprovedRentaler,
  (req, res, next) => {
    req.uploadFolder = "equipments";
    req.uploadType = "image";
    next();
  },
  upload.array("images", 10),
  ...equipmentValidationRules,
  validateEquipment,
  updateEquipment
);

// Delete Equipment
/**
 * @swagger
 * /api/equipments/{id}:
 *   delete:
 *     summary: Delete Equipment
 *     tags: [Equipment]
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
 *         description: Equipment Deleted
 */
router.delete(
  "/:id",
  protect,
  isApprovedRentaler,
  deleteEquipment
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Approve Equipment
/**
 * @swagger
 * /api/equipments/{id}/approve:
 *   put:
 *     summary: Approve Equipment
 *     tags: [Equipment]
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
 *         description: Equipment Approved
 */
router.put(
  "/:id/approve",
  protect,
  isAdmin,
  approveEquipment
);
router.patch(
  "/:id/approve",
  protect,
  isAdmin,
  approveEquipment
);

// Reject Equipment
/**
 * @swagger
 * /api/equipments/{id}/reject:
 *   put:
 *     summary: Reject Equipment
 *     tags: [Equipment]
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
 *         description: Equipment Rejected
 */
router.put(
  "/:id/reject",
  protect,
  isAdmin,
  rejectEquipment
);
router.patch(
  "/:id/reject",
  protect,
  isAdmin,
  rejectEquipment
);

module.exports = router;