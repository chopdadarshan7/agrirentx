const Category = require("../models/category");

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Admin
 */
const createCategory = async (req, res, next) => {
    try {
        const { name, slug, description, image, specTemplate } = req.body;

        const existingCategory = await Category.findOne({
            $or: [{ name }, { slug }],
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category with the same name or slug already exists.",
            });
        }

        const category = await Category.create({
            name,
            slug,
            description,
            image,
            spec_template: specTemplate || [],
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            data: category,
        });
    } catch (error) {
        next(error);
    }
};


/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Admin
 */
const updateCategory = async (req, res, next) => {
    try {
        const { name, slug, description, image, specTemplate } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        const duplicate = await Category.findOne({
            _id: { $ne: req.params.id },
            $or: [{ name }, { slug }],
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Another category with the same name or slug already exists.",
            });
        }

        category.name = name;
        category.slug = slug;
        if (description !== undefined) category.description = description;
        if (image !== undefined) category.image = image;
        if (specTemplate !== undefined) category.spec_template = specTemplate;

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        await category.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};