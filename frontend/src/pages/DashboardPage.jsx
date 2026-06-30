import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Activity, Apple, ChevronRight, Droplets, Flame, 
  TrendingUp, Award, Heart, ShieldAlert, BookOpen, Clock,
  Search, Mic, Image, Sparkles, Filter, CheckCircle, ShieldX,
  FileText, Plus, BarChart2, Star, PlusCircle, ArrowRight, Check, CheckSquare, Square
} from 'lucide-react';
import { getFoodImage, getRecipeDetails } from '../utils/recipeHelper';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ChartJS import and setup
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Gamification & Tracker states with persistent LocalStorage
  const [waterLogged, setWaterLogged] = useState(() => {
    return Number(localStorage.getItem('dashboard_water_logged')) || 1.2;
  });
  const [caloriesLogged, setCaloriesLogged] = useState(() => {
    return Number(localStorage.getItem('dashboard_calories_logged')) || 1240;
  });
  const [proteinLogged, setProteinLogged] = useState(() => {
    return Number(localStorage.getItem('dashboard_protein_logged')) || 74;
  });
  const [mealsEaten, setMealsEaten] = useState(() => {
    const saved = localStorage.getItem('dashboard_meals_eaten');
    return saved ? JSON.parse(saved) : { Breakfast: true, Lunch: true, Dinner: false, Snacks: false };
  });
  const [groceryChecked, setGroceryChecked] = useState({});
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const getDashboardWorkouts = () => {
    if (!riskAssessment) return [];
    const list = [];
    if (riskAssessment.obesity_risk > 0.4) {
      list.push({
        title: "HIIT Weight Shred",
        duration: "30 min",
        type: "Cardio Focus",
        reason: "obesity prevention"
      });
    }
    if (riskAssessment.diabetes_risk > 0.4) {
      list.push({
        title: "Resistance / Lifting",
        duration: "45 min",
        type: "Weight Training",
        reason: "glucose regulation"
      });
    }
    if (riskAssessment.hypertension_risk > 0.4 || riskAssessment.heart_disease_risk > 0.4) {
      list.push({
        title: "Cardio Heart Pace",
        duration: "30 min",
        type: "Low-Impact Cardio",
        reason: "vascular health"
      });
    }
    if (list.length === 0) {
      list.push({
        title: "General Fitness Condition",
        duration: "40 min",
        type: "Mixed Conditioning",
        reason: "premium vitals maintenance"
      });
    }
    return list;
  };

  // Filter chips options
  const filterChips = [
    'All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 
    'Vegetarian', 'Vegan', 'High Protein', 'Low Carb', 
    'Keto', 'Diabetic Friendly', 'Heart Healthy'
  ];

  useEffect(() => {
    localStorage.setItem('dashboard_water_logged', waterLogged);
  }, [waterLogged]);

  useEffect(() => {
    localStorage.setItem('dashboard_calories_logged', caloriesLogged);
  }, [caloriesLogged]);

  useEffect(() => {
    localStorage.setItem('dashboard_protein_logged', proteinLogged);
  }, [proteinLogged]);

  useEffect(() => {
    localStorage.setItem('dashboard_meals_eaten', JSON.stringify(mealsEaten));
  }, [mealsEaten]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsRes, favsRes, historyRes, recsRes, riskRes] = await Promise.all([
          api.get('/health/metrics'),
          api.get('/users/favorites').catch(() => ({ data: { data: { favorites: [] } } })),
          api.get('/recommendations/history').catch(() => ({ data: { data: { logs: [] } } })),
          api.post('/recommendations').catch(() => ({ data: { data: { recommendations: [] } } })),
          api.post('/health/risk-assessment').catch(() => ({ data: { data: { riskAssessment: null } } }))
        ]);
        
        const activeMetrics = metricsRes.data.data.metrics;
        if (!activeMetrics) {
          toast("Please complete your health profile setup!", { icon: '📋' });
          navigate('/onboarding');
          return;
        }
        setMetrics(activeMetrics);
        setFavorites(favsRes.data.data.favorites || []);
        setHistory(historyRes.data.data.logs || []);
        
        if (riskRes.data?.data?.riskAssessment) {
          setRiskAssessment(riskRes.data.data.riskAssessment);
        }
        
        const recList = recsRes.data?.data?.recommendations || [];
        setRecommendations(recList);
        if (recList.length > 0) {
          setSelectedFood(recList[0]); // Default details view
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        toast.error("Failed to load some dashboard details");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleRecommendMe = async () => {
    try {
      setLoading(true);
      const res = await api.post('/recommendations');
      const recList = res.data?.data?.recommendations || [];
      setRecommendations(recList);
      if (recList.length > 0) {
        setSelectedFood(recList[0]);
      }
      toast.success("AI generated fresh recommendations!");
    } catch (e) {
      toast.error("Failed to refresh recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/food-search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleFavorite = async (foodName, e) => {
    e.stopPropagation();
    try {
      const isFav = favorites.includes(foodName);
      if (isFav) {
        await api.delete('/users/favorites', { data: { foodName } });
        setFavorites(prev => prev.filter(f => f !== foodName));
        toast.success("Removed from favorites");
      } else {
        await api.post('/users/favorites', { foodName });
        setFavorites(prev => [...prev, foodName]);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const logWater = (amount) => {
    setWaterLogged(prev => {
      const target = metrics?.water_intake || 2.5;
      const next = Math.round((prev + amount) * 100) / 100;
      if (prev < target && next >= target) {
        toast.success("🎉 Hydration Goal Achieved! Excellent job!");
      } else {
        toast.success(`Logged +${amount * 1000}ml water`);
      }
      return next;
    });
  };

  const toggleMealEaten = (meal, calVal = 400, protVal = 25) => {
    setMealsEaten(prev => {
      const newState = { ...prev, [meal]: !prev[meal] };
      if (newState[meal]) {
        setCaloriesLogged(c => c + calVal);
        setProteinLogged(p => p + protVal);
        toast.success(`Marked ${meal} as completed!`);
      } else {
        setCaloriesLogged(c => Math.max(0, c - calVal));
        setProteinLogged(p => Math.max(0, p - protVal));
        toast(`Removed logs for ${meal}`, { icon: 'ℹ️' });
      }
      return newState;
    });
  };

  const toggleGroceryChecked = (item) => {
    setGroceryChecked(prev => ({ ...prev, [item]: !prev[item] }));
  };

  // Filter recommendations list based on chips selection
  const filteredRecs = recommendations.filter(rec => {
    if (activeFilter === 'All') return true;
    
    const mealMatch = rec.meal_type?.some(m => m.toLowerCase() === activeFilter.toLowerCase()) || 
                      rec.category?.toLowerCase() === activeFilter.toLowerCase();
    if (mealMatch) return true;

    const searchFilter = activeFilter.toLowerCase();
    if (searchFilter === 'vegan' && rec.reasons_for?.some(r => r.toLowerCase().includes('vegan'))) return true;
    if (searchFilter === 'vegetarian' && rec.reasons_for?.some(r => r.toLowerCase().includes('vegetarian'))) return true;
    if (searchFilter === 'high protein' && rec.protein > 20) return true;
    if (searchFilter === 'low carb' && rec.carbohydrates < 25) return true;
    if (searchFilter === 'diabetic friendly' && rec.reasons_for?.some(r => r.toLowerCase().includes('diet') || r.toLowerCase().includes('sugar'))) return true;
    if (searchFilter === 'heart healthy' && rec.reasons_for?.some(r => r.toLowerCase().includes('heart') || r.toLowerCase().includes('hypertension') || r.toLowerCase().includes('sodium'))) return true;
    
    return false;
  });

  if (loading && !metrics) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-500 relative z-10"></div>
        </div>
        <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium">Assembling your premium health space...</p>
      </div>
    );
  }

  const profile = user?.profile || {};
  const currentWeight = profile.weight || 74;
  const targetWeight = profile.goal?.toLowerCase().includes('loss') ? Math.round(currentWeight - 6) : profile.goal?.toLowerCase().includes('gain') ? Math.round(currentWeight + 5) : currentWeight;
  const goalProgress = profile.goal?.toLowerCase().includes('loss') ? 75 : profile.goal?.toLowerCase().includes('gain') ? 60 : 100;

  // Dynamic greetings
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDateString = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  // Smart Swaps logic based on selected food
  const getSmartSwaps = (food) => {
    if (!food) return [];
    const name = food.toLowerCase();
    if (name.includes('rice') || name.includes('carb')) {
      return [
        { from: 'White Rice', to: 'Cauliflower Rice or Quinoa', reason: 'Fewer carbs & higher fiber' }
      ];
    }
    if (name.includes('taco') || name.includes('wrap') || name.includes('bread')) {
      return [
        { from: 'Flour Tortillas', to: 'Lettuce Wraps or Corn Tortillas', reason: 'Reduces glycemic index load' }
      ];
    }
    if (name.includes('paneer') || name.includes('cheese')) {
      return [
        { from: 'Full Fat Cheese', to: 'Low-Fat Cottage Cheese / Tofu', reason: 'Reduces saturated fats' }
      ];
    }
    return [
      { from: 'Table Salt / Dressing', to: 'Himalayan Salt & Lemon Vinaigrette', reason: 'Maintains optimal sodium index' }
    ];
  };

  // Recipe details for Selected Food
  const selectedFoodDetails = selectedFood ? getRecipeDetails(selectedFood.food) : null;
  const smartSwaps = selectedFood ? getSmartSwaps(selectedFood.food) : [];

  // Chart Data calculations
  const weeklyCalorieData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Calories consumed',
      data: [1850, 1680, 1920, 1740, caloriesLogged, 0, 0],
      backgroundColor: '#f59e0b',
      borderRadius: 6,
      borderWidth: 0
    }]
  };

  const doughnutData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    colors: ['#f59e0b', '#3b82f6', '#f97316'],
    datasets: [{
      data: [
        proteinLogged,
        metrics ? Math.round(metrics.daily_carbs - 50) : 150,
        metrics ? Math.round(metrics.daily_fat - 15) : 55
      ],
      backgroundColor: ['#f59e0b', '#3b82f6', '#f97316'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  // Circular progress calculations for SVG
  const renderCircularProgress = (percentage, colorClass, size = 60, strokeWidth = 5) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-slate-250 dark:text-slate-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={colorClass}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
    );
  };

  // Stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Dynamic Header Greeting & Current Date */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-850 dark:text-white">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Explorer'}!
          </h1>
          <p className="text-xs font-semibold text-slate-450 dark:text-slate-500">
            Let's maintain your health goals today.
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm text-xs font-extrabold text-amber-600 dark:text-amber-400">
          📅 {currentDateString}
        </div>
      </motion.div>

      {/* Administrator Redirect Banner */}
      {user?.role === 'admin' && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-500">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-800 dark:text-rose-400">Administrator Console</h4>
              <p className="text-xs text-rose-600/80 dark:text-rose-500/85">You have administrative access to user databases, logs, and seed options.</p>
            </div>
          </div>
          <Link 
            to="/admin" 
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md transition-all whitespace-nowrap"
          >
            Launch Panel
          </Link>
        </div>
      )}

      {/* Hero Header Section */}
      <motion.section 
        variants={itemVariants}
        className="relative rounded-3xl p-8 bg-gradient-to-r from-amber-500 to-orange-600 dark:from-slate-900/60 dark:to-slate-950/40 text-white dark:text-white border border-transparent dark:border-white/5 overflow-hidden shadow-xl"
      >
        <div className="absolute inset-0 bg-grid-white/[0.03] pointer-events-none" />
        <div className="absolute top-[-30%] right-[-10%] w-[350px] h-[350px] rounded-full bg-amber-400/20 dark:bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[20%] w-[250px] h-[250px] rounded-full bg-orange-400/20 dark:bg-orange-500/10 blur-2xl" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 dark:bg-amber-500/20 backdrop-blur-md text-xs font-bold mb-4">
            <Sparkles size={12} className="text-amber-300 animate-pulse" />
            AI Health Assistant
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
            What would you like to eat today?
          </h1>
          <p className="text-amber-100 dark:text-slate-400 font-medium mb-6">
            Search our 5,000+ custom cuisines or let the AI recommendations prepare your diet plan targeting <strong className="underline decoration-amber-300">{profile.goal || 'healthy eating'}</strong>.
          </p>

          {/* AI Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-grow w-full group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask AI for food (e.g. high-protein keto breakfast)..."
                className="w-full bg-white dark:bg-slate-900/80 border border-transparent dark:border-white/5 rounded-2xl pl-12 pr-12 py-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 shadow-md font-medium"
              />
              <Search className="absolute left-4 top-4.5 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
              
              <button 
                type="button" 
                title="Voice Input (simulation)"
                className="absolute right-3 top-3.5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-105 dark:hover:bg-slate-800 transition-all"
              >
                <Mic size={20} />
              </button>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleRecommendMe}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-amber-500 hover:bg-amber-50 dark:hover:bg-amber-400 text-amber-600 dark:text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-95 whitespace-nowrap"
              >
                <Sparkles size={16} />
                Recommend
              </button>
            </div>
          </form>
        </div>
      </motion.section>

      {/* 1. Daily Nutrition Progress Segment (MUST HAVE) */}
      {metrics && (
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Caloric Intake Progress */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Calories Intake</span>
              <Flame className="text-orange-500" size={18} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-black text-slate-850 dark:text-white">{caloriesLogged}</span>
                <span className="text-xs text-slate-400 font-bold">/ {Math.round(metrics.daily_calories)} kcal</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" 
                  style={{ width: `${Math.min((caloriesLogged / metrics.daily_calories) * 100, 100)}%` }}
                />
              </div>
              {/* Quick Log Buttons */}
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => setCaloriesLogged(prev => prev + 100)}
                  className="flex-grow py-1 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-650 dark:text-slate-300 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                >
                  +100 kcal
                </button>
                <button 
                  onClick={() => setCaloriesLogged(prev => prev + 250)}
                  className="flex-grow py-1 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-650 dark:text-slate-300 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                >
                  +250 kcal
                </button>
              </div>
              <p className="text-[10px] text-slate-450 font-medium">
                {Math.round(metrics.daily_calories - caloriesLogged) > 0 
                  ? `${Math.round(metrics.daily_calories - caloriesLogged)} kcal remaining for today`
                  : 'Daily Calorie target completed!'}
              </p>
            </div>
          </div>

          {/* Protein Goal Progress */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Protein Progress</span>
              <Apple className="text-amber-500" size={18} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-black text-slate-850 dark:text-white">{proteinLogged}g</span>
                <span className="text-xs text-slate-400 font-bold">/ {Math.round(metrics.daily_protein)}g target</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-amber-500 transition-all duration-500" 
                  style={{ width: `${Math.min((proteinLogged / metrics.daily_protein) * 100, 100)}%` }}
                />
              </div>
              {/* Quick Log Buttons */}
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => setProteinLogged(prev => prev + 5)}
                  className="flex-grow py-1 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-650 dark:text-slate-300 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                >
                  +5g Protein
                </button>
                <button 
                  onClick={() => setProteinLogged(prev => prev + 15)}
                  className="flex-grow py-1 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-650 dark:text-slate-300 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                >
                  +15g Protein
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {Math.round(metrics.daily_protein - proteinLogged) > 0
                  ? `${Math.round(metrics.daily_protein - proteinLogged)}g protein needed`
                  : 'Protein target completed!'}
              </p>
            </div>
          </div>

          {/* Water Hydration Tracker */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Hydration Tracker</span>
              <Droplets className="text-cyan-500" size={18} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-black text-slate-850 dark:text-white">{waterLogged.toFixed(2)}L</span>
                <span className="text-xs text-slate-400 font-bold">/ {metrics.water_intake.toFixed(1)}L target</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500" 
                  style={{ width: `${Math.min((waterLogged / metrics.water_intake) * 100, 100)}%` }}
                />
              </div>
              {/* Quick Log Buttons */}
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => logWater(0.25)}
                  className="flex-grow py-1 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-650 dark:text-slate-300 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
                >
                  +250ml
                </button>
                <button 
                  onClick={() => logWater(0.5)}
                  className="flex-grow py-1 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-650 dark:text-slate-300 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
                >
                  +500ml
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* 2. Health Alerts, Goal Progress, BMI Gauge & Today's Meal Checklist (Row 2) */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Health Alerts Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4 col-span-1">
          <h3 className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-amber-500" />
            Health Alerts
          </h3>
          <div className="space-y-3.5 pt-1">
            {waterLogged < (metrics?.water_intake || 2.5) * 0.7 ? (
              <div className="flex gap-2.5 items-start text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>Water intake is low. Log 250ml now.</span>
              </div>
            ) : (
              <div className="flex gap-2.5 items-start text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                <span className="shrink-0 mt-0.5">✔</span>
                <span>Hydration goal achieved. Good job!</span>
              </div>
            )}

            {proteinLogged >= (metrics?.daily_protein || 100) ? (
              <div className="flex gap-2.5 items-start text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                <span className="shrink-0 mt-0.5">✔</span>
                <span>Protein goal achieved!</span>
              </div>
            ) : (
              <div className="flex gap-2.5 items-start text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5">
                <span className="shrink-0 mt-0.5">⏳</span>
                <span>Sufficient protein required for target.</span>
              </div>
            )}

            {profile.diseases?.includes('Hypertension') && (
              <div className="flex gap-2.5 items-start text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/5 p-2.5 rounded-xl border border-rose-500/10">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>Hypertension alert: Limit sodium to 1500mg.</span>
              </div>
            )}
          </div>
        </div>

        {/* Today's Meal Checklist Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4 col-span-1">
          <h3 className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
            <CheckSquare size={14} className="text-amber-500" />
            Today's Meal Checklist
          </h3>
          <div className="space-y-3 pt-1">
            {Object.keys(mealsEaten).map((meal) => (
              <button
                key={meal}
                onClick={() => toggleMealEaten(meal)}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all border border-slate-200/50 dark:border-white/5 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {mealsEaten[meal] ? (
                    <CheckCircle className="text-emerald-500" size={16} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-350 dark:border-slate-600" />
                  )}
                  <span className={`text-xs font-bold ${mealsEaten[meal] ? 'text-slate-450 line-through font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {meal}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                  {mealsEaten[meal] ? 'Eaten' : 'Pending'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Health Goal Weight Tracker */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4 col-span-1">
          <h3 className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
            <TrendingUp size={14} className="text-amber-500" />
            Goal Progress
          </h3>
          <div className="space-y-3 pt-1 text-center">
            <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              {profile.goal || 'Healthy Eating'}
            </span>
            <div className="flex justify-center items-center gap-4 py-2">
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-black">Current</span>
                <span className="text-lg font-black text-slate-800 dark:text-white">{currentWeight} kg</span>
              </div>
              <span className="text-slate-300 text-lg">➔</span>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-black">Target</span>
                <span className="text-lg font-black text-amber-500">{targetWeight} kg</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${goalProgress}%` }} />
              </div>
              <span className="text-[9px] font-bold text-slate-400">{goalProgress}% of Target Completed</span>
            </div>
          </div>
        </div>

        {/* BMI circular widget */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4 col-span-1">
          <h3 className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
            <Activity size={14} className="text-amber-500" />
            Body Mass Index (BMI)
          </h3>
          <div className="flex flex-col items-center justify-center pt-1 relative">
            {metrics ? (
              <>
                <div className="absolute top-[48%] transform -translate-y-1/2 flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-850 dark:text-white leading-none">{metrics.bmi}</span>
                  <span className="text-[8px] font-extrabold text-slate-400 mt-1 uppercase">BMI INDEX</span>
                </div>
                {renderCircularProgress(75, "text-amber-500", 96, 7)}
                <span className="mt-3.5 inline-block text-[9px] font-extrabold px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                  {metrics.bmi_category}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400">BMI details pending.</span>
            )}
          </div>
        </div>
      </motion.section>

      {/* 3. ML Disease Risk Predictor cards */}
      {riskAssessment && (
        <motion.section variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-amber-500" size={20} />
            Machine Learning Health Risk Assessments
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-2.5">
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Diabetes Risk</span>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-slate-850 dark:text-white">{Math.round(riskAssessment.diabetes_risk * 100)}%</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${riskAssessment.diabetes_risk > 0.5 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {riskAssessment.diabetes_risk > 0.5 ? 'High Risk' : 'Low Risk'}
                </span>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-2.5">
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Heart Disease</span>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-slate-850 dark:text-white">{Math.round(riskAssessment.heart_disease_risk * 100)}%</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${riskAssessment.heart_disease_risk > 0.5 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {riskAssessment.heart_disease_risk > 0.5 ? 'High Risk' : 'Low Risk'}
                </span>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-2.5">
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Hypertension</span>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-slate-850 dark:text-white">{Math.round(riskAssessment.hypertension_risk * 100)}%</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${riskAssessment.hypertension_risk > 0.5 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {riskAssessment.hypertension_risk > 0.5 ? 'High Risk' : 'Low Risk'}
                </span>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-2.5">
              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Obesity Index</span>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-slate-850 dark:text-white">{Math.round(riskAssessment.obesity_risk * 100)}%</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${riskAssessment.obesity_risk > 0.5 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {riskAssessment.obesity_risk > 0.5 ? 'High Risk' : 'Low Risk'}
                </span>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Filters Area */}
      <motion.section variants={itemVariants} className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/5 text-slate-450 shrink-0">
          <Filter size={16} />
        </div>
        {filterChips.map(chip => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 border whitespace-nowrap ${
              activeFilter === chip
                ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/10'
                : 'bg-white dark:bg-slate-900 border-slate-205/50 dark:border-white/5 text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-105/50 dark:hover:bg-white/5'
            }`}
          >
            {chip}
          </button>
        ))}
      </motion.section>

      {/* Main Grid: AI Recommendations list (left) & Explanatory panel (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recommendations cards list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              AI Recommendations
            </h2>
            <Link to="/recommendations" className="text-sm font-bold text-amber-600 text-amber-400 hover:text-amber-500 flex items-center gap-1">
              Explore All
              <ArrowRight size={14} />
            </Link>
          </div>

          {filteredRecs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5">
              <p className="text-slate-450 font-semibold mb-2">No recommended foods match the filter "{activeFilter}"</p>
              <button 
                onClick={() => setActiveFilter('All')}
                className="text-sm font-bold text-amber-500 hover:underline"
              >
                Clear active filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredRecs.slice(0, 4).map(rec => {
                const imageUrl = getFoodImage(rec.food);
                const isFav = favorites.includes(rec.food);
                
                return (
                  <div
                    key={rec.food}
                    onClick={() => { setSelectedFood(rec); setIsDetailsModalOpen(true); }}
                    className={`group bg-white dark:bg-slate-950/30 rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col relative ${
                      selectedFood?.food === rec.food 
                        ? 'border-amber-500 dark:border-amber-500 bg-amber-50/5 dark:bg-amber-500/5 scale-[1.01]' 
                        : 'border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                    }`}
                  >
                    {/* Header Image */}
                    <div className="h-44 overflow-hidden relative shrink-0">
                      <img 
                        src={imageUrl} 
                        alt={rec.food}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold shadow-sm text-amber-600 dark:text-amber-400">
                        {rec.score}% Match
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(rec.food, e)}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-sm active:scale-95 transition-all ${
                          isFav 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-white/90 dark:bg-slate-900/90 text-rose-500 hover:bg-rose-50'
                        }`}
                      >
                        <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h3 className="font-extrabold text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-1">
                            {rec.food}
                          </h3>
                        </div>
                        <p className="text-xs font-bold text-slate-450 dark:text-slate-500 mb-3 uppercase tracking-wider">
                          {rec.cuisine} • {rec.category}
                        </p>

                        {/* Nutrition chips */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                            <span className="block text-xs font-black text-slate-700 dark:text-slate-350">{Math.round(rec.calories)}</span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">kcal</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                            <span className="block text-xs font-black text-slate-700 dark:text-slate-350">{Math.round(rec.protein)}g</span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">Pro</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                            <span className="block text-xs font-black text-slate-700 dark:text-slate-350">{Math.round(rec.carbohydrates)}g</span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">Carb</span>
                          </div>
                        </div>
                      </div>

                      {/* View Details triggers select */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                        <span className="text-xs font-bold text-amber-500 dark:text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          View details
                          <ChevronRight size={14} />
                        </span>
                        
                        {/* Suitability badge summary */}
                        <div className="flex gap-1">
                          {rec.reasons_for?.slice(0, 1).map((r, i) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                              {r.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Explainable AI Panel */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-amber-500" size={20} />
            Recommendation Insight
          </h2>

          {selectedFood ? (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-950/40 border border-slate-205/50 dark:border-white/5 shadow-xl relative overflow-hidden backdrop-blur-xl">
                {/* Image banner inside details panel */}
                <div className="h-32 rounded-2xl overflow-hidden relative mb-5">
                  <img 
                    src={getFoodImage(selectedFood.food)} 
                    alt={selectedFood.food} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <h3 className="font-extrabold text-white text-lg leading-tight">{selectedFood.food}</h3>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">{selectedFood.cuisine} Cuisine</p>
                    </div>
                  </div>
                </div>

                {/* Match Score Gauge */}
                <div className="flex justify-between items-center p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-250/20 dark:border-amber-500/10 mb-6">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Match score validation</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">{selectedFood.score}% Match</span>
                </div>

                {/* Explainable AI Timeline */}
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-slate-450 dark:text-slate-500 tracking-wider uppercase">
                    Why we recommend this meal
                  </h4>

                  {/* Positive conditions matching list */}
                  <div className="space-y-3">
                    {selectedFood.reasons_for?.length > 0 ? (
                      selectedFood.reasons_for.map((reason, i) => (
                        <div key={i} className="flex gap-3 items-start text-sm font-semibold text-slate-700 dark:text-slate-350">
                          <CheckCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex gap-3 items-start text-sm text-slate-500 font-semibold">
                        <CheckCircle size={16} className="text-amber-500/50 shrink-0 mt-0.5" />
                        <span>Fits standard calorie targets</span>
                      </div>
                    )}

                    {/* Disease exclusions/Allergen warning flags if present */}
                    {selectedFood.reasons_against?.map((reason, i) => (
                      <div key={i} className="flex gap-3 items-start text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
                        <ShieldX size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  <hr className="border-slate-100 dark:border-white/5 my-4" />

                  {/* Macro breakdown progress indicators */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-450 dark:text-slate-500 tracking-wider uppercase">
                      Nutritional Footprint
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <NutritionBar label="Protein" value={selectedFood.protein} max={50} unit="g" colorClass="bg-amber-500" />
                      <NutritionBar label="Carbs" value={selectedFood.carbohydrates} max={150} unit="g" colorClass="bg-blue-500" />
                      <NutritionBar label="Fats" value={selectedFood.fat} max={70} unit="g" colorClass="bg-orange-500" />
                      <NutritionBar label="Fiber" value={selectedFood.fiber || 5} max={25} unit="g" colorClass="bg-cyan-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Smart Grocery List (based on selected recipe ingredients) */}
              {selectedFoodDetails && selectedFoodDetails.ingredients && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-950/40 border border-slate-205/50 dark:border-white/5 shadow-xl space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-amber-500" />
                    Smart Grocery List
                  </h3>
                  <div className="space-y-2">
                    {selectedFoodDetails.ingredients.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleGroceryChecked(item)}
                        className="w-full flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-350 font-bold p-1 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-left transition-all"
                      >
                        {groceryChecked[item] ? (
                          <CheckCircle className="text-emerald-500 shrink-0" size={15} />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded border border-slate-350 dark:border-slate-600 shrink-0" />
                        )}
                        <span className={groceryChecked[item] ? 'line-through text-slate-400 font-semibold' : ''}>
                          {item}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Smart Swaps */}
              {smartSwaps.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-950/40 border border-slate-205/50 dark:border-white/5 shadow-xl space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    AI Smart Swaps
                  </h3>
                  <div className="space-y-3">
                    {smartSwaps.map((swap, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="flex items-center gap-2 text-slate-450 font-semibold">
                          <span className="line-through">{swap.from}</span>
                          <span className="text-amber-500">➔</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{swap.to}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic">{swap.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-3xl">
              Select any meal card to explore the AI match breakdown.
            </div>
          )}
        </div>
      </div>

      {/* 6. Weekly Calories Graph & Macros Pie Chart (Row 4) */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly calories graph */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-950/40 border border-slate-205/50 dark:border-white/5 shadow-xl space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <BarChart2 className="text-amber-500" size={18} />
            Weekly Energy Expenditure (Calories)
          </h3>
          <div className="h-[200px] w-full flex items-center justify-center">
            <Bar 
              data={weeklyCalorieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { border: { dash: [4, 4] }, grid: { color: 'rgba(156,163,175,0.1)' } }
                }
              }}
            />
          </div>
        </div>

        {/* Macros Pie Chart */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-slate-950/40 border border-slate-205/50 dark:border-white/5 shadow-xl space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Activity className="text-amber-500" size={18} />
            Today's Macronutrients Balance
          </h3>
          <div className="h-[180px] w-full flex items-center justify-center">
            <Doughnut 
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } }
                  }
                }
              }}
            />
          </div>
        </div>
      </motion.section>

      {/* 7. Achievements Streak, Badges & Recent Activities (Row 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Streak card */}
        <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-white dark:bg-slate-950/40 border border-slate-205/50 dark:border-white/5 shadow-xl space-y-4 col-span-1">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Sparkles className="text-amber-500" size={18} />
            Healthy Eating Streak
          </h3>
          <div className="flex items-center gap-4 py-2">
            <span className="text-5xl">🔥</span>
            <div>
              <span className="block text-2xl font-black text-slate-800 dark:text-white">14 Days Streak</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Consistency pays off!</p>
            </div>
          </div>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-white dark:bg-slate-950/40 border border-slate-205/50 dark:border-white/5 shadow-xl space-y-4 col-span-1">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Award className="text-amber-500" size={18} />
            Unlocked Badges
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center shrink-0 w-16">
              <span className="text-xl">🏅</span>
              <span className="text-[8px] font-extrabold text-amber-600 mt-1 uppercase leading-none">Protein</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center shrink-0 w-16">
              <span className="text-xl">🏅</span>
              <span className="text-[8px] font-extrabold text-cyan-600 mt-1 uppercase leading-none">Water</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center shrink-0 w-16">
              <span className="text-xl">🏅</span>
              <span className="text-[8px] font-extrabold text-emerald-600 mt-1 uppercase leading-none">Planner</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-white dark:bg-slate-950/40 border border-slate-205/50 dark:border-white/5 shadow-xl col-span-1">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
            <Clock className="text-amber-500" size={18} />
            Recent Activity
          </h3>
          <div className="space-y-4 max-h-[140px] overflow-y-auto scrollbar-none pr-1">
            {history.length > 0 ? (
              history.slice(0, 3).map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      Viewed {item.recommendations?.length || 0} AI Suggestions
                    </p>
                    <span className="text-[10px] text-slate-450 font-medium">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-slate-400 font-medium py-6">
                No recent actions recorded.
              </div>
            )}
          </div>
        </motion.div>
      </div>

               {/* 8. AI Suggested Workout Splits (Dynamic based on health risks) */}
      {riskAssessment && (
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-amber-500" size={20} />
            AI Suggested Activities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {getDashboardWorkouts().map((workout, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-3 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-2xl">🏃‍♂️</div>
                <div>
                  <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">
                    {workout.type}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{workout.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Duration: {workout.duration} | {workout.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bottom Row: Quick Action buttons */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="text-amber-500" size={20} />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ActionCard title="Scan Food" desc="Upload image" icon={<Image className="text-amber-500" />} to="/food-search" />
          <ActionCard title="Track Meal" desc="Save calorie logs" icon={<Plus className="text-blue-500" />} to="/nutrition" />
          <ActionCard title="Generate Diet" desc="7-Day Plan" icon={<Sparkles className="text-orange-500" />} to="/meal-planner" />
          <ActionCard title="Health Risks" desc="View Predictions" icon={<Activity className="text-red-500" />} to="/health-risk" />
        </div>
      </motion.div>

      {/* Recipe Detail Modal Overlay */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedFood && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute inset-0 bg-slate-955/60 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-white/5 max-h-[85vh] flex flex-col z-10"
            >
              {/* Header Image */}
              <div className="h-64 relative overflow-hidden shrink-0">
                <img 
                  src={getFoodImage(selectedFood.food)} 
                  alt={selectedFood.food} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-2xl font-black text-white">{selectedFood.food}</h3>
                    <p className="text-xs text-amber-400 font-extrabold mt-1 uppercase tracking-wider">{selectedFood.cuisine} Cuisine | {selectedFood.score}% Match</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-all text-sm font-black"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable details contents */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                {/* Macros splits */}
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5">
                    <span className="block text-sm font-black text-slate-800 dark:text-white">{Math.round(selectedFood.calories)}</span>
                    <span className="text-[10px] text-slate-450 font-bold uppercase">Calories</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5">
                    <span className="block text-sm font-black text-slate-800 dark:text-white">{Math.round(selectedFood.protein)}g</span>
                    <span className="text-[10px] text-slate-450 font-bold uppercase">Protein</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5">
                    <span className="block text-sm font-black text-slate-800 dark:text-white">{Math.round(selectedFood.carbohydrates)}g</span>
                    <span className="text-[10px] text-slate-450 font-bold uppercase">Carbs</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5">
                    <span className="block text-sm font-black text-slate-800 dark:text-white">{Math.round(selectedFood.fat)}g</span>
                    <span className="text-[10px] text-slate-450 font-bold uppercase">Fats</span>
                  </div>
                </div>

                {/* Recipe Ingredients */}
                {selectedFoodDetails && selectedFoodDetails.ingredients && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Ingredients Checklist</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedFoodDetails.ingredients.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-750 dark:text-slate-300">
                          <CheckCircle className="text-amber-500 shrink-0" size={14} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cooking Instructions */}
                {selectedFoodDetails && selectedFoodDetails.instructions && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Preparation Steps</h4>
                    <div className="space-y-3">
                      {selectedFoodDetails.instructions.map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-start text-xs font-bold text-slate-700 dark:text-slate-350">
                          <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                          <p className="leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Action footer */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 shrink-0 flex gap-3">
                <button 
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="flex-grow py-3 border border-slate-205 dark:border-white/5 text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-extrabold text-xs rounded-2xl transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setCaloriesLogged(c => c + Math.round(selectedFood.calories));
                    setProteinLogged(p => p + Math.round(selectedFood.protein));
                    setIsDetailsModalOpen(false);
                    toast.success(`Logged ${selectedFood.food} to today's goals!`);
                  }}
                  className="flex-grow py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all active:scale-95"
                >
                  Log as Today's Meal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Sub-widgets
const NutritionBar = ({ label, value, max, unit, colorClass }) => {
  const widthPercent = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold text-slate-505 dark:text-slate-400">
        <span>{label}</span>
        <span className="text-slate-800 dark:text-slate-300 font-extrabold">{Math.round(value)}{unit}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-105 dark:bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${widthPercent}%` }} />
      </div>
    </div>
  );
};

const ActionCard = ({ title, desc, icon, to }) => (
  <Link 
    to={to} 
    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 hover:shadow-md hover:scale-[1.03] transition-all flex flex-col justify-between items-start gap-4 h-32 group"
  >
    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-extrabold text-slate-855 dark:text-white line-clamp-1 group-hover:text-amber-505 transition-colors">{title}</h4>
      <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-500">{desc}</p>
    </div>
  </Link>
);

export default DashboardPage;
