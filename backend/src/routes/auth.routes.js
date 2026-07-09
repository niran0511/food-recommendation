const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, logout, refreshToken } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Please enter a password with 6 or more characters')
];

const loginValidation = [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required')
];

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
