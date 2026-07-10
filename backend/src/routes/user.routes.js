const express = require('express');
const { getProfile, updateProfile, getFavorites, addFavorite, removeFavorite, getNutritionists } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/nutritionists', getNutritionists);

router.route('/profile')
    .get(getProfile)
    .put(updateProfile);

router.route('/favorites')
    .get(getFavorites)
    .post(addFavorite)
    .delete(removeFavorite);

module.exports = router;
