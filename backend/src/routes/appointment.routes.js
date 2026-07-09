const express = require('express');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// 1. Create a consultation booking
router.post('/', async (req, res) => {
    try {
        const { doctorName, specialty, date, time, reason } = req.body;
        if (!doctorName || !specialty || !date || !time) {
            return res.status(400).json({ success: false, message: 'All booking fields are required' });
        }
        const appt = await Appointment.create({
            userId: req.user.id,
            userName: req.user.name,
            doctorName,
            specialty,
            date,
            time,
            reason
        });
        res.status(201).json({ success: true, data: appt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 2. Fetch logged-in user's bookings
router.get('/', async (req, res) => {
    try {
        const appts = await Appointment.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: appts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 3. Admin: Fetch all bookings
router.get('/admin', authorize('admin'), async (req, res) => {
    try {
        const appts = await Appointment.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: appts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 4. Admin: Accept/Reject booking status
router.put('/admin/:id/status', authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const appt = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!appt) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.status(200).json({ success: true, data: appt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
