import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader, Sparkles, Utensils, Calendar, Clock, BookOpen, X, ChevronRight } from 'lucide-react';
import { getFoodImage, getRecipeDetails } from '../utils/recipeHelper';
import toast from 'react-hot-toast';

const defaultFoodSvg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImYiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxMGI5ODEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNTk2NjkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNmKSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMwIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIG9wYWNpdHk9IjAuOSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjIyIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuNiIvPjxwYXRoIGQ9Ik0zMCAzNXYyME0yNyAzNXYxME0zMyAzNXYxME0zMCA1NXYxNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNzAgMzV2MjBNNzAgNTV2MTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTY4IDM1YzIgMCA0IDUgNCAxNXY1aC04di01YzAtMTAgMi0xNSA0LTE1eiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOSIvPjwvc3ZnPg==";

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const MealPlannerPage = () => {
  const [mealPlan, setMealPlan] = useState(null);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // 'daily', 'weekly'
  const [selectedDay, setSelectedDay] = useState('monday');
  
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        setLoading(true);
        if (viewMode === 'daily') {
          const res = await api.post('/meal-plans/daily');
          setMealPlan(res.data.data.mealPlan || null);
        } else {
          const res = await api.post('/meal-plans/weekly');
          setWeeklyPlan(res.data.data.mealPlan?.weeklyPlan || null);
        }
      } catch (error) {
        toast.error(`Failed to load ${viewMode} meal plan`);
      } finally {
        setLoading(false);
      }
    };
    fetchMealPlan();
  }, [viewMode]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
          <Loader className="w-16 h-16 text-emerald-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-8 mb-2">
          Generating {viewMode === 'daily' ? 'Daily' : 'Weekly'} Meal Plan
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-md">
          Our AI is building a balanced schedule for your specific requirements...
        </p>
      </div>
    );
  }

  const renderMeal = (meal, title) => {
    if (!meal || meal.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Utensils size={18} className="text-emerald-500" />
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meal.map(food => {
            const imageUrl = getFoodImage(food.name);
            return (
              <div 
                key={food.name} 
                onClick={() => setSelectedFood(food)}
                className="flex items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:scale-[1.01] cursor-pointer transition-all"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 mr-4">
                  <img 
                    src={imageUrl} 
                    alt={food.name} 
                    onError={(e) => {
                      if (e.target.src.startsWith('data:')) return;
                      if (!e.target.src.includes('loremflickr')) {
                        e.target.src = 'https://loremflickr.com/400/300/' + encodeURIComponent(food.name.split(' Variant')[0]);
                      } else {
                        e.target.src = defaultFoodSvg;
                      }
                    }}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{food.name}</h4>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    <span>🔥 {Math.round(food.calories)} kcal</span>
                    <span>🥩 {Math.round(food.protein)}g</span>
                  </div>
                  <div className="text-[10px] text-emerald-500 font-bold mt-1">
                    Click to view recipe
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getSelectedDayMeals = () => {
    if (!weeklyPlan) return null;
    const dayData = weeklyPlan.find(d => d.day === selectedDay);
    return dayData?.meals || null;
  };

  const selectedDayMeals = getSelectedDayMeals();

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 relative">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
          <Sparkles size={16} /> AI-Powered Plan
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Your Meal Schedule
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          A diet structure calibrated precisely to your energy needs, current health status, and goals.
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setViewMode('daily')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
            viewMode === 'daily'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Daily View
        </button>
        <button
          onClick={() => setViewMode('weekly')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
            viewMode === 'weekly'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Weekly View (7-Day)
        </button>
      </div>

      {/* Daily View Content */}
      {viewMode === 'daily' && (
        <>
          {mealPlan ? (
            <div className="bg-slate-50/50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Calendar size={22} className="text-emerald-500" /> Today's Nutrients
                  </h2>
                  <p className="text-slate-500">Perfectly balanced for your health profile</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-emerald-500">{mealPlan.totalCalories}</span>
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Kcal</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-blue-500">{mealPlan.totalProtein}g</span>
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Protein</span>
                  </div>
                </div>
              </div>
              
              {renderMeal(mealPlan.meals?.breakfast || mealPlan.breakfast, 'Breakfast')}
              {renderMeal(mealPlan.meals?.lunch || mealPlan.lunch, 'Lunch')}
              {renderMeal(mealPlan.meals?.dinner || mealPlan.dinner, 'Dinner')}
              {renderMeal(mealPlan.meals?.snacks || mealPlan.snacks, 'Snacks')}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">No meal plan could be generated. Please update your profile health details.</p>
            </div>
          )}
        </>
      )}

      {/* Weekly View Content */}
      {viewMode === 'weekly' && (
        <>
          {weeklyPlan ? (
            <div className="space-y-6">
              
              {/* Day Selector */}
              <div className="flex flex-wrap gap-2 justify-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedDay === day
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>

              {/* Day's Meal Plan Card */}
              {selectedDayMeals ? (
                <div className="bg-slate-50/50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize mb-6 flex items-center gap-2">
                    <Calendar className="text-emerald-500" size={20} /> {selectedDay} Schedule
                  </h2>
                  {renderMeal(selectedDayMeals.breakfast, 'Breakfast')}
                  {renderMeal(selectedDayMeals.lunch, 'Lunch')}
                  {renderMeal(selectedDayMeals.dinner, 'Dinner')}
                  {renderMeal(selectedDayMeals.snacks, 'Snacks')}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-500">No data for this day.</p>
              )}

            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">No weekly meal plan could be generated. Please complete your profile health details.</p>
            </div>
          )}
        </>
      )}

      {/* Recipe Modal */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedFood(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            {/* Image Header */}
            <div className="h-64 overflow-hidden relative shrink-0">
              <img 
                src={getFoodImage(selectedFood.name)} 
                alt={selectedFood.name} 
                onError={(e) => {
                  if (e.target.src.startsWith('data:')) return;
                      if (!e.target.src.includes('loremflickr')) {
                    e.target.src = 'https://loremflickr.com/400/300/' + encodeURIComponent(selectedFood.name.split(' Variant')[0]);
                  } else {
                    e.target.src = defaultFoodSvg;
                  }
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {selectedFood.name}
                </h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-grow">
              
              {/* Macro info */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <div className="text-center">
                  <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Calories</span>
                  <span className="text-lg font-extrabold text-slate-800 dark:text-white">{Math.round(selectedFood.calories)} kcal</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Protein</span>
                  <span className="text-lg font-extrabold text-emerald-500">{Math.round(selectedFood.protein)}g</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Carbs</span>
                  <span className="text-lg font-extrabold text-blue-500">{Math.round(selectedFood.carbs || selectedFood.carbohydrates || 0)}g</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fat</span>
                  <span className="text-lg font-extrabold text-amber-500">{Math.round(selectedFood.fat)}g</span>
                </div>
              </div>

              {/* Recipe Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                
                {/* Ingredients */}
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-emerald-500" /> Ingredients Needed
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {getRecipeDetails(selectedFood.name).ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-emerald-500" /> Preparation
                  </h4>
                  <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    {getRecipeDetails(selectedFood.name).instructions.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-bold text-emerald-500 shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MealPlannerPage;
