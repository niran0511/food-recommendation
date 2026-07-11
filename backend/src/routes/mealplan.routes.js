const express = require('express');
const { createOrUpdateMealPlan, getPatientMealPlan, getMyMealPlan } = require('../controllers/mealPlan.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/patient/:userId', authorize('nutritionist'), createOrUpdateMealPlan);
router.get('/patient/:userId', authorize('nutritionist'), getPatientMealPlan);
router.get('/my-plan', getMyMealPlan);

module.exports = router;
