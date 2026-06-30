const express = require('express');
const { getFoods, getFoodById, createFood, updateFood, deleteFood } = require('../controllers/food.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getFoods)
    .post(protect, authorize('admin'), createFood);

router.route('/:id')
    .get(getFoodById)
    .put(protect, authorize('admin'), updateFood)
    .delete(protect, authorize('admin'), deleteFood);

module.exports = router;
