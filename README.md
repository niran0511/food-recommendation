# NutriAI — Personalized Food Recommendation & Nutritionist Portal

**Live Application**: [https://healthybiteai.vercel.app/](https://healthybiteai.vercel.app/)

NutriAI is an advanced web application designed to offer automated, personalized food recommendations alongside a professional, feature-rich nutritionist consultation platform. It enables users to track daily vitals, get ML-driven diet recommendations, complete pre-consultation intake forms, and hold telehealth/chat appointments with qualified nutritionists.

---

## 🚀 Key Features

### 👤 User Features
* **AI Recommendation Engine**: Hybrid machine learning (Random Forest model) + clinical heuristics to recommend recipes matching your metrics, goals, allergies, and diseases.
* **Vitals & Nutrition Tracker**: Log daily calories, water, macronutrients, and monitor health scores.
* **Onboarding & Profiling**: Profile wizard to customize age, BMI, activity level, health goals, and medical history.
* **Telehealth Hub**: Chat with assigned nutritionists and click to join video calls.
* **Pre-Consultation Questionnaire**: Intake forms to log dietary barriers, budgets, and schedules.

### 🩺 Nutritionist Console
* **Appointment Tracker**: Review, approve, or reschedule patient bookings.
* **Patient CRM & History**: View detailed records, logged vitals, and previous intake responses.
* **Weekly Meal Plan Builder**: Interactive day-by-day diet scheduler.
* **AI Copilot Assist**: Generates clinician remarks and target calories with one click.
* **Interactive Charts**: Chart.js visualizations for weight loss, sugar levels, and blood pressure trends.

### 🛡️ Admin Panel
* **Platform Metrics**: View total users, foods list, and recommendation system logs.
* **Role Management**: Control user roles (User, Admin, Nutritionist).
* **Staff Creation**: Create verified nutritionist profiles linked to Firebase authentication.

---

## 🛠️ Technology Stack

| Component | Tech Stack |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS, Framer Motion, Chart.js, Lucide Icons |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Firebase Admin SDK |
| **AI Service** | Python, FastAPI, Scikit-learn (Random Forest), Pandas, NumPy |
| **Auth** | Firebase Authentication (OAuth & Email/Password verification) |
| **Video Calls** | Jitsi Meet Integration |

---

## 📐 Architecture Diagram

```
                 +------------------------+
                 |     Browser (React)    |
                 +-----------+------------+
                             |
         +-------------------+-------------------+
         | (Auth ID Token)   | (Direct Auth)     | (Video)
         v                   v                   v
+--------+---------+  +------+------+  +---------+--------+
| Express Backend  |  | Firebase    |  | Jitsi Video Meet |
| (Node / MongoDB) |  | Auth        |  +------------------+
+--------+---------+  +-------------+
         |
         | (Local Proxy Call)
         v
+--------+---------+
| FastAPI Service  | <--- Loads Scikit-learn Random Forest Model
| (Python ML Engine)|
+------------------+
```

---

## ⚙️ Setup and Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (v3.10+)
* [MongoDB](https://www.mongodb.com/) (running instance)
* Firebase Project credentials

---

### Step 1: Environment Variables Configuration

Create `.env` files in each service directory:

#### 1. Backend Env (`backend/.env`)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/foodrec
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRY=7d
AI_SERVICE_URL=http://localhost:8000
# Optional: Path to Firebase admin service account key file
FIREBASE_SERVICE_ACCOUNT_KEY=./src/config/firebase-service-account.json
```

#### 2. Frontend Env (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

#### 3. AI Service Env (`ai-service/.env`)
```env
PORT=8000
HOST=0.0.0.0
```

---

### Step 2: Running Locally

#### Option A: Docker Compose (Recommended)
Build and run the entire ecosystem using Docker:
```bash
docker-compose up --build
```

#### Option B: Manual Execution (Development)

##### 1. Start the AI Service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

##### 2. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

##### 3. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Authentication Flow
* **Verification**: API endpoints are protected by middleware verifying the Firebase ID token in the request header (`Authorization: Bearer <token>`).
* **Database Mapping**: Backend auth middleware extracts the Firebase UID, matches it with the User document in MongoDB, and populates `req.user` with role authorization rights (`user`, `admin`, `nutritionist`).
* **Fallback Mode**: In the absence of a Firebase environment configuration locally, the backend runs in a fallback development mode where standard JWTs can decode user profiles directly for convenience.
