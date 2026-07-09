<<<<<<< HEAD
# 🍽️ AI-Powered Health-Based Food Recommendation System

An intelligent health assistant that analyzes user health profiles and generates personalized food recommendations using Machine Learning and AI techniques.

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-20+-brightgreen)
![Python](https://img.shields.io/badge/python-3.12+-blue)
![React](https://img.shields.io/badge/react-18+-61dafb)
![MongoDB](https://img.shields.io/badge/mongodb-7+-47A248)

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│  React Frontend  │────▶│  Express Backend  │────▶│  FastAPI AI      │
│  (Vite + TW)     │     │  (Node.js)        │     │  (Python ML)     │
│  Port: 3000      │     │  Port: 5000       │     │  Port: 8000      │
│                  │     │                  │     │                  │
└──────────────────┘     └────────┬─────────┘     └──────────────────┘
                                  │
                         ┌────────▼─────────┐
                         │                  │
                         │    MongoDB       │
                         │    Port: 27017   │
                         │                  │
                         └──────────────────┘
```

## ✨ Features

### AI & Machine Learning
- **Hybrid Recommendation Engine** — Content-Based Filtering, Cosine Similarity, Random Forest, XGBoost, MCDA/TOPSIS
- **Explainable AI** — Every recommendation includes detailed reasons (why recommended & why to avoid)
- **Health Risk Prediction** — ML-based prediction of obesity, diabetes, hypertension, heart disease risks
- **Nutritional Deficiency Detection** — Identifies nutrient gaps and suggests corrective foods
- **Personalized Scoring** — AI learns from user preferences, conditions, and goals

### Health & Nutrition
- **BMI/BMR/TDEE Calculator** — Automatic health metric calculations
- **Daily Meal Planner** — AI-generated breakfast, lunch, dinner, and snack plans
- **Weekly Diet Plans** — Complete 7-day personalized meal schedules
- **Nutrition Analysis** — Macro and micro nutrient tracking with charts
- **Calorie Balancing** — Automatic distribution across meals

### User Experience
- **5,000+ Food Database** — Comprehensive nutritional data across 7+ cuisines
- **Multi-Step Registration** — Guided health profile setup
- **Personalized Dashboard** — BMI gauge, calorie tracker, health score, progress charts
- **Dark/Light Theme** — Premium glassmorphism design
- **Mobile-First** — Fully responsive design
- **Admin Panel** — User management, food CRUD, analytics

### Security
- **JWT Authentication** — Access + Refresh token strategy
- **HttpOnly Cookies** — Secure token storage
- **Role-Based Access** — User and Admin roles
- **Rate Limiting** — API protection
- **Input Validation** — Express-validator on all endpoints

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 4, Chart.js, Framer Motion |
| Backend | Node.js, Express.js, Mongoose |
| AI Service | Python, FastAPI, Scikit-learn, XGBoost, NumPy, Pandas |
| Database | MongoDB 7 |
| Auth | JWT (jsonwebtoken) |
| Images | Cloudinary |
| Docs | Swagger (OpenAPI 3.0) |
| Container | Docker, Docker Compose |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- MongoDB 7+ (or Docker)
- Docker & Docker Compose (optional, for containerized setup)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd food-recommendation

# Copy environment file
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up --build

# Access:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:5000
# AI Service: http://localhost:8000
# API Docs:  http://localhost:5000/api-docs
# AI Docs:   http://localhost:8000/docs
```

### Option 2: Manual Setup

#### 1. MongoDB
```bash
# Start MongoDB (if installed locally)
mongod --dbpath /data/db

# Or use Docker for MongoDB only
docker run -d --name mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:7
```

#### 2. AI Service
```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Generate food database (5000+ items)
python scripts/generate_food_data.py

# Train ML models
python scripts/train_models.py

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Backend
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your settings

# Seed the database
npm run seed

# Start the server
npm run dev
```

#### 4. Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user with health profile |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recommendations` | Get AI food recommendations |
| GET | `/api/recommendations/history` | Recommendation history |
| POST | `/api/recommendations/foods-to-avoid` | Foods to avoid |

### Meal Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meal-plans/daily` | Generate daily meal plan |
| POST | `/api/meal-plans/weekly` | Generate weekly meal plan |
| GET | `/api/meal-plans` | Get saved meal plans |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/metrics` | Get health metrics (BMI, BMR, TDEE) |
| POST | `/api/health/risk-assessment` | Health risk prediction |
| POST | `/api/health/nutrition-analysis` | Nutrition analysis |

### Foods
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/foods` | Browse foods with filters |
| GET | `/api/foods/:id` | Get food details |
| POST | `/api/foods` | Create food (admin) |
| PUT | `/api/foods/:id` | Update food (admin) |
| DELETE | `/api/foods/:id` | Delete food (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |

## 📁 Project Structure

```
food-recommendation/
├── frontend/               # React + Tailwind CSS (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context providers
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Helpers & constants
│   ├── Dockerfile
│   └── package.json
│
├── backend/                # Node.js + Express
│   ├── src/
│   │   ├── config/         # DB, Cloudinary, Swagger
│   │   ├── middleware/     # Auth, error handler
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers
│   ├── seeds/              # Database seeders
│   ├── tests/              # Jest tests
│   ├── Dockerfile
│   └── package.json
│
├── ai-service/             # Python FastAPI
│   ├── app/
│   │   ├── services/       # ML engines
│   │   ├── schemas/        # Pydantic models
│   │   ├── utils/          # Feature engineering
│   │   └── data/           # Food database
│   ├── scripts/            # Training & data generation
│   ├── trained_models/     # Serialized ML models
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# AI Service tests
cd ai-service && python -m pytest

# Frontend build check
cd frontend && npm run build
```

## 🤖 ML Model Details

### Recommendation Engine
The system uses a **hybrid approach** combining multiple AI techniques:

1. **Content-Based Filtering** — Cosine similarity on nutritional vectors
2. **ML Classification** — Random Forest & XGBoost for food suitability prediction
3. **Nutritional Scoring** — Weighted scoring based on health goals and conditions
4. **Multi-Criteria Decision Analysis** — TOPSIS for final ranking
5. **Rule-Based Filtering** — Allergen and disease-based food elimination

### Health Risk Prediction
Trained ML models predict:
- Obesity Risk
- Diabetes Risk
- Hypertension Risk
- Heart Disease Risk

### Explainable AI
Every recommendation includes:
- ✔ Reasons why the food is recommended
- ✖ Potential concerns or reasons to limit intake

## 📝 Environment Variables

See `.env.example` for all configuration options.

## 📜 License

MIT License

## 👨‍💻 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
=======
# food recommendation

>>>>>>> 843d1be00973b4f1626346e9e427c402c314a65d
