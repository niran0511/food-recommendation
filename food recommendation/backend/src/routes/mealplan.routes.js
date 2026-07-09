const express = require('express');
const { getMealPlans, getMealPlanById, createDailyMealPlan, createWeeklyMealPlan, deleteMealPlan } = require('../controllers/mealplan.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getMealPlans);

router.post('/daily', createDailyMealPlan);
router.post('/weekly', createWeeklyMealPlan);

router.route('/:id')
    .get(getMealPlanById)
    .delete(deleteMealPlan);

module.exports = router;
