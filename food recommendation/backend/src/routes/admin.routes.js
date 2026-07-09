const express = require('express');
const { getUsers, getUser, updateUserRole, deleteUser, getStats, getRecommendationLogs } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/recommendations/logs', getRecommendationLogs);
router.route('/users')
    .get(getUsers);

router.route('/users/:id')
    .get(getUser)
    .delete(deleteUser);

router.put('/users/:id/role', updateUserRole);

module.exports = router;
