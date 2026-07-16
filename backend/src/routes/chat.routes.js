const express = require('express');
const { sendMessage, getChatHistory, getAIChatbotResponse } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', getAIChatbotResponse);
router.post('/send', sendMessage);
router.get('/history/:userId', getChatHistory);

module.exports = router;
