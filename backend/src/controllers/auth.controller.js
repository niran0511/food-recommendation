const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
<<<<<<< HEAD
const jwt = require('jsonwebtoken');

const sendTokenResponse = async (user, statusCode, res) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    user.password = undefined;

    res.status(statusCode).cookie('refreshToken', refreshToken, options).json(
        new ApiResponse(statusCode, { user, accessToken }, 'Success')
    );
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, profile } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new ApiError(400, 'User already exists'));
        }

        const user = await User.create({
            name,
            email,
            password,
            profile
        });

        await sendTokenResponse(user, 201, res);
=======

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
>>>>>>> 843d1be00973b4f1626346e9e427c402c314a65d
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
<<<<<<< HEAD
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new ApiError(401, 'Invalid credentials'));
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next(new ApiError(401, 'Invalid credentials'));
        }

        await sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
=======
    res.status(200).json(new ApiResponse(200, {}, 'Firebase Login session verified'));
>>>>>>> 843d1be00973b4f1626346e9e427c402c314a65d
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
<<<<<<< HEAD
    try {
        const options = {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        if (req.cookies && req.cookies.refreshToken) {
            const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
            if (user) {
                user.refreshToken = undefined;
                await user.save({ validateBeforeSave: false });
            }
        }

        res.status(200).cookie('refreshToken', 'none', options).json(
            new ApiResponse(200, {}, 'User logged out successfully')
        );
    } catch (error) {
        next(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return next(new ApiError(401, 'Not authorized'));
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== token) {
            return next(new ApiError(401, 'Not authorized'));
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
=======
    res.status(200).json(new ApiResponse(200, {}, 'User logged out successfully'));
};

exports.refreshToken = async (req, res, next) => {
    res.status(200).json(new ApiResponse(200, {}, 'Token refresh managed by client'));
>>>>>>> 843d1be00973b4f1626346e9e427c402c314a65d
};
