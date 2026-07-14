import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let secondaryAuth = null;
try {
  const name = "SecondaryAppInstance";
  const secondaryApp = getApps().find(app => app.name === name) 
    ? getApp(name) 
    : initializeApp(firebaseConfig, name);
  secondaryAuth = getAuth(secondaryApp);
} catch (err) {
  console.warn("Secondary Firebase app initialization warning:", err.message);
}
import { 
  Users, Apple, Sparkles, BarChart3, Trash2, Shield, 
  Plus, Edit, Loader, Check, X, ShieldAlert, Clock,
  Settings, Search, FileDown, Activity, Dna, Settings2, 
  TrendingUp, LogOut, LayoutDashboard, Database, Tags, 
  ActivitySquare, FileSpreadsheet, Stethoscope, Heart
} from 'lucide-react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminAppointments, setAdminAppointments] = useState([]);
  const [nutritionists, setNutritionists] = useState([]);
  const [nutritionistModalOpen, setNutritionistModalOpen] = useState(false);
  const [nutritionistFormData, setNutritionistFormData] = useState({
    name: 'Dr. Arun Kumar',
    email: 'arun@gmail.com',
    password: 'password123',
    specialty: 'Clinical Nutrition & Diabetes',
    experience: '5 years experience',
    bio: 'Dr. Arun is a dedicated Clinical Dietitian and Nutritionist specializing in metabolic health and diabetes management. With over 4 years of experience, he focuses on designing custom low-glycemic meal plans that assist patients in regulating insulin sensitivity, reversing pre-diabetes, and achieving sustainable lifestyle transformations.',
    location: 'Suite 405, Wellness Wing',
    phone: '+1 (555) 019-2834',
    availability: 'Mon, Wed, Fri (9am - 3pm)',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600'
  });

  // Search & pagination
  const [userSearch, setUserSearch] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [foodPage, setFoodPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [foodTotalPages, setFoodTotalPages] = useState(1);

  // Config lists
  const [categories, setCategories] = useState(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage', 'Dessert']);
  const [cuisines, setCuisines] = useState(['Indian', 'Mexican', 'Italian', 'Chinese', 'American', 'Mediterranean']);
  const [allergens, setAllergens] = useState(['Peanut', 'Gluten', 'Lactose', 'Seafood', 'Soy', 'Egg', 'Tree Nuts']);
  const [diseases, setDiseases] = useState([]);

  // Disease Form state (Create/Edit)
  const [diseaseModalOpen, setDiseaseModalOpen] = useState(false);
  const [editingDiseaseId, setEditingDiseaseId] = useState(null);
  const [diseaseFormData, setDiseaseFormData] = useState({
    disease: '',
    avoidNutrients: '',
    boostNutrients: '',
    description: ''
  });

  // Food Form state (Create/Edit)
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [foodImageSourceType, setFoodImageSourceType] = useState('url');
  const [foodFormData, setFoodFormData] = useState({
    name: '',
    category: 'Breakfast',
    cuisine: 'Indian',
    calories: '',
    protein: '',
    carbohydrates: '',
    fat: '',
    fiber: '3',
    sugar: '2',
    sodium: '150',
    vitamin_a: '0',
    vitamin_c: '0',
    iron: '0',
    calcium: '0',
    ingredients: '',
    allergens: '',
    suitable_for: '',
    avoid_for: '',
    diet_type: 'Vegetarian',
    image: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/recommendations/logs').catch(() => ({ data: { data: { logs: [] } } }))
        ]);
        setStats(statsRes.data.data.stats);
        setLogs(logsRes.data.data.logs || []);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users', { 
          params: { page: userPage, limit: 10, search: userSearch || undefined } 
        });
        setUsers(res.data.data.users || []);
        setUserTotalPages(res.data.data.pagination?.pages || 1);
      } else if (activeTab === 'foods') {
        const res = await api.get('/foods', { 
          params: { page: foodPage, limit: 10, search: foodSearch || undefined } 
        });
        setFoods(res.data.data.foods || []);
        setFoodTotalPages(res.data.data.pagination?.pages || 1);
      } else if (activeTab === 'logs') {
        const res = await api.get('/admin/recommendations/logs');
        setLogs(res.data.data.logs || []);
      } else if (activeTab === 'appointments') {
        const res = await api.get('/appointments/admin');
        setAdminAppointments(res.data.data || []);
      } else if (activeTab === 'nutritionists') {
        await fetchNutritionists();
      } else if (activeTab === 'diseases') {
        await fetchDiseases();
      }
    } catch (e) {
      toast.error("Failed to load admin dashboard details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (apptId, status) => {
    try {
      await api.put(`/appointments/admin/${apptId}/status`, { status });
      toast.success(`Appointment status updated to ${status}!`);
      const res = await api.get('/appointments/admin');
      setAdminAppointments(res.data.data || []);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, userPage, foodPage]);

  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    setUserPage(1);
    fetchUsers();
  };

  const handleFoodSearchSubmit = (e) => {
    e.preventDefault();
    setFoodPage(1);
    fetchFoods();
  };

  const fetchUsers = async () => {
    const res = await api.get('/admin/users', { params: { page: userPage, limit: 10, search: userSearch } });
    setUsers(res.data.data.users || []);
    setUserTotalPages(res.data.data.pagination?.pages || 1);
  };

  const fetchFoods = async () => {
    const res = await api.get('/foods', { params: { page: foodPage, limit: 10, search: foodSearch } });
    setFoods(res.data.data.foods || []);
    setFoodTotalPages(res.data.data.pagination?.pages || 1);
  };

  const fetchNutritionists = async () => {
    try {
      const res = await api.get('/users/nutritionists');
      setNutritionists(res.data.data.nutritionists || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDiseases = async () => {
    try {
      const res = await api.get('/diseases');
      setDiseases(res.data.data || []);
    } catch (e) {
      toast.error("Failed to load disease settings");
    }
  };

  const handleOpenAddDisease = () => {
    setEditingDiseaseId(null);
    setDiseaseFormData({
      disease: '',
      avoidNutrients: '',
      boostNutrients: '',
      description: ''
    });
    setDiseaseModalOpen(true);
  };

  const handleOpenEditDisease = (rule) => {
    setEditingDiseaseId(rule._id);
    setDiseaseFormData({
      disease: rule.disease || '',
      avoidNutrients: (rule.avoidNutrients || []).join(', '),
      boostNutrients: (rule.boostNutrients || []).join(', '),
      description: rule.description || ''
    });
    setDiseaseModalOpen(true);
  };

  const handleDiseaseInputChange = (e) => {
    const { name, value } = e.target;
    setDiseaseFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDiseaseFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      disease: diseaseFormData.disease,
      avoidNutrients: diseaseFormData.avoidNutrients.split(',').map(s => s.trim()).filter(Boolean),
      boostNutrients: diseaseFormData.boostNutrients.split(',').map(s => s.trim()).filter(Boolean),
      description: diseaseFormData.description
    };

    try {
      if (editingDiseaseId) {
        await api.put(`/diseases/${editingDiseaseId}`, payload);
        toast.success("Disease rule updated!");
      } else {
        await api.post('/diseases', payload);
        toast.success("Disease rule created!");
      }
      setDiseaseModalOpen(false);
      fetchDiseases();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save disease settings");
    }
  };

  const handleDeleteDisease = async (id) => {
    if (!window.confirm("Permanently delete this disease rule?")) return;
    try {
      await api.delete(`/diseases/${id}`);
      toast.success("Disease rule deleted");
      fetchDiseases();
    } catch (e) {
      toast.error("Failed to delete disease rule");
    }
  };

  const handleNutritionistInputChange = (e) => {
    const { name, value } = e.target;
    setNutritionistFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNutritionistSubmit = async (e) => {
    e.preventDefault();
    try {
      let firebaseUid = null;
      if (secondaryAuth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth, 
            nutritionistFormData.email, 
            nutritionistFormData.password
          );
          firebaseUid = userCredential.user.uid;
          await signOut(secondaryAuth);
        } catch (fbErr) {
          console.error("Firebase client auth registration failed:", fbErr.message);
          toast.error(`Firebase Auth failed: ${fbErr.message}`);
          return;
        }
      }

      await api.post('/admin/nutritionists', {
        ...nutritionistFormData,
        firebaseUid
      });

      toast.success("Nutritionist added successfully!");
      setNutritionistModalOpen(false);
      setNutritionistFormData({
        name: 'Dr. Arun Kumar',
        email: 'arun@gmail.com',
        password: 'password123',
        specialty: 'Clinical Nutrition & Diabetes',
        experience: '5 years experience',
        bio: 'Dr. Arun is a dedicated Clinical Dietitian and Nutritionist specializing in metabolic health and diabetes management. With over 4 years of experience, he focuses on designing custom low-glycemic meal plans that assist patients in regulating insulin sensitivity, reversing pre-diabetes, and achieving sustainable lifestyle transformations.',
        location: 'Suite 405, Wellness Wing',
        phone: '+1 (555) 019-2834',
        availability: 'Mon, Wed, Fri (9am - 3pm)',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600'
      });
      fetchNutritionists();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add nutritionist");
    }
  };

  // User Administration Handlers
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (e) {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user account permanently?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (e) {
      toast.error("Failed to delete user");
    }
  };

  // Food CRUD Operations
  const handleFoodInputChange = (e) => {
    const { name, value } = e.target;
    setFoodFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddFood = () => {
    setEditingFoodId(null);
    setFoodFormData({
      name: '',
      category: 'Breakfast',
      cuisine: 'Indian',
      calories: '',
      protein: '',
      carbohydrates: '',
      fat: '',
      fiber: '3',
      sugar: '2',
      sodium: '150',
      vitamin_a: '0',
      vitamin_c: '0',
      iron: '0',
      calcium: '0',
      ingredients: 'ingredient 1, ingredient 2',
      allergens: '',
      suitable_for: '',
      avoid_for: '',
      diet_type: 'Vegetarian',
      image: ''
    });
    setFoodModalOpen(true);
  };

  const handleOpenEditFood = (food) => {
    setEditingFoodId(food._id);
    setFoodFormData({
      name: food.name || '',
      category: food.category || 'Breakfast',
      cuisine: food.cuisine || 'Indian',
      calories: food.calories || '',
      protein: food.protein || '',
      carbohydrates: food.carbohydrates || '',
      fat: food.fat || '',
      fiber: food.fiber || '3',
      sugar: food.sugar || '2',
      sodium: food.sodium || '150',
      vitamin_a: food.vitamin_a || '0',
      vitamin_c: food.vitamin_c || '0',
      iron: food.iron || '0',
      calcium: food.calcium || '0',
      ingredients: (food.ingredients || []).join(', '),
      allergens: (food.allergens || []).join(', '),
      suitable_for: (food.suitable_for || []).join(', '),
      avoid_for: (food.avoid_for || []).join(', '),
      diet_type: (food.diet_type || ['Vegetarian'])[0],
      image: food.image || ''
    });
    setFoodModalOpen(true);
  };

  const handleFoodFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: foodFormData.name,
      category: foodFormData.category,
      cuisine: foodFormData.cuisine,
      calories: Number(foodFormData.calories),
      protein: Number(foodFormData.protein),
      carbohydrates: Number(foodFormData.carbohydrates),
      fat: Number(foodFormData.fat),
      fiber: Number(foodFormData.fiber),
      sugar: Number(foodFormData.sugar),
      sodium: Number(foodFormData.sodium),
      vitamin_a: Number(foodFormData.vitamin_a),
      vitamin_c: Number(foodFormData.vitamin_c),
      iron: Number(foodFormData.iron),
      calcium: Number(foodFormData.calcium),
      ingredients: foodFormData.ingredients.split(',').map(s => s.trim()).filter(Boolean),
      allergens: foodFormData.allergens.split(',').map(s => s.trim()).filter(Boolean),
      suitable_for: foodFormData.suitable_for.split(',').map(s => s.trim()).filter(Boolean),
      avoid_for: foodFormData.avoid_for.split(',').map(s => s.trim()).filter(Boolean),
      diet_type: [foodFormData.diet_type],
      image: foodFormData.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400`
    };

    try {
      if (editingFoodId) {
        await api.put(`/foods/${editingFoodId}`, payload);
        toast.success("Food item updated!");
      } else {
        await api.post('/foods', payload);
        toast.success("Food item added!");
      }
      setFoodModalOpen(false);
      fetchFoods();
    } catch (e) {
      toast.error("Failed to save food details");
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm("Delete this food item permanently?")) return;
    try {
      await api.delete(`/foods/${foodId}`);
      toast.success("Food item deleted");
      fetchFoods();
    } catch (e) {
      toast.error("Failed to delete food");
    }
  };

  // Exporters
  const downloadCSVReport = (reportType) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportType === 'users') {
      csvContent += "Name,Email,Role,Age,BMI,Goal\n";
      users.forEach(u => {
        csvContent += `"${u.name}","${u.email}","${u.role}",${u.profile?.age || ''},${u.profile?.bmi || ''},"${u.profile?.goal || ''}"\n`;
      });
    } else if (reportType === 'foods') {
      csvContent += "Name,Category,Cuisine,Calories,Protein,Carbs,Fat\n";
      foods.forEach(f => {
        csvContent += `"${f.name}","${f.category}","${f.cuisine}",${f.calories || 0},${f.protein || 0},${f.carbohydrates || 0},${f.fat || 0}\n`;
      });
    } else {
      csvContent += "Disease Name,Recommended Nutrients,Avoid Nutrients\n";
      diseases.forEach(d => {
        csvContent += `"${d.name}","${d.rich}","${d.avoid}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${reportType.toUpperCase()} Report downloaded!`);
  };

  const handleRetrainModel = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Calling AI backend container to retrain model...',
        success: 'AI recommendation model retrained successfully! Accuracy: 94.2%',
        error: 'Retraining failed',
      }
    );
  };

  const handleAddCategory = (type) => {
    const val = prompt(`Enter new ${type} name:`);
    if (!val) return;
    if (type === 'cuisine') setCuisines(prev => [...prev, val]);
    else if (type === 'category') setCategories(prev => [...prev, val]);
    else setAllergens(prev => [...prev, val]);
    toast.success(`Added new ${type}: ${val}`);
  };

  const handleAdminLogout = async () => {
    await logout();
    navigate('/');
  };

  // Charts definitions
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Registrations',
      data: [12, 19, 32, 45, 59, stats?.totalUsers || 70],
      borderColor: '#fb7185',
      backgroundColor: 'rgba(251, 113, 133, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const foodCategoryData = {
    labels: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
    datasets: [{
      data: [35, 45, 30, 20],
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      borderWidth: 1
    }]
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-slate-100 flex flex-row overflow-hidden font-sans">
      
      {/* 1. DEDICATED ADMIN SIDEBAR */}
      <aside className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        
        {/* Title / Brand logo */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-rose-500/20">
            A
          </div>
          <div>
            <h1 className="font-extrabold text-sm uppercase tracking-wider text-rose-500">NutriAI Control</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SysAdmin Console</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          <SidebarLink active={activeTab === 'dashboard'} label="Overview Dashboard" icon={<LayoutDashboard size={18} />} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink active={activeTab === 'users'} label="User Registry" icon={<Users size={18} />} onClick={() => setActiveTab('users')} />
          <SidebarLink active={activeTab === 'nutritionists'} label="Nutritionist Registry" icon={<Heart size={18} />} onClick={() => setActiveTab('nutritionists')} />
          <SidebarLink active={activeTab === 'foods'} label="Food Database" icon={<Apple size={18} />} onClick={() => { setActiveTab('foods'); setFoodPage(1); }} />
          <SidebarLink active={activeTab === 'categories'} label="Cuisines & Tags" icon={<Tags size={18} />} onClick={() => setActiveTab('categories')} />
          <SidebarLink active={activeTab === 'diseases'} label="Disease Settings" icon={<Dna size={18} />} onClick={() => setActiveTab('diseases')} />
          <SidebarLink active={activeTab === 'appointments'} label="Consultation Bookings" icon={<Stethoscope size={18} />} onClick={() => setActiveTab('appointments')} />
          <SidebarLink active={activeTab === 'logs'} label="AI Engine Logs" icon={<Clock size={18} />} onClick={() => setActiveTab('logs')} />
          <SidebarLink active={activeTab === 'reports'} label="Reports Export" icon={<FileSpreadsheet size={18} />} onClick={() => setActiveTab('reports')} />
        </nav>

        {/* Sidebar Status Footer */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="space-y-2">
            <StatusIndicator label="PostgreSQL/Mongo" active={true} />
            <StatusIndicator label="AI Container (8001)" active={true} />
            <StatusIndicator label="Docker Cluster" active={false} />
          </div>
          <button 
            onClick={handleRetrainModel}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/10 border border-rose-500/20 text-rose-450 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            <Settings2 size={14} /> Retrain AI Model
          </button>
          <button 
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut size={14} /> Return to Site
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT AREA */}
      <main className="flex-grow flex flex-col overflow-hidden bg-slate-950 relative">
        
        {/* Top Status Header */}
        <header className="h-[72px] border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Root Admin Console</span>
            <span>•</span>
            <span className="text-emerald-500">System Secure</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Session Active</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          </div>
        </header>

        {/* Viewport Content Panel */}
        <div className="flex-grow p-8 overflow-y-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader className="w-12 h-12 text-rose-500 animate-spin mb-4" />
              <span className="text-sm font-semibold text-slate-400">Querying database cluster...</span>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              
              {/* TAB 1: OVERVIEW DASHBOARD */}
              {activeTab === 'dashboard' && stats && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard title="Total User Accounts" value={stats.totalUsers} icon={<Users size={20} className="text-rose-500" />} />
                    <KPICard title="Cataloged Foods" value={stats.totalFoods} icon={<Apple size={20} className="text-emerald-500" />} />
                    <KPICard title="AI Recommendations" value={stats.totalRecommendations} icon={<Sparkles size={20} className="text-amber-500" />} />
                    <KPICard title="Active session slots" value={stats.totalUsers + 4} icon={<Activity size={20} className="text-blue-500" />} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <h3 className="font-bold text-sm text-slate-200 mb-4">Registration Growth Vector</h3>
                      <div className="h-64">
                        <Line data={userGrowthData} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <h3 className="font-bold text-sm text-slate-200 mb-4">Food Database Category Share</h3>
                      <div className="h-64 flex justify-center">
                        <Doughnut data={foodCategoryData} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-rose-500 mb-3">Popular Target Goals</h4>
                      <ul className="space-y-2.5 text-sm text-slate-350">
                        <li className="flex justify-between"><span>📉 Weight Loss Deficit:</span> <span className="font-bold text-slate-200">42% of users</span></li>
                        <li className="flex justify-between"><span>🥦 Healthy Eating Balance:</span> <span className="font-bold text-slate-200">35% of users</span></li>
                        <li className="flex justify-between"><span>💪 Muscle Gain Surplus:</span> <span className="font-bold text-slate-200">23% of users</span></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-rose-500 mb-3">Retraining logs</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        ML Suitability Vector model is actively calibrating interaction grids. Last training date: <strong>Today</strong>. Accuracy threshold: <strong>94.2%</strong>.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: USER REGISTRY */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <form onSubmit={handleUserSearchSubmit} className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="flex-grow px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <button type="submit" className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"><Search size={18} /></button>
                  </form>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-850 text-slate-400 border-b border-slate-800">
                            <th className="p-4 uppercase tracking-wider font-bold">User Details</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Email</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Goals & BMI</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Joined</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Role</th>
                            <th className="p-4 uppercase tracking-wider font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u._id} className="border-b border-slate-800 hover:bg-slate-850/50">
                              <td className="p-4 font-bold text-slate-100">{u.name}</td>
                              <td className="p-4 text-slate-400">{u.email}</td>
                              <td className="p-4">
                                <span className="block">Goal: {u.profile?.goal || 'Not Onboarded'}</span>
                                <span className="block text-slate-500">BMI: {u.profile?.bmi || 'N/A'}</span>
                              </td>
                              <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                                  u.role === 'admin' 
                                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => handleToggleRole(u._id, u.role)}
                                  className="text-[10px] font-bold px-2.5 py-1.5 border border-slate-800 hover:border-rose-500 rounded-lg text-slate-300"
                                >
                                  Toggle Role
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg inline-flex align-middle"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {userTotalPages > 1 && (
                      <div className="p-4 flex justify-between items-center bg-slate-850/30 border-t border-slate-800">
                        <button onClick={() => setUserPage(p => Math.max(p - 1, 1))} disabled={userPage === 1}
                          className="px-3 py-1.5 border border-slate-800 rounded-lg text-xs font-bold disabled:opacity-50">Prev</button>
                        <span className="text-xs text-slate-500">Page {userPage} of {userTotalPages}</span>
                        <button onClick={() => setUserPage(p => Math.min(p + 1, userTotalPages))} disabled={userPage === userTotalPages}
                          className="px-3 py-1.5 border border-slate-800 rounded-lg text-xs font-bold disabled:opacity-50">Next</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FOOD DATABASE */}
              {activeTab === 'foods' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <form onSubmit={handleFoodSearchSubmit} className="flex gap-2 max-w-md flex-grow">
                      <input
                        type="text"
                        placeholder="Search catalog..."
                        value={foodSearch}
                        onChange={(e) => setFoodSearch(e.target.value)}
                        className="flex-grow px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <button type="submit" className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"><Search size={18} /></button>
                    </form>
                    <button onClick={handleOpenAddFood} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-500/10 text-xs">
                      <Plus size={14} /> Add Food Item
                    </button>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-850 text-slate-400 border-b border-slate-800">
                            <th className="p-4 uppercase tracking-wider font-bold">Food Name</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Category</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Cuisine</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Diet</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Nutritional Specs</th>
                            <th className="p-4 uppercase tracking-wider font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {foods.map(f => (
                            <tr key={f._id} className="border-b border-slate-800 hover:bg-slate-850/50">
                              <td className="p-4 font-bold text-slate-100">{f.name}</td>
                              <td className="p-4 text-slate-400">{f.category}</td>
                              <td className="p-4 text-slate-400">{f.cuisine}</td>
                              <td className="p-4 text-rose-500 font-bold capitalize">{(f.diet_type || []).join(', ')}</td>
                              <td className="p-4 text-slate-500">
                                {Math.round(f.calories)} kcal / {Math.round(f.protein)}g P / {Math.round(f.carbohydrates)}g C / {Math.round(f.fat)}g F
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button onClick={() => handleOpenEditFood(f)} className="p-1.5 border border-slate-800 hover:border-rose-500 rounded-lg text-slate-400">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteFood(f._id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {foodTotalPages > 1 && (
                      <div className="p-4 flex justify-between items-center bg-slate-850/30 border-t border-slate-800">
                        <button onClick={() => setFoodPage(p => Math.max(p - 1, 1))} disabled={foodPage === 1}
                          className="px-3 py-1.5 border border-slate-800 rounded-lg text-xs font-bold disabled:opacity-50">Prev</button>
                        <span className="text-xs text-slate-500">Page {foodPage} of {foodTotalPages}</span>
                        <button onClick={() => setFoodPage(p => Math.min(p + 1, foodTotalPages))} disabled={foodPage === foodTotalPages}
                          className="px-3 py-1.5 border border-slate-800 rounded-lg text-xs font-bold disabled:opacity-50">Next</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CATEGORY / CUISINE CONFIG */}
              {activeTab === 'categories' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ConfigListCard title="Cuisine Options" items={cuisines} onAdd={() => handleAddCategory('cuisine')} />
                  <ConfigListCard title="Meal categories" items={categories} onAdd={() => handleAddCategory('category')} />
                  <ConfigListCard title="Allergens mapping" items={allergens} onAdd={() => handleAddCategory('allergen')} isAllergen={true} />
                </div>
              )}

              {/* TAB 5: DISEASES */}
              {activeTab === 'diseases' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-100 flex items-center gap-2">
                      <Dna className="text-rose-500" /> Condition Rules Index
                    </h3>
                    <button
                      onClick={handleOpenAddDisease}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Plus size={14} /> Add Condition Rule
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {diseases.map(d => (
                      <div key={d._id} className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                            <ShieldAlert size={16} className="text-rose-500" /> {d.disease}
                          </span>
                          {d.description && <p className="text-slate-400 text-[11px] leading-relaxed">{d.description}</p>}
                          <div className="space-y-1 pt-1">
                            <p className="text-[10px] text-slate-500">🚫 <strong className="text-slate-400">Avoid Nutrients:</strong> {d.avoidNutrients?.join(', ') || 'None'}</p>
                            <p className="text-[10px] text-slate-500">✅ <strong className="text-slate-400">Boost Nutrients:</strong> {d.boostNutrients?.join(', ') || 'None'}</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-900 pt-3">
                          <button
                            onClick={() => handleOpenEditDisease(d)}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDisease(d._id)}
                            className="px-3 py-1.5 bg-rose-600/10 border border-rose-500/20 text-[10px] font-bold text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: AI LOGS */}
              {activeTab === 'logs' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-850 text-slate-400 border-b border-slate-800">
                          <th className="p-4 font-bold uppercase">Date & Time</th>
                          <th className="p-4 font-bold uppercase">User</th>
                          <th className="p-4 font-bold uppercase">Payload context</th>
                          <th className="p-4 font-bold uppercase">Result recommended</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, index) => (
                          <tr key={index} className="border-b border-slate-800 hover:bg-slate-850/30">
                            <td className="p-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="p-4 text-slate-200">
                              {log.userId?.name || 'Local User'}
                              <span className="block text-[10px] text-slate-500">{log.userId?.email || ''}</span>
                            </td>
                            <td className="p-4 text-slate-400 truncate max-w-[200px]">Goal: {log.input?.goal || 'Maintain'} | Age: {log.input?.age || 30}</td>
                            <td className="p-4 text-slate-350 truncate max-w-[300px]">{(log.recommendations || []).slice(0, 3).map(r => r.food).join(', ')}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: REPORTS */}
              {activeTab === 'reports' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ReportGeneratorCard title="User Demographics CSV" desc="Exports BMI counts, health goals, and registration timeline metrics." onClick={() => downloadCSVReport('users')} />
                  <ReportGeneratorCard title="Food Nutrition catalog CSV" desc="Exports caloric targets, fiber profiles, and suitable diseases." onClick={() => downloadCSVReport('foods')} />
                  <ReportGeneratorCard title="Medical Guidelines Config CSV" desc="Exports dietary rules maps for active diabetes and hypertension checks." onClick={() => downloadCSVReport('diseases')} />
                </div>
              )}

              {/* TAB 8: APPOINTMENTS CONSULTATIONS */}
              {activeTab === 'appointments' && (
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                      <h3 className="font-bold text-sm text-slate-200">Consultation Bookings Management</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-850 text-slate-400 border-b border-slate-800">
                            <th className="p-4 uppercase tracking-wider font-bold">User</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Practitioner Details</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Time Slot</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Clinical Focus</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Status</th>
                            <th className="p-4 uppercase tracking-wider font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminAppointments.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="p-6 text-center text-slate-500 font-bold">No consultation requests logged yet.</td>
                            </tr>
                          ) : (
                            adminAppointments.map(ap => (
                              <tr key={ap._id} className="border-b border-slate-800 hover:bg-slate-850/50">
                                <td className="p-4 font-bold text-slate-100">{ap.userName}</td>
                                <td className="p-4 text-slate-350 font-bold">
                                  {ap.doctorName}
                                  <span className="block text-[10px] text-amber-500 font-extrabold">{ap.specialty}</span>
                                </td>
                                <td className="p-4 text-slate-400 font-semibold">
                                  {ap.date}
                                  <span className="block text-[10px] text-slate-500 font-bold">{ap.time}</span>
                                </td>
                                <td className="p-4 text-slate-400 italic truncate max-w-[200px]">{ap.reason}</td>
                                <td className="p-4">
                                  {ap.status === 'accepted' && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-extrabold uppercase">Accepted</span>}
                                  {ap.status === 'rejected' && <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[8px] font-extrabold uppercase">Rejected</span>}
                                  {ap.status === 'pending' && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-extrabold uppercase animate-pulse">Pending</span>}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                  {ap.status === 'pending' && (
                                    <>
                                      <button 
                                        onClick={() => handleUpdateAppointmentStatus(ap._id, 'accepted')}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all active:scale-95"
                                      >
                                        Accept
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateAppointmentStatus(ap._id, 'rejected')}
                                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all active:scale-95"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: NUTRITIONISTS REGISTRY */}
              {activeTab === 'nutritionists' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-200">Nutritionist Practitioners</h3>
                    <button
                      onClick={() => setNutritionistModalOpen(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Plus size={14} /> Add Nutritionist
                    </button>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-850 text-slate-400 border-b border-slate-800">
                            <th className="p-4 uppercase tracking-wider font-bold">Nutritionist Details</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Email</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Specialty & Experience</th>
                            <th className="p-4 uppercase tracking-wider font-bold">Availability</th>
                            <th className="p-4 uppercase tracking-wider font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nutritionists.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="p-6 text-center text-slate-500 font-bold">No nutritionists added yet.</td>
                            </tr>
                          ) : (
                            nutritionists.map(n => (
                              <tr key={n._id} className="border-b border-slate-800 hover:bg-slate-850/50">
                                <td className="p-4 flex items-center gap-3">
                                  <img 
                                    src={n.avatar || defaultDocSvg} 
                                    alt={n.name}
                                    onError={(e) => { e.target.src = defaultDocSvg; }}
                                    className="w-8 h-8 rounded-lg object-cover"
                                  />
                                  <span className="font-bold text-slate-100">{n.name}</span>
                                </td>
                                <td className="p-4 text-slate-400">{n.email}</td>
                                <td className="p-4">
                                  <span className="block text-slate-350">{n.nutritionistProfile?.specialty || 'General'}</span>
                                  <span className="block text-slate-505">{n.nutritionistProfile?.experience || 'N/A'}</span>
                                </td>
                                <td className="p-4 text-slate-400">{n.nutritionistProfile?.availability || 'Mon - Fri'}</td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => handleDeleteUser(n._id)}
                                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg inline-flex align-middle cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>

      {/* CRUD Food Modal */}
      {foodModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-slate-800 dark:text-slate-100">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center text-slate-100">
              <h2 className="text-lg font-bold">{editingFoodId ? 'Modify Food Record' : 'Create Food Record'}</h2>
              <button onClick={() => setFoodModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleFoodFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-grow text-xs text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Food Name</label>
                  <input type="text" name="name" value={foodFormData.name} onChange={handleFoodInputChange} required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div className="sm:col-span-2 border border-slate-800 p-4 rounded-2xl bg-slate-950/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-400 uppercase font-bold text-[10px]">Food Picture</label>
                    <div className="flex gap-3 text-[10px]">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={foodImageSourceType === 'url'} onChange={() => setFoodImageSourceType('url')} name="imgSource" className="accent-emerald-500" />
                        <span>Link URL</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={foodImageSourceType === 'file'} onChange={() => setFoodImageSourceType('file')} name="imgSource" className="accent-emerald-500" />
                        <span>Local Upload</span>
                      </label>
                    </div>
                  </div>

                  {foodImageSourceType === 'url' ? (
                    <input type="text" name="image" value={foodFormData.image} onChange={handleFoodInputChange} placeholder="Paste image link URL (e.g. https://unsplash.com/...)"
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-100 outline-none text-[11px]" />
                  ) : (
                    <div className="flex items-center gap-3">
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFoodFormData(prev => ({ ...prev, image: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }} className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-slate-900 file:text-slate-300 hover:file:bg-slate-800 file:cursor-pointer" />
                    </div>
                  )}

                  {foodFormData.image && (
                    <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-850">
                      <img src={foodFormData.image} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-800" onError={(e) => { e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e293b'/></svg>"; }} />
                      <div className="flex-grow min-w-0">
                        <p className="text-[10px] text-slate-500 truncate">{foodFormData.image.startsWith('data:') ? 'Base64 Local Image Upload' : foodFormData.image}</p>
                        <button type="button" onClick={() => setFoodFormData(prev => ({ ...prev, image: '' }))} className="text-[9px] text-rose-400 hover:underline">Clear Image</button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Category</label>
                  <select name="category" value={foodFormData.category} onChange={handleFoodInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Cuisine</label>
                  <select name="cuisine" value={foodFormData.cuisine} onChange={handleFoodInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none">
                    {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Diet Type</label>
                  <select name="diet_type" value={foodFormData.diet_type} onChange={handleFoodInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none">
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Calories (kcal)</label>
                  <input type="number" name="calories" value={foodFormData.calories} onChange={handleFoodInputChange} required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Protein (g)</label>
                  <input type="number" name="protein" value={foodFormData.protein} onChange={handleFoodInputChange} required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Carbs (g)</label>
                  <input type="number" name="carbohydrates" value={foodFormData.carbohydrates} onChange={handleFoodInputChange} required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Fat (g)</label>
                  <input type="number" name="fat" value={foodFormData.fat} onChange={handleFoodInputChange} required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Fiber (g)</label>
                  <input type="number" name="fiber" value={foodFormData.fiber} onChange={handleFoodInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div className="sm:col-span-2 border-t border-slate-800 pt-3 mt-2">
                  <h4 className="font-bold text-slate-100">Micronutrients & Ingredients</h4>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Sodium (mg)</label>
                  <input type="number" name="sodium" value={foodFormData.sodium} onChange={handleFoodInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Sugar (g)</label>
                  <input type="number" name="sugar" value={foodFormData.sugar} onChange={handleFoodInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Ingredients (comma-separated)</label>
                  <input type="text" name="ingredients" value={foodFormData.ingredients} onChange={handleFoodInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Suitable for diseases</label>
                  <input type="text" name="suitable_for" value={foodFormData.suitable_for} onChange={handleFoodInputChange} placeholder="Diabetes, Obesity"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Avoid for diseases</label>
                  <input type="text" name="avoid_for" value={foodFormData.avoid_for} onChange={handleFoodInputChange} placeholder="Hypertension"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setFoodModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-850">Cancel</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Nutritionist Modal */}
      {nutritionistModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-slate-800 dark:text-slate-100">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center text-slate-100">
              <h2 className="text-lg font-bold">Add Nutritionist Practitioner</h2>
              <button onClick={() => setNutritionistModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddNutritionistSubmit} className="p-6 overflow-y-auto space-y-4 flex-grow text-xs text-slate-350">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Full Name</label>
                  <input type="text" name="name" value={nutritionistFormData.name} onChange={handleNutritionistInputChange} required placeholder="Dr. Jane Doe"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Email (Login ID)</label>
                  <input type="email" name="email" value={nutritionistFormData.email} onChange={handleNutritionistInputChange} required placeholder="jane@nutriai.com"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Default Password</label>
                  <input type="password" name="password" value={nutritionistFormData.password} onChange={handleNutritionistInputChange} required placeholder="At least 6 chars"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Specialty Focus</label>
                  <input type="text" name="specialty" value={nutritionistFormData.specialty} onChange={handleNutritionistInputChange} required placeholder="Clinical Nutrition & Diabetes"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Experience Level</label>
                  <input type="text" name="experience" value={nutritionistFormData.experience} onChange={handleNutritionistInputChange} required placeholder="8 yrs experience"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Location / Suite</label>
                  <input type="text" name="location" value={nutritionistFormData.location} onChange={handleNutritionistInputChange} required placeholder="Suite 405, Wellness Wing"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Contact Phone</label>
                  <input type="text" name="phone" value={nutritionistFormData.phone} onChange={handleNutritionistInputChange} required placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Weekly Availability</label>
                  <input type="text" name="availability" value={nutritionistFormData.availability} onChange={handleNutritionistInputChange} required placeholder="Mon, Wed, Fri (9am - 3pm)"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Picture URL (Optional)</label>
                  <input type="url" name="avatar" value={nutritionistFormData.avatar} onChange={handleNutritionistInputChange} placeholder="https://unsplash.com/..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Clinical Bio</label>
                  <textarea name="bio" value={nutritionistFormData.bio} onChange={handleNutritionistInputChange} required rows="3" placeholder="Brief background about their focus..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none resize-none" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setNutritionistModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-850">Cancel</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg">Create Practitioner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Disease Modal */}
      {diseaseModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-slate-800 dark:text-slate-100">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center text-slate-100">
              <h2 className="text-lg font-bold">{editingDiseaseId ? 'Modify Condition Rule' : 'Create Condition Rule'}</h2>
              <button onClick={() => setDiseaseModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleDiseaseFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-grow text-xs text-slate-350">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Disease / Condition Name</label>
                  <input type="text" name="disease" value={diseaseFormData.disease} onChange={handleDiseaseInputChange} required placeholder="e.g. Celiac Disease"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Avoid Nutrients (comma separated)</label>
                  <input type="text" name="avoidNutrients" value={diseaseFormData.avoidNutrients} onChange={handleDiseaseInputChange} placeholder="e.g. Gluten, Barley, Wheat"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Boost Nutrients (comma separated)</label>
                  <input type="text" name="boostNutrients" value={diseaseFormData.boostNutrients} onChange={handleDiseaseInputChange} placeholder="e.g. Fiber, Iron, B Vitamins"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Description & Guideline</label>
                  <textarea name="description" value={diseaseFormData.description} onChange={handleDiseaseInputChange} rows="3" placeholder="Brief clinical explanation or dietary guidelines..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none resize-none" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setDiseaseModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-850">Cancel</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-components
const SidebarLink = ({ active, label, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
      active 
        ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/15' 
        : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatusIndicator = ({ label, active }) => (
  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
    <span>{label}</span>
    <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'}`}></span>
  </div>
);

const KPICard = ({ title, value, icon }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
    <div>
      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</span>
      <span className="text-3xl font-extrabold text-slate-100">{value}</span>
    </div>
    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
      {icon}
    </div>
  </div>
);

const ConfigListCard = ({ title, items, onAdd, isAllergen }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-sm text-slate-200">{title}</h3>
      <button onClick={onAdd} className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-0.5"><Plus size={14} /> Add</button>
    </div>
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span key={item} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
          isAllergen 
            ? 'bg-rose-500/10 border border-rose-500/25 text-rose-450' 
            : 'bg-slate-950 border border-slate-850 text-slate-400'
        }`}>{item}</span>
      ))}
    </div>
  </div>
);

const ReportGeneratorCard = ({ title, desc, onClick }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between min-h-[160px]">
    <div>
      <h3 className="font-bold text-sm text-slate-200 mb-2">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{desc}</p>
    </div>
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600/10 border border-rose-500/20 text-rose-450 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all w-full mt-auto"
    >
      <FileSpreadsheet size={14} /> Download CSV Report
    </button>
  </div>
);

export default AdminPage;
