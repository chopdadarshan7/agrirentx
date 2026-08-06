const Equipment = require("../models/equipment");
const Category = require("../models/category");

/**
 * Create Equipment
 */
const createEquipment = async (req, res) => {
    try {
        // Get uploaded image paths
        const images = req.files
            ? req.files.map((file) => `/${file.path.replace(/\\/g, "/")}`)
            : [];

        // Create equipment
        const equipment = await Equipment.create({
            rentaler_id: req.user._id,

            category_id: req.body.category_id,

            title: req.body.title,

            description: req.body.description,

            specifications: req.body.specifications || {},

            price_per_day: req.body.price_per_day,

            security_deposit: req.body.security_deposit || 0,

            location: {
            address: req.body.location?.address,
            village: req.body.location?.village,
            taluka: req.body.location?.taluka,
            district: req.body.location?.district,
            state: req.body.location?.state,
            pincode: req.body.location?.pincode,

            // ----------------------------------------
            // ⚠️ Coordinates come from frontend
            // Must be in [longitude, latitude] order
            // ----------------------------------------
            latitude: req.body.location?.latitude,
            longitude: req.body.location?.longitude,

            geo: {
                type: "Point",
                coordinates: [
                    parseFloat(req.body.location.longitude),
                    parseFloat(req.body.location.latitude)
                ]
            }
        },

            images,

            ownership_document_url:
                req.body.ownership_document_url || "",

            status: "available",

            approval_status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Equipment created successfully. Waiting for admin approval.",
            data: equipment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


/**
 * Get All Equipment
 */
const getAllEquipment = async (req, res) => {
  try {
    const {
      search,
      category,
      district,
      state,
      minPrice,
      maxPrice,
      status,
      sort = "latest",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      is_deleted: false,
      approval_status: "approved",
    };

    // Keyword Search
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category Filter
    if (category) {
      filter.category_id = category;
    }

    // District Filter
    if (district) {
      filter["location.district"] = district;
    }

    // State Filter
    if (state) {
      filter["location.state"] = state;
    }

    // Status Filter
    if (status) {
      filter.status = status;
    }

    // Price Filter
    if (minPrice || maxPrice) {
      filter.price_per_day = {};

      if (minPrice) {
        filter.price_per_day.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price_per_day.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOption = {};

    switch (sort) {
      case "price_asc":
        sortOption = { price_per_day: 1 };
        break;

      case "price_desc":
        sortOption = { price_per_day: -1 };
        break;

      case "rating":
        sortOption = { average_rating: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Equipment.countDocuments(filter);

    const equipments = await Equipment.find(filter)
      .populate("category_id", "name slug")
      .populate("rentaler_id", "fullName phone avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count: equipments.length,
      data: equipments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Equipment By ID
 */
const getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findOne({
            _id: req.params.id,
            is_deleted: false,
            approval_status: "approved",
        })
            .populate("category_id", "name slug spec_template")
            .populate("rentaler_id", "fullName phone city state");

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: equipment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update Equipment
 */
const updateEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findOne({
            _id: req.params.id,
            is_deleted: false,
        });

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found.",
            });
        }

        // Only owner or admin can update
        if (
            equipment.rentaler_id.toString() !== req.user._id.toString() &&
            !req.user.isAdmin
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this equipment.",
            });
        }

        // Update uploaded images if provided
        if (req.files && req.files.length > 0) {
            equipment.images = req.files.map(
                (file) => `/${file.path.replace(/\\/g, "/")}`
            );
        }

        equipment.category_id =
            req.body.category_id || equipment.category_id;

        equipment.title =
            req.body.title || equipment.title;

        equipment.description =
            req.body.description || equipment.description;

        equipment.specifications =
            req.body.specifications || equipment.specifications;

        equipment.price_per_day =
            req.body.price_per_day ?? equipment.price_per_day;

        equipment.security_deposit =
            req.body.security_deposit ?? equipment.security_deposit;

        if (req.body.location) {
  equipment.location = {
    address: req.body.location.address,
    village: req.body.location.village,
    taluka: req.body.location.taluka,
    district: req.body.location.district,
    state: req.body.location.state,
    pincode: req.body.location.pincode,

    latitude: req.body.location.latitude,
    longitude: req.body.location.longitude,

    geo: {
      type: "Point",
      coordinates: [
        parseFloat(req.body.location.longitude),
        parseFloat(req.body.location.latitude),
      ],
    },
  };
}

        equipment.ownership_document_url =
            req.body.ownership_document_url ||
            equipment.ownership_document_url;

        // Re-approval required after update
        equipment.approval_status = "pending";

        await equipment.save();

        return res.status(200).json({
            success: true,
            message: "Equipment updated successfully. Waiting for admin approval.",
            data: equipment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


/**
 * Delete Equipment (Soft Delete)
 */
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      is_deleted: false,
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found.",
      });
    }

    // Only owner or admin can delete
    if (
      equipment.rentaler_id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this equipment.",
      });
    }

    equipment.is_deleted = true;

    await equipment.save();

    return res.status(200).json({
      success: true,
      message: "Equipment deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Nearby Equipment
 */
const getNearbyEquipment = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    const equipments = await Equipment.find({
      is_deleted: false,
      approval_status: "approved",
      "location.geo": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              Number(longitude),
              Number(latitude),
            ],
          },
          $maxDistance: Number(radius) * 1000,
        },
      },
    })
      .populate("category_id", "name slug")
      .populate("rentaler_id", "fullName phone avatar");

    return res.status(200).json({
      success: true,
      count: equipments.length,
      data: equipments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};/**
 * Approve Equipment
 */
const approveEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found.",
      });
    }

    equipment.approval_status = "approved";

    await equipment.save();

    return res.status(200).json({
      success: true,
      message: "Equipment approved successfully.",
      data: equipment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reject Equipment
 */
const rejectEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found.",
      });
    }

    equipment.approval_status = "rejected";

    await equipment.save();

    return res.status(200).json({
      success: true,
      message: "Equipment rejected successfully.",
      data: equipment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * Get All Pending Equipment
 */
const getPendingEquipment = async (req, res) => {
  try {
    const equipments = await Equipment.find({
      approval_status: "pending",
      is_deleted: false,
    })
      .populate("category_id", "name slug")
      .populate("rentaler_id", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: equipments.length,
      data: equipments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
    createEquipment,
    getAllEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment,
    getNearbyEquipment,
    approveEquipment,
    rejectEquipment,
    getPendingEquipment,

};

