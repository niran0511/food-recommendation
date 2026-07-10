const User = require('../models/User');
const Food = require('../models/Food');
const RecommendationLog = require('../models/RecommendationLog');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const { createFirebaseUser, isMockMode, admin } = require('../config/firebaseAdmin');

exports.getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const skip = (page - 1) * limit;
        const users = await User.find(query).skip(skip).limit(Number(limit)).select('-password');
        const total = await User.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            users,
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

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }
        res.status(200).json(new ApiResponse(200, { user }));
    } catch (error) {
        next(error);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, {
            new: true,
            runValidators: true
        }).select('-password');
        
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }
        res.status(200).json(new ApiResponse(200, { user }));
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        if (user.firebaseUid && !user.firebaseUid.startsWith('mock-')) {
            try {
                if (!isMockMode) {
                    await admin.auth().deleteUser(user.firebaseUid);
                }
            } catch (fbErr) {
                console.warn("⚠️ Failed to delete user from Firebase auth, continuing:", fbErr.message);
            }
        }

        await user.deleteOne();
        res.status(200).json(new ApiResponse(200, {}, 'User deleted successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFoods = await Food.countDocuments();
        const totalRecommendations = await RecommendationLog.countDocuments();
        
        res.status(200).json(new ApiResponse(200, {
            stats: {
                totalUsers,
                totalFoods,
                totalRecommendations
            }
        }));
    } catch (error) {
        next(error);
    }
};

exports.getRecommendationLogs = async (req, res, next) => {
    try {
        const logs = await RecommendationLog.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(new ApiResponse(200, { logs }));
    } catch (error) {
        next(error);
    }
};

exports.createNutritionist = async (req, res, next) => {
    try {
        const { name, email, password, specialty, experience, bio, location, phone, availability, avatar } = req.body;
        
        const userExists = await User.findOne({ email: email?.toLowerCase() });
        if (userExists) {
            return next(new ApiError(400, 'User already exists with this email'));
        }

        let firebaseUid = `mock-uid-${email.toLowerCase()}`;
        try {
            firebaseUid = await createFirebaseUser(email, password, name);
        } catch (fbErr) {
            console.warn("⚠️ Firebase user creation failed, falling back to local MongoDB entry:", fbErr.message);
        }

        const nutritionist = await User.create({
            name,
            email: email?.toLowerCase(),
            password,
            firebaseUid,
            role: 'nutritionist',
            avatar: avatar || 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300',
            nutritionistProfile: {
                specialty,
                experience,
                bio,
                location,
                phone,
                availability
            }
        });

        res.status(201).json(new ApiResponse(201, { nutritionist }, 'Nutritionist created successfully'));
    } catch (error) {
        next(error);
    }
};
