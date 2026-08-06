const express = require("express");

const {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist,
    checkWishlistStatus,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getMyWishlist);

router.post("/:equipmentId", addToWishlist);

router.delete("/:equipmentId", removeFromWishlist);

router.get("/check/:equipmentId", checkWishlistStatus);

module.exports = router;