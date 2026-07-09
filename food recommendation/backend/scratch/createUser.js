const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config({ path: './.env' });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB:", process.env.MONGO_URI);
    
    await User.deleteMany({});
    console.log("Cleared users collection");
    
    const user = await User.create({
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
    console.log("Created user:", user.email);
    
    const found = await User.findOne({ email: 'admin@foodrec.com' });
    console.log("Found user in DB:", found ? found.email : 'NOT FOUND');
    
    process.exit(0);
  } catch (e) {
    console.error("Error creating user:", e);
    process.exit(1);
  }
};

run();
