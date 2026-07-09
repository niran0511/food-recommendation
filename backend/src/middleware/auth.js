
const { verifyFirebaseToken } = require('../config/firebaseAdmin');

const { ApiError } = require('../utils/ApiError');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ApiError(401, 'Not authorized to access this route'));
    }

    try {

        const decoded = await verifyFirebaseToken(token);
        let user = await User.findOne({ firebaseUid: decoded.uid });
        if (!user) {
            user = await User.findOne({ email: decoded.email?.toLowerCase() });
            if (user && decoded.uid) {
                user.firebaseUid = decoded.uid;
                await user.save();
            }
        }
        if (!user) {
            const emailLower = decoded.email?.toLowerCase();
            const isAdmin = emailLower === 'admin@foodrec.com' || emailLower === 'niranjanselvakumar0511@gmail.com';
            user = await User.create({
                name: decoded.name || decoded.email?.split('@')[0] || 'Firebase User',
                email: emailLower || `${decoded.uid}@foodrec.com`,
                firebaseUid: decoded.uid,
                role: isAdmin ? 'admin' : 'user',
                profile: {}
            });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error("Firebase auth verification error", err);

        return next(new ApiError(401, 'Not authorized to access this route'));
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, `User role ${req.user.role} is not authorized to access this route`));
        }
        next();
    };
};

module.exports = { protect, authorize };
