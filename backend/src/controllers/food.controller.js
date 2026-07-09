const Food = require('../models/Food');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

exports.getFoods = async (req, res, next) => {
    try {
        const { category, cuisine, diet_type, search, page = 1, limit = 20 } = req.query;
        let query = {};

        if (category) query.category = category;
        if (cuisine) query.cuisine = cuisine;
        if (diet_type) query.diet_type = { $in: [diet_type] };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const foods = await Food.find(query).skip(skip).limit(Number(limit));
        const total = await Food.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            foods,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        }));
    } catch (error) {
        next(error);
    }
};

exports.getFoodById = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return next(new ApiError(404, `Food not found with id of ${req.params.id}`));
        }
        res.status(200).json(new ApiResponse(200, { food }));
    } catch (error) {
        next(error);
    }
};

exports.createFood = async (req, res, next) => {
    try {
        const food = await Food.create(req.body);
        res.status(201).json(new ApiResponse(201, { food }, 'Food created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateFood = async (req, res, next) => {
    try {
        let food = await Food.findById(req.params.id);
        if (!food) {
            return next(new ApiError(404, `Food not found with id of ${req.params.id}`));
        }
        food = await Food.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json(new ApiResponse(200, { food }, 'Food updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteFood = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return next(new ApiError(404, `Food not found with id of ${req.params.id}`));
        }
        await food.deleteOne();
        res.status(200).json(new ApiResponse(200, {}, 'Food deleted successfully'));
    } catch (error) {
        next(error);
    }
};
