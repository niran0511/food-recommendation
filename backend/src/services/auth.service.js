const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { TOKEN } = require('../utils/constants');

/**
 * @module AuthService
 * @description Business logic for authentication operations.
 */
class AuthService {
  /**
   * Registers a new user.
   * @param {Object} userData - User registration data
   * @returns {Promise<{user: Object, accessToken: string, refreshToken: string}>}
   */
  async register(userData) {
    const { name, email, password, profile } = userData;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      profile: profile || {},
    });

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return user without sensitive fields
    const userObj = user.toJSON();

    return { user: userObj, accessToken, refreshToken };
  }

  /**
   * Authenticates a user with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: Object, accessToken: string, refreshToken: string}>}
   */
  async login(email, password) {
    // Find user with password field included
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const userObj = user.toJSON();

    return { user: userObj, accessToken, refreshToken };
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * @param {string} incomingRefreshToken
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  async refreshToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const jwt = require('jsonwebtoken');
    let decoded;

    try {
      decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw ApiError.unauthorized('Refresh token has been revoked');
    }

    // Rotate tokens
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logs out a user by invalidating their refresh token.
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: '' });
  }

  /**
   * Gets the current authenticated user's profile.
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }
}

module.exports = new AuthService();
