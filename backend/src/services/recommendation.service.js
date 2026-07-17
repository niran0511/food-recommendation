const axios = require('axios');
const User = require('../models/User');
const RecommendationLog = require('../models/RecommendationLog');
const ApiError = require('../utils/ApiError');

/**
 * @module RecommendationService
 * @description Proxies requests to the AI microservice and logs recommendation history.
 */
class RecommendationService {
  constructor() {
    this.aiBaseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Builds the user profile payload for the AI service.
   * @param {Object} user - Mongoose user document
   * @returns {Object} Profile payload
   * @private
   */
  _buildProfilePayload(user) {
    return {
      age: user.profile.age,
      gender: user.profile.gender,
      height: user.profile.height,
      weight: user.profile.weight,
      bmi: user.profile.bmi,
      activityLevel: user.profile.activityLevel,
      goal: user.profile.goal,
      dietType: user.profile.dietType,
      cuisinePreference: user.profile.cuisinePreference,
      budget: user.profile.budget,
      mealFrequency: user.profile.mealFrequency,
      diseases: user.profile.diseases,
      allergies: user.profile.allergies,
      deficiencies: user.profile.deficiencies,
    };
  }

  /**
   * Gets food recommendations from the AI service.
   * @param {string} userId
   * @param {Object} [additionalParams] - Extra parameters to send to AI
   * @returns {Promise<Object>}
   */
  async getRecommendations(userId, additionalParams = {}) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.profile || !user.profile.age) {
      throw ApiError.badRequest('Please complete your health profile before getting recommendations');
    }

    const profilePayload = this._buildProfilePayload(user);
    const requestPayload = { ...profilePayload, ...additionalParams };

    const startTime = Date.now();

    // Try models in order of preference, falling back if one fails
    const modelOrder = ['gemini', 'openai', 'cohere'];
    let aiResponse;
    for (const model of modelOrder) {
      try {
        const payload = { ...requestPayload, model };
        aiResponse = await axios.post(`${this.aiBaseUrl}/api/recommend`, payload, { timeout: 30000 });
        // Successful response, break out of loop
        break;
      } catch (err) {
        // If this was the last model, rethrow the error
        if (model === modelOrder[modelOrder.length - 1]) {
          throw err;
        }
        // Otherwise continue to next model
      }
    }

    const responseTime = Date.now() - startTime;

    // Log the recommendation
    await RecommendationLog.create({
      userId,
      input: requestPayload,
      recommendations: aiResponse.data.recommendations || aiResponse.data.data || [],
      type: 'general',
      responseTime,
    });

    return aiResponse.data;  }

  /**
   * Gets the user's recommendation history.
   * @param {string} userId
   * @param {Object} [options]
   * @param {number} [options.page=1]
   * @param {number} [options.limit=10]
   * @returns {Promise<{logs: Array, pagination: Object}>}
   */
  async getHistory(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      RecommendationLog.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RecommendationLog.countDocuments({ userId }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Gets foods the user should avoid based on their health profile.
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getFoodsToAvoid(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.profile || !user.profile.age) {
      throw ApiError.badRequest('Please complete your health profile first');
    }

    const profilePayload = this._buildProfilePayload(user);
    const startTime = Date.now();

    // Try models in order of preference, falling back if one fails
    const modelOrder = ['gemini', 'openai', 'cohere'];
    let aiResponse;
    for (const model of modelOrder) {
      try {
        const payload = { ...profilePayload, model };
        aiResponse = await axios.post(`${this.aiBaseUrl}/api/foods-to-avoid`, payload, { timeout: 30000 });
        // Successful response, break out of loop
        break;
      } catch (err) {
        if (model === modelOrder[modelOrder.length - 1]) {
          // Last model, rethrow error
          throw err;
        }
        // otherwise continue to next model
      }
    }

    const responseTime = Date.now() - startTime;

    // Log the recommendation
    await RecommendationLog.create({
      userId,
      input: profilePayload,
      recommendations: aiResponse.data.foods_to_avoid || aiResponse.data.data || [],
      type: 'foods-to-avoid',
      responseTime,
    });

    return aiResponse.data;
  }
}

module.exports = new RecommendationService();
