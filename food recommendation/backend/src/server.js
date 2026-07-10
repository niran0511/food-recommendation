require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const foodRoutes = require('./routes/food.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const mealplanRoutes = require('./routes/mealplan.routes');
const healthRoutes = require('./routes/health.routes');
const adminRoutes = require('./routes/admin.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const chatRoutes = require('./routes/chat.routes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({

    origin: (origin, callback) => callback(null, true),

    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/meal-plans', mealplanRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/nutritionist', require('./routes/nutritionist.routes'));
app.use('/api/diseases', require('./routes/disease.routes'));

app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
