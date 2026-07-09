const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { cloudinary } = require('../config/cloudinary');

/**
 * @module UserService
 * @description Business logic for user profile management.
 */
class UserService {
  /**
   * Gets a user's full profile.
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  /**
   * Updates a user's health profile.
   * @param {string} userId
   * @param {Object} profileData - Profile fields to update
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, profileData) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Update allowed top-level fields
    if (profileData.name) user.name = profileData.name;

    // Update nested profile fields
    const profileFields = [
      'age', 'gender', 'height', 'weight', 'activityLevel', 'goal',
      'dietType', 'cuisinePreference', 'budget', 'mealFrequency',
      'diseases', 'allergies', 'deficiencies',
    ];

    profileFields.forEach((field) => {
      if (profileData[field] !== undefined) {
        user.profile[field] = profileData[field];
      }
    });

    // BMI will be auto-calculated in pre-save hook
    await user.save();

    return user;
  }

  /**
   * Uploads a user's avatar to Cloudinary and updates the URL.
   * @param {string} userId
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>}
   */
  async updateAvatar(userId, file) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!file) {
      throw ApiError.badRequest('No image file provided');
    }

    try {
      // Upload to Cloudinary using buffer
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'food-recommendation/avatars',
            transformation: [
              { width: 300, height: 300, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
            public_id: `avatar_${userId}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      user.avatar = result.secure_url;
      await user.save({ validateBeforeSave: false });

      return { avatar: result.secure_url };
    } catch (error) {
      throw ApiError.internal('Failed to upload avatar: ' + error.message);
    }
  }
}

module.exports = new UserService();
