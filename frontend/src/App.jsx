// NutriAI - Premium AI Food Recommendation & Pathological Risk Assessment System
<<<<<<< HEAD
// GitHub Desktop Commit Verification Success
=======
// GitHub Desktop Commit Verification Success - Subfolder Version
>>>>>>> 843d1be00973b4f1626346e9e427c402c314a65d
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Layout components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ChatWidget from './components/common/ChatWidget';
import DashboardLayout from './components/common/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import RecommendationsPage from './pages/RecommendationsPage';
import MealPlannerPage from './pages/MealPlannerPage';
import NutritionPage from './pages/NutritionPage';
import FoodSearchPage from './pages/FoodSearchPage';
import ProfilePage from './pages/ProfilePage';
import HealthRiskPage from './pages/HealthRiskPage';
import DoctorsPage from './pages/DoctorsPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);
  const isDashboardLayout = [
    '/dashboard', 
    '/recommendations', 
    '/meal-planner', 
    '/nutrition', 
    '/food-search', 
    '/profile', 
    '/health-risk',
    '/doctors'
  ].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col text-[var(--color-text)] transition-colors duration-300 relative overflow-hidden">
      
      {/* Animated Background Gradients (only show for non-admin routes to preserve dark control look) */}
      {!isAdminRoute && !isDashboardLayout && !isAuthRoute && (
        <div className="fixed inset-0 z-[-1] bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/20 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-400/20 dark:bg-indigo-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
      )}

      {!isAdminRoute && !isDashboardLayout && !isAuthRoute && <Navbar />}
      
      <main className={`flex-grow ${isAdminRoute || isDashboardLayout || isAuthRoute ? '' : 'pt-24 pb-12'} relative z-10`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            {/* Unified Sidebar Dashboard Layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/meal-planner" element={<MealPlannerPage />} />
              <Route path="/nutrition" element={<NutritionPage />} />
              <Route path="/food-search" element={<FoodSearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/health-risk" element={<HealthRiskPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
            </Route>
          </Route>

          {/* Admin Route */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      {!isAdminRoute && !isDashboardLayout && !isAuthRoute && <Footer />}
      {!isAdminRoute && !isDashboardLayout && !isAuthRoute && <ChatWidget />}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
