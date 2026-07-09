const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
        type: String,


        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },

    avatar: String,
    profile: {
        age: Number,
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other']
        },
        height: Number, // cm
        weight: Number, // kg
        bmi: Number,
        activityLevel: {
            type: String,
            enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete']
        },
        goal: {
            type: String,
            enum: ['Weight Loss', 'Weight Gain', 'Muscle Gain', 'Fat Loss', 'Maintain Weight', 'Healthy Eating']
        },
        dietType: {
            type: String,
            enum: ['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Vegetarian']
        },
        cuisinePreference: [String],
        budget: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        mealFrequency: {
            type: Number,
            default: 3
        },
        diseases: [String],
        allergies: [String],
        deficiencies: [String]
    },
    refreshToken: String,
    favorites: [String]
}, {
    timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Auto calculate BMI
    if (this.profile && this.profile.height && this.profile.weight) {
        const heightM = this.profile.height / 100;
        this.profile.bmi = Math.round((this.profile.weight / (heightM * heightM)) * 10) / 10;
    }
});

// Match user entered password to hashed password in database
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
    });
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'
    });
};

module.exports = mongoose.model('User', UserSchema);
