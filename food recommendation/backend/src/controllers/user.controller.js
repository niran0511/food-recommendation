const User = require('../models/User');
const { ApiResponse } = require('../utils/ApiResponse');

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(new ApiResponse(200, { user }));
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (req.body.name) user.name = req.body.name;
        if (req.body.profile) {
            user.profile = { ...user.profile, ...req.body.profile };
            user.markModified('profile');
        }
        
        await user.save();

        res.status(200).json(new ApiResponse(200, { user }, 'Profile updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getFavorites = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(new ApiResponse(200, { favorites: user.favorites || [] }));
    } catch (error) {
        next(error);
    }
};

exports.addFavorite = async (req, res, next) => {
    try {
        const { foodName } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user.favorites.includes(foodName)) {
            user.favorites.push(foodName);
            await user.save();
        }
        
        res.status(200).json(new ApiResponse(200, { favorites: user.favorites }, 'Added to favorites'));
    } catch (error) {
        next(error);
    }
};

exports.removeFavorite = async (req, res, next) => {
    try {
        const { foodName } = req.body;
        const user = await User.findById(req.user.id);
        
        user.favorites = user.favorites.filter(f => f !== foodName);
        await user.save();
        
        res.status(200).json(new ApiResponse(200, { favorites: user.favorites }, 'Removed from favorites'));
    } catch (error) {
        next(error);
    }
};
