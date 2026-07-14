const express = require('express');
const { createOrUpdateMealPlan, getPatientMealPlan, getMyMealPlan, getDailyMealPlan, getWeeklyMealPlan } = require('../controllers/mealplan.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/patient/:userId', authorize('nutritionist'), createOrUpdateMealPlan);
router.get('/patient/:userId', authorize('nutritionist'), getPatientMealPlan);
router.get('/my-plan', getMyMealPlan);

router.post('/daily', getDailyMealPlan);
router.post('/weekly', getWeeklyMealPlan);

module.exports = router;
