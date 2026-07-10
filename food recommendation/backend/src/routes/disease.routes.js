const express = require('express');
const DiseaseRule = require('../models/DiseaseRule');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all rules (public / protect)
router.get('/', protect, async (req, res) => {
    try {
        let rules = await DiseaseRule.find();
        
        // Seed default rules if empty
        if (rules.length === 0) {
            const defaults = [
                {
                    disease: 'Diabetes',
                    avoidNutrients: ['Sugar', 'Simple Carbs'],
                    boostNutrients: ['Fiber', 'Chromium'],
                    description: 'Focus on low glycemic index foods, lean proteins, and complex carbohydrates.'
                },
                {
                    disease: 'Hypertension',
                    avoidNutrients: ['Sodium', 'High Salt'],
                    boostNutrients: ['Potassium', 'Calcium'],
                    description: 'Focus on low sodium, heart-healthy fats, and mineral-rich vegetables.'
                },
                {
                    disease: 'Heart Disease',
                    avoidNutrients: ['Cholesterol', 'Saturated Fat'],
                    boostNutrients: ['Omega 3', 'Fiber'],
                    description: 'Prioritize soluble fiber, healthy monounsaturated and polyunsaturated fats.'
                },
                {
                    disease: 'Obesity',
                    avoidNutrients: ['High Calorie', 'High Sugar'],
                    boostNutrients: ['Lean Protein', 'Fiber'],
                    description: 'Caloric deficit diet emphasizing protein satiety and dietary fiber.'
                },
                {
                    disease: 'Thyroid Disorders',
                    avoidNutrients: ['Soy', 'Gluten'],
                    boostNutrients: ['Iodine', 'Selenium'],
                    description: 'Support thyroid function with trace elements and clean protein sources.'
                },
                {
                    disease: 'Anemia',
                    avoidNutrients: ['Excess Calcium'],
                    boostNutrients: ['Iron', 'Vitamin C'],
                    description: 'Maximize iron absorption by pairing iron-rich foods with Vitamin C.'
                }
            ];
            rules = await DiseaseRule.create(defaults);
        }
        
        res.status(200).json({ success: true, data: rules });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create rule (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { disease, avoidNutrients, boostNutrients, description } = req.body;
        if (!disease) {
            return res.status(400).json({ success: false, message: 'Disease name is required' });
        }
        
        const existing = await DiseaseRule.findOne({ disease: new RegExp(`^${disease}$`, 'i') });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Rule already exists for this disease' });
        }
        
        const rule = await DiseaseRule.create({
            disease,
            avoidNutrients,
            boostNutrients,
            description
        });
        
        res.status(201).json({ success: true, data: rule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update rule (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const rule = await DiseaseRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!rule) {
            return res.status(404).json({ success: false, message: 'Disease rule not found' });
        }
        res.status(200).json({ success: true, data: rule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete rule (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const rule = await DiseaseRule.findById(req.params.id);
        if (!rule) {
            return res.status(404).json({ success: false, message: 'Disease rule not found' });
        }
        await rule.deleteOne();
        res.status(200).json({ success: true, message: 'Disease rule deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
