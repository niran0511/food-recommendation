const DiseaseRule = require('../models/DiseaseRule');
const { ApiResponse } = require('../utils/ApiResponse');

exports.getAICopilotAdvice = async (req, res, next) => {
    try {
        const { 
            bloodSugarLevel, 
            bloodPressureSystolic, 
            bloodPressureDiastolic, 
            cholesterolLevel, 
            weight 
        } = req.body;

        const sugar = Number(bloodSugarLevel) || 0;
        const sys = Number(bloodPressureSystolic) || 0;
        const dia = Number(bloodPressureDiastolic) || 0;
        const chol = Number(cholesterolLevel) || 0;
        const w = Number(weight) || 0;

        let notesList = [];
        let avoidList = new Set();
        let boostList = new Set();
        let healthScore = 100;
        let caloriesTarget = 2200;

        // Query all active rules
        const rules = await DiseaseRule.find({ isActive: true });

        // 1. Analyze sugar
        if (sugar >= 100) {
            const rule = rules.find(r => r.disease.toLowerCase().includes('diabet'));
            if (rule) {
                notesList.push(`• Sugar level is ${sugar} mg/dL (Elevated). ${rule.description || 'Pre-diabetic state detected.'}`);
                rule.avoidNutrients.forEach(n => avoidList.add(n));
                rule.boostNutrients.forEach(n => boostList.add(n));
            } else {
                notesList.push(`• Sugar level is ${sugar} mg/dL (Elevated). Restrict simple sugars and simple carbohydrates.`);
            }
            healthScore -= (sugar >= 126 ? 15 : 10);
            caloriesTarget -= 150;
        }

        // 2. Analyze blood pressure
        if (sys >= 120 || dia >= 80) {
            const rule = rules.find(r => r.disease.toLowerCase().includes('hyper') || r.disease.toLowerCase().includes('tension'));
            if (rule) {
                notesList.push(`• Blood Pressure is ${sys}/${dia} mmHg (Elevated). ${rule.description || 'Hypertensive state detected.'}`);
                rule.avoidNutrients.forEach(n => avoidList.add(n));
                rule.boostNutrients.forEach(n => boostList.add(n));
            } else {
                notesList.push(`• Blood Pressure is ${sys}/${dia} mmHg (Elevated). Restrict table salt and sodium-rich dressings.`);
            }
            healthScore -= ((sys >= 140 || dia >= 90) ? 15 : 10);
            caloriesTarget -= 50;
        }

        // 3. Analyze cholesterol
        if (chol >= 200) {
            const rule = rules.find(r => r.disease.toLowerCase().includes('heart') || r.disease.toLowerCase().includes('cholest'));
            if (rule) {
                notesList.push(`• Total Cholesterol is ${chol} mg/dL (High). ${rule.description || 'Hypercholesterolemia risks.'}`);
                rule.avoidNutrients.forEach(n => avoidList.add(n));
                rule.boostNutrients.forEach(n => boostList.add(n));
            } else {
                notesList.push(`• Total Cholesterol is ${chol} mg/dL (High). Avoid saturated fats, trans-fats, and high cholesterol foods.`);
            }
            healthScore -= (chol >= 240 ? 15 : 10);
            caloriesTarget -= 100;
        }

        // Default healthy advice
        if (notesList.length === 0) {
            notesList.push("• Vitals are within normal clinical thresholds. Continue general fitness diet splits.");
        }

        // Assemble avoid/boost advice
        let avoidStr = avoidList.size > 0 ? Array.from(avoidList).join(', ') : 'None';
        let boostStr = boostList.size > 0 ? Array.from(boostList).join(', ') : 'None';

        const finalAdvice = `
Diagnostic Assessment Summary:
${notesList.join('\n')}

Dietary Directives:
- Avoid / Limit Nutrients: ${avoidStr}
- Boost / Prioritize Nutrients: ${boostStr}

Suggested Clinician Advice:
- Increase water intake to 2.5L+ to support renal clearance.
- Maintain a structured exercise split of 30-45 minutes daily.
- Limit intake of processed foods and replace with whole grains and leafy greens.
`.trim();

        res.status(200).json(new ApiResponse(200, {
            notes: finalAdvice,
            caloriesTarget: Math.max(1600, caloriesTarget),
            healthScore: Math.max(50, healthScore)
        }, "AI Copilot analysis complete"));

    } catch (error) {
        next(error);
    }
};
