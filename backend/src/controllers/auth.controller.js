const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');


exports.register = async (req, res, next) => {
    try {
        const { name, email, firebaseUid, profile } = req.body;

        let user = await User.findOne({ email: email?.toLowerCase() });
        if (user) {
            if (!user.firebaseUid && firebaseUid) {
                user.firebaseUid = firebaseUid;
                await user.save();
            }
            return res.status(200).json(new ApiResponse(200, { user }, 'User already registered'));
        }

        const emailLower = email?.toLowerCase();
        const isAdmin = emailLower === 'admin@foodrec.com' || emailLower === 'niranjanselvakumar0511@gmail.com';
        user = await User.create({
            name,
            email: emailLower,
            firebaseUid,
            profile,
            role: isAdmin ? 'admin' : 'user'
        });

        res.status(201).json(
            new ApiResponse(201, { user }, 'User registered successfully')
        );

    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // If it's a standard email/password login (mostly for nutritionist/admin)
        if (password) {
            const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
            if (!user) {
                return next(new ApiError(401, 'Invalid credentials'));
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return next(new ApiError(401, 'Invalid credentials'));
            }
            const token = user.generateAccessToken();
            // Return user details and signed token
            return res.status(200).json(new ApiResponse(200, { user, token }, 'Logged in successfully'));
        }
        
        res.status(200).json(new ApiResponse(200, {}, 'Firebase Login session verified'));
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(new ApiResponse(200, { user }));
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    res.status(200).json(new ApiResponse(200, {}, 'User logged out successfully'));
};

exports.refreshToken = async (req, res, next) => {
    res.status(200).json(new ApiResponse(200, {}, 'Token refresh managed by client'));
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return next(new ApiError(400, 'Password must be at least 6 characters long'));
        }

        const user = await User.findById(req.user.id).select('+password');
        
        if (user.password) {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return next(new ApiError(400, 'Incorrect current password'));
            }
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json(new ApiResponse(200, {}, 'Password updated successfully'));
    } catch (error) {
        next(error);
    }
};
