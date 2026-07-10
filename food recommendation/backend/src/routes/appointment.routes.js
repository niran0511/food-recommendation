const express = require('express');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
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

        // Notify admin/nutritionist about booking request
        // (For simplicity we just notify the user that their request was submitted)
        await Notification.create({
            userId: req.user.id,
            title: 'Consultation Requested',
            message: `Your booking request for Dr. ${doctorName} on ${date} at ${time} is pending review.`,
            type: 'info'
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

// 2.5 Nutritionist: Fetch my appointments (doctorName matches user.name)
router.get('/nutritionist', authorize('nutritionist'), async (req, res) => {
    try {
        // Query both case-insensitively or via exact matches
        // Also support both with and without "Dr." prefix
        const cleanName = req.user.name.replace(/^dr\.\s+/i, '');
        const nameRegex = new RegExp(`^(dr\\.\\s+)?${cleanName}$`, 'i');
        const appts = await Appointment.find({ doctorName: nameRegex }).sort({ createdAt: -1 });
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

// 4. Admin & Nutritionist: Accept/Reject booking status
router.put('/admin/:id/status', authorize('admin', 'nutritionist'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const appt = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!appt) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Trigger Notification to patient
        await Notification.create({
            userId: appt.userId,
            title: status === 'accepted' ? 'Appointment Confirmed' : 'Appointment Declined',
            message: `Your consultation request with ${appt.doctorName} on ${appt.date} at ${appt.time} was ${status}.`,
            type: status === 'accepted' ? 'success' : 'alert'
        });

        res.status(200).json({ success: true, data: appt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
