const express = require('express');
const { sendChatMessage } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', sendChatMessage);

module.exports = router;
