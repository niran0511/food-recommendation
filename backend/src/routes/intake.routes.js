const express = require('express');
const { submitIntake, getIntake, getPatientIntake } = require('../controllers/intake.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', submitIntake);
router.get('/', getIntake);
router.get('/patient/:userId', authorize('nutritionist'), getPatientIntake);

module.exports = router;
