const express = require('express');
const { getDashboard, getNutritionSummary } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/nutrition-summary', getNutritionSummary);

module.exports = router;
