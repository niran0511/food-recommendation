const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Food = require('../src/models/Food');
const User = require('../src/models/User');

dotenv.config({ path: './.env' });

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding');

        // Clean existing collections
        await Food.deleteMany();
        await User.deleteMany();
        console.log('Existing users and foods cleared.');

        // 1. Seed Admin User
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@foodrec.com',
            password: 'password123',
            role: 'admin',
            profile: {
                age: 30,
                gender: 'Male',
                height: 180,
                weight: 80,
                activityLevel: 'Moderately Active',
                goal: 'Healthy Eating',
                dietType: 'Non-Vegetarian'
            }
        });
        console.log('Default Admin user created: admin@foodrec.com / password153');

        // 2. Load and Seed Foods from AI service database
        let foodJsonPath = path.join(__dirname, './food_database.json');
        if (!fs.existsSync(foodJsonPath)) {
            // Fallback for local folder structure
            foodJsonPath = path.join(__dirname, '../../ai-service/app/data/food_database.json');
        }
        
        if (fs.existsSync(foodJsonPath)) {
            const rawFoods = JSON.parse(fs.readFileSync(foodJsonPath, 'utf8'));
            console.log(`Loaded ${rawFoods.length} foods from AI service database. Seeding...`);
            
            // Map keys in case of small schema mismatches
            const formattedFoods = rawFoods.map(f => ({
                name: f.name,
                image: f.image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(f.name)}`,
                category: f.category,
                cuisine: f.cuisine,
                calories: f.calories,
                protein: f.protein,
                carbohydrates: f.carbohydrates,
                fat: f.fat,
                fiber: f.fiber || 0,
                sugar: f.sugar || 0,
                sodium: f.sodium || 0,
                potassium: f.potassium || 0,
                calcium: f.calcium || 0,
                iron: f.iron || 0,
                vitamin_a: f.vitamin_a || 0,
                vitamin_b: f.vitamin_b || 0,
                vitamin_c: f.vitamin_c || 0,
                vitamin_d: f.vitamin_d || 0,
                vitamin_e: f.vitamin_e || 0,
                cholesterol: f.cholesterol || 0,
                omega_3: f.omega_3 || 0,
                ingredients: f.ingredients || [],
                allergens: f.allergens || [],
                cooking_time: f.cooking_time || 15,
                difficulty: f.difficulty || 'Easy',
                price: f.price || 'Medium',
                rating: f.rating || 4.5,
                meal_type: f.meal_type || [f.category],
                suitable_for: f.suitable_for || [],
                avoid_for: f.avoid_for || [],
                diet_type: f.diet_type || ['Non-Vegetarian']
            }));

            // Bulk insert formatted foods
            await Food.insertMany(formattedFoods);
            console.log('Food database seeded successfully!');
        } else {
            console.log('AI service food_database.json not found. Skipping food seeding.');
        }

        console.log('Seeding process complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    }
};

seedDB();
