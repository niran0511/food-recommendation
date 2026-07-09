const express = require('express');
const { getProfile, updateProfile, getFavorites, addFavorite, removeFavorite } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/profile')
    .get(getProfile)
    .put(updateProfile);

router.route('/favorites')
    .get(getFavorites)
    .post(addFavorite)
    .delete(removeFavorite);

module.exports = router;
