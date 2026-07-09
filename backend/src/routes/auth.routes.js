const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, logout, refreshToken } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),

    body('firebaseUid').notEmpty().withMessage('Firebase UID is required')
];

const loginValidation = [
    body('email').isEmail().withMessage('Please include a valid email')

];

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
