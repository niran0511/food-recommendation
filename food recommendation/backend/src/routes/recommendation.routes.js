const express = require('express');
const { getRecommendations, getRecommendationHistory, getFoodsToAvoid } = require('../controllers/recommendation.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', getRecommendations);
router.get('/history', getRecommendationHistory);
router.post('/foods-to-avoid', getFoodsToAvoid);

module.exports = router;
