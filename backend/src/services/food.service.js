const Food = require('../models/Food');
const ApiError = require('../utils/ApiError');
const { PAGINATION } = require('../utils/constants');

/**
 * @module FoodService
 * @description Business logic for food CRUD operations with search, filter, and pagination.
 */
class FoodService {
  /**
   * Gets a paginated list of foods with optional filters and search.
   * @param {Object} query - Query parameters
   * @param {string} [query.search] - Text search term
   * @param {string} [query.category] - Filter by category
   * @param {string} [query.cuisine] - Filter by cuisine
   * @param {string} [query.diet_type] - Filter by diet type
   * @param {string} [query.meal_type] - Filter by meal type
   * @param {string} [query.sort] - Sort field (calories, rating, protein, name)
   * @param {string} [query.order] - Sort order (asc/desc)
   * @param {number} [query.page] - Page number
   * @param {number} [query.limit] - Items per page
   * @returns {Promise<{foods: Array, pagination: Object}>}
   */
  async getAllFoods(query) {
    const {
      search,
      category,
      cuisine,
      diet_type,
      meal_type,
      sort = 'name',
      order = 'asc',
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      minCalories,
      maxCalories,
    } = query;

    const filter = { isActive: true };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Filters
    if (category) filter.category = category;
    if (cuisine) filter.cuisine = { $regex: new RegExp(cuisine, 'i') };
    if (diet_type) filter.diet_type = { $in: [diet_type] };
    if (meal_type) filter.meal_type = { $in: [meal_type] };

    // Calorie range
    if (minCalories || maxCalories) {
      filter.calories = {};
      if (minCalories) filter.calories.$gte = Number(minCalories);
      if (maxCalories) filter.calories.$lte = Number(maxCalories);
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortObj = {};
    if (search) {
      sortObj.score = { $meta: 'textScore' };
    }
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query
    const [foods, total] = await Promise.all([
      Food.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Food.countDocuments(filter),
    ]);

    return {
      foods,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    };
  }

  /**
   * Gets a single food item by ID with full nutritional data.
   * @param {string} foodId
   * @returns {Promise<Object>}
   */
  async getFoodById(foodId) {
    const food = await Food.findById(foodId).lean();
    if (!food) {
      throw ApiError.notFound('Food not found');
    }
    return food;
  }

  /**
   * Creates a new food item.
   * @param {Object} foodData
   * @returns {Promise<Object>}
   */
  async createFood(foodData) {
    const food = await Food.create(foodData);
    return food;
  }

  /**
   * Updates an existing food item.
   * @param {string} foodId
   * @param {Object} foodData
   * @returns {Promise<Object>}
   */
  async updateFood(foodId, foodData) {
    const food = await Food.findByIdAndUpdate(
      foodId,
      { $set: foodData },
      { new: true, runValidators: true }
    );

    if (!food) {
      throw ApiError.notFound('Food not found');
    }

    return food;
  }

  /**
   * Soft-deletes a food item by setting isActive to false.
   * @param {string} foodId
   * @returns {Promise<void>}
   */
  async deleteFood(foodId) {
    const food = await Food.findByIdAndUpdate(
      foodId,
      { isActive: false },
      { new: true }
    );

    if (!food) {
      throw ApiError.notFound('Food not found');
    }
  }
}

module.exports = new FoodService();
