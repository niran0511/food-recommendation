const express = require('express');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');
const { getAICopilotAdvice } = require('../controllers/aiCopilot.controller');

const router = express.Router();

router.use(protect);
router.use(authorize('nutritionist'));

// 1. Post health record update for a specific user
router.post('/records/:userId', async (req, res) => {
    try {
        const { 
            weight, caloriesConsumed, caloriesTarget, waterIntake, healthScore, notes,
            bloodPressureSystolic, bloodPressureDiastolic, bloodSugarLevel, heartRate,
            cholesterolLevel, sleepHours, exerciseMinutes, mood, medications, dietaryCompliance
        } = req.body;
        const targetUserId = req.params.userId;

        // Check if user exists
        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create health record
        const record = await HealthRecord.create({
            userId: targetUserId,
            weight,
            caloriesConsumed,
            caloriesTarget,
            waterIntake,
            healthScore,
            notes,
            bloodPressureSystolic,
            bloodPressureDiastolic,
            bloodSugarLevel,
            heartRate,
            cholesterolLevel,
            sleepHours,
            exerciseMinutes,
            mood,
            medications,
            dietaryCompliance,
            date: new Date()
        });

        // Update current weight and BMI in User model for active calculation
        if (weight) {
            user.profile.weight = weight;
            if (user.profile.height) {
                const heightM = user.profile.height / 100;
                user.profile.bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
            }
            await user.save();
        }

        // Send a notification to the user
        await Notification.create({
            userId: targetUserId,
            title: 'Health Profile Updated',
            message: `Nutritionist ${req.user.name} has logged a new health update for you. Notes: ${notes || 'No notes provided.'}`,
            type: 'success'
        });

        res.status(201).json({ success: true, data: record });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 2. Get list of patients for directory (only those who booked appointments with this nutritionist)
router.get('/users', async (req, res) => {
    try {
        const { search } = req.query;
        
        // Find all appointments booked with this nutritionist
        const appointments = await Appointment.find({
            $or: [
                { doctorId: req.user.id },
                { doctorName: req.user.name }
            ]
        });
        
        const userIds = appointments.map(appt => appt.userId);
        
        let query = { _id: { $in: userIds }, role: 'user' };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const users = await User.find(query)
            .select('name email profile createdAt')
            .sort({ name: 1 });

        res.status(200).json({ success: true, data: { users } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 3. AI Copilot diagnostic advice helper
router.post('/ai-copilot', getAICopilotAdvice);

module.exports = router;
