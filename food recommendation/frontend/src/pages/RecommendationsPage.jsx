import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader, Sparkles, CheckCircle, XCircle, AlertTriangle, Clock, BookOpen, X, Heart } from 'lucide-react';
import { getFoodImage, getRecipeDetails } from '../utils/recipeHelper';
import toast from 'react-hot-toast';

const defaultFoodSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='f' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23f59e0b'/><stop offset='100%' stop-color='%23d97706'/></linearGradient></defs><rect width='100' height='100' fill='url(%23f)'/><path d='M30 65c10-5 30-5 40 0v10H30V65z' fill='white'/><circle cx='50' cy='45' r='10' fill='white'/><path d='M48 25h4v15h-4z' fill='white'/></svg>";

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [foodsToAvoid, setFoodsToAvoid] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('eat'); // 'eat', 'avoid'
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [recRes, avoidRes] = await Promise.all([
          api.post('/recommendations'),
          api.post('/recommendations/foods-to-avoid')
        ]);
        
        setRecommendations(recRes.data.data.recommendations || []);
        setFoodsToAvoid(avoidRes.data.data.foodsToAvoid || []);
        
        try {
          const favsRes = await api.get('/users/favorites');
          setFavorites(favsRes.data.data.favorites || []);
        } catch (e) {}
      } catch (error) {
        toast.error("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
          <Loader className="w-16 h-16 text-emerald-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-8 mb-2">Analyzing Your Health Profile</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-md">
          Our AI is crunching the numbers to generate your recommended and restricted foods...
        </p>
      </div>
    );
  }

  const renderFoodCard = (rec, isAvoid = false) => {
    const imageUrl = getFoodImage(rec.food);
    const isFav = favorites.includes(rec.food);
    
    return (
      <div 
        key={rec.food} 
        onClick={() => setSelectedFood({ ...rec, isAvoid })}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] cursor-pointer transition-all group flex flex-col relative"
      >
        <div className="h-48 overflow-hidden relative shrink-0">
          <img 
            src={imageUrl} 
            alt={rec.food} 
            onError={(e) => { e.target.src = defaultFoodSvg; }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {!isAvoid && (
            <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              <span className="text-emerald-600 dark:text-emerald-400">{rec.score}% Match</span>
            </div>
          )}
          
          {/* Favorite Heart Button */}
          <button
            onClick={(e) => toggleFavorite(rec.food, e)}
            className="absolute top-3 right-3 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full shadow-md hover:scale-110 active:scale-95 transition-all text-rose-500"
          >
            <Heart size={16} fill={isFav ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">{rec.food}</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {rec.category}
            </span>
          </div>
          
          {!isAvoid && (
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Cal</span>
                <span className="block font-semibold text-slate-800 dark:text-slate-200">{Math.round(rec.calories)}</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Pro</span>
                <span className="block font-semibold text-slate-800 dark:text-slate-200">{Math.round(rec.protein)}g</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Carb</span>
                <span className="block font-semibold text-slate-800 dark:text-slate-200">{Math.round(rec.carbohydrates)}g</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Fat</span>
                <span className="block font-semibold text-slate-800 dark:text-slate-200">{Math.round(rec.fat)}g</span>
              </div>
            </div>
          )}

          <div className="mt-auto space-y-3">
            {rec.reasons_for && rec.reasons_for.slice(0, 2).map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{reason}</span>
              </div>
            ))}
            {rec.reasons_against && rec.reasons_against.slice(0, 2).map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <XCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{reason}</span>
              </div>
            ))}
            <div className="text-xs text-emerald-500 font-bold pt-2 flex items-center gap-1 group-hover:underline">
              <BookOpen size={12} /> View Recipe & Ingredients
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 relative">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
          <Sparkles size={16} /> AI-Curated For You
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Smart Food Recommendations
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Click any food item below to explore its ingredients and find out how to prepare it.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        <button 
          onClick={() => setActiveTab('eat')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'eat' 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
          }`}
        >
          <CheckCircle size={18} /> General Foods to Eat
        </button>
        <button 
          onClick={() => setActiveTab('avoid')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'avoid' 
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' 
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50'
          }`}
        >
          <AlertTriangle size={18} /> Foods to Avoid
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'eat' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.length > 0 ? (
              recommendations.map(rec => renderFoodCard(rec, false))
            ) : (
              <p className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">No recommendations available.</p>
            )}
          </div>
        )}

        {activeTab === 'avoid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {foodsToAvoid.length > 0 ? (
              foodsToAvoid.map(rec => renderFoodCard(rec, true))
            ) : (
              <p className="col-span-full text-center py-12 text-slate-500 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                Great news! Based on your profile, there are no specific foods you absolutely must avoid.
              </p>
            )}
          </div>
        )}
      </div>

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
                src={getFoodImage(selectedFood.food)} 
                alt={selectedFood.food} 
                onError={(e) => { e.target.src = defaultFoodSvg; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500 text-white uppercase tracking-wider mb-2 inline-block">
                  {selectedFood.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {selectedFood.food}
                </h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-grow">
              
              {/* Health Warnings / Highlights */}
              {selectedFood.isAvoid ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-rose-800 dark:text-rose-400">Why Avoid This:</h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-rose-700 dark:text-rose-300">
                      {selectedFood.reasons_against && selectedFood.reasons_against.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
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
                    <span className="text-lg font-extrabold text-blue-500">{Math.round(selectedFood.carbohydrates)}g</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fat</span>
                    <span className="text-lg font-extrabold text-amber-500">{Math.round(selectedFood.fat)}g</span>
                  </div>
                </div>
              )}

              {/* Recipe Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                
                {/* Ingredients */}
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-emerald-500" /> Ingredients Needed
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {getRecipeDetails(selectedFood.food).ingredients.map((ing, i) => (
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
                    {getRecipeDetails(selectedFood.food).instructions.map((step, i) => (
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

export default RecommendationsPage;
