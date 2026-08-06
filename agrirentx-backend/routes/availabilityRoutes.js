const express = require("express");

const {
    createAvailability,
    getEquipmentAvailability,
    updateAvailability,
    deleteAvailability,
} = require("../controllers/availabilityController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createAvailability);

router.get("/:equipmentId", getEquipmentAvailability);

router.put("/:availabilityId", updateAvailability);

router.delete("/:availabilityId", deleteAvailability);

module.exports = router;