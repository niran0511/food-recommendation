import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, Activity, Scale, Droplet, Flame, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const NutritionPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/health/metrics');
        setMetrics(res.data.data.metrics || null);
      } catch (error) {
        toast.error("Failed to load nutrition metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
          <Loader className="w-16 h-16 text-emerald-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-8 mb-2">Analyzing Nutrition Targets</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-md">
          Calculating your custom metabolic rates, hydration needs, and optimal macronutrient splits...
        </p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">Please complete your onboarding profile to view your nutrition profile.</p>
        </div>
      </div>
    );
  }

  const getBmiColor = (category) => {
    switch (category) {
      case 'Normal':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Underweight':
        return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
      case 'Overweight':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    }
  };

  const getMacrosPercentages = () => {
    const totalGrams = metrics.daily_protein + metrics.daily_carbs + metrics.daily_fat;
    return {
      protein: Math.round((metrics.daily_protein / totalGrams) * 100),
      carbs: Math.round((metrics.daily_carbs / totalGrams) * 100),
      fat: Math.round((metrics.daily_fat / totalGrams) * 100),
    };
  };

  const macroPct = getMacrosPercentages();

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Your Personal Nutrition & Health Analysis
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          An in-depth look at your daily nutritional targets, metabolic calculations, and macronutrient targets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* BMI & Body Mass */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Scale className="text-emerald-500" size={22} /> Body Mass Index (BMI)
            </h2>
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-5xl font-extrabold text-slate-800 dark:text-white">{metrics.bmi}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getBmiColor(metrics.bmi_category)}`}>
                {metrics.bmi_category}
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your BMI suggests you are in the <strong>{metrics.bmi_category}</strong> range. Maintain a balanced diet and regular physical activity to keep your metabolic health optimal.
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
            <span>Height: {user.profile?.height} cm</span>
            <span>Weight: {user.profile?.weight} kg</span>
          </div>
        </div>

        {/* Daily Calorie Targets */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Flame className="text-amber-500" size={22} /> Daily Energy Target
            </h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-extrabold text-amber-500">{Math.round(metrics.daily_calories)}</span>
              <span className="text-slate-500 font-semibold">kcal / day</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <span className="block text-slate-500 text-xs mb-1">BMR (Basal Metabolic Rate)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(metrics.bmr)} kcal</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <span className="block text-slate-500 text-xs mb-1">TDEE (Total Expenditure)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(metrics.tdee)} kcal</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
            <Trophy size={16} className="text-emerald-500" />
            <span>Target adjusted to support: <strong>{user.profile?.goal}</strong></span>
          </div>
        </div>

      </div>

      {/* Macros Split */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Activity className="text-emerald-500" size={22} /> Macronutrient Targets
        </h2>
        
        {/* Progress Bar visualizer */}
        <div className="h-6 w-full rounded-full overflow-hidden flex mb-8 border border-slate-100 dark:border-slate-800">
          <div className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500" style={{ width: `${macroPct.protein}%` }}>
            {macroPct.protein}%
          </div>
          <div className="bg-blue-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500" style={{ width: `${macroPct.carbs}%` }}>
            {macroPct.carbs}%
          </div>
          <div className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500" style={{ width: `${macroPct.fat}%` }}>
            {macroPct.fat}%
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="flex flex-col p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Protein</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{Math.round(metrics.daily_protein)}g</span>
            <span className="text-xs text-slate-500 mt-2">Essential for muscle repair</span>
          </div>
          <div className="flex flex-col p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Carbohydrates</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{Math.round(metrics.daily_carbs)}g</span>
            <span className="text-xs text-slate-500 mt-2">Primary energy source</span>
          </div>
          <div className="flex flex-col p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Fats</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{Math.round(metrics.daily_fat)}g</span>
            <span className="text-xs text-slate-500 mt-2">Supports hormone function</span>
          </div>
          <div className="flex flex-col p-4 bg-slate-500/5 rounded-2xl border border-slate-500/10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Dietary Fiber</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{Math.round(metrics.daily_fiber)}g</span>
            <span className="text-xs text-slate-500 mt-2">Aids healthy digestion</span>
          </div>
        </div>
      </div>

      {/* Hydration */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
            <Droplet size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Hydration Target</h2>
            <p className="text-slate-500 text-sm mt-1">Daily water intake recommended to prevent dehydration and support metabolic functions.</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-4xl font-black text-blue-500">{metrics.water_intake.toFixed(1)}</span>
          <span className="text-slate-500 font-bold text-lg ml-1">Liters / day</span>
        </div>
      </div>
    </div>
  );
};

export default NutritionPage;
