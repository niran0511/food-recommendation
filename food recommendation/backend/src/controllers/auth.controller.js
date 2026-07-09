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

    res.status(200).json(new ApiResponse(200, {}, 'Firebase Login session verified'));

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
