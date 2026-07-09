const express = require('express');
const { getHealthMetrics, getRiskAssessment, saveHealthRecord, getHealthRecords } = require('../controllers/health.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/metrics', getHealthMetrics);
router.post('/risk-assessment', getRiskAssessment);
router.route('/records')
    .get(getHealthRecords)
    .post(saveHealthRecord);

module.exports = router;
