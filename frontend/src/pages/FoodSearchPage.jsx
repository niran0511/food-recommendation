import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader, Search, Sparkles, SlidersHorizontal, BookOpen, Clock, X, Heart } from 'lucide-react';
import { getFoodImage, getRecipeDetails } from '../utils/recipeHelper';
import toast from 'react-hot-toast';

const defaultFoodSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='f' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2310b981'/><stop offset='100%' stop-color='%23059669'/></linearGradient></defs><rect width='100' height='100' fill='url(%23f)'/><circle cx='50' cy='50' r='30' fill='none' stroke='white' stroke-width='4' opacity='0.9'/><circle cx='50' cy='50' r='22' fill='none' stroke='white' stroke-width='2' opacity='0.6'/><path d='M30 35v20M27 35v10M33 35v10M30 55v15' stroke='white' stroke-width='3' stroke-linecap='round'/><path d='M70 35v20M70 55v15' stroke='white' stroke-width='3' stroke-linecap='round'/><path d='M68 35c2 0 4 5 4 15v5h-8v-5c0-10 2-15 4-15z' fill='white' opacity='0.9'/></svg>";

const CUISINES = ['Indian', 'Mexican', 'Italian', 'Chinese', 'American', 'Mediterranean'];
const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIET_TYPES = ['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Vegetarian'];

const FoodSearchPage = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [category, setCategory] = useState('');
  const [dietType, setDietType] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState([]);
  
  const [selectedFood, setSelectedFood] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch foods
  const fetchFoods = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search: search || undefined,
        cuisine: cuisine || undefined,
        category: category || undefined,
        diet_type: dietType || undefined
      };
      
      const res = await api.get('/foods', { params });
      setFoods(res.data.data.foods || []);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (error) {
      toast.error("Failed to fetch foods");
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorites
  const fetchFavorites = async () => {
    try {
      const res = await api.get('/users/favorites');
      setFavorites(res.data.data.favorites || []);
    } catch (e) {
      // Favorites route might not be initialized yet
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [page, cuisine, category, dietType]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFoods();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCuisine('');
    setCategory('');
    setDietType('');
    setPage(1);
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
      toast.error("Favorites feature is sync-updating...");
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 relative">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Discover Food Database
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Browse our healthy food database, check macronutrients, and find cooking recipes.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods (e.g. Tacos, Dal)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm transition-all"
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/15 text-sm transition-colors active:scale-95"
            >
              Search
            </button>
          </div>
        </form>

        {/* Extended Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Cuisine</label>
              <select
                value={cuisine}
                onChange={(e) => { setCuisine(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none"
              >
                <option value="">All Cuisines</option>
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Diet Type</label>
              <select
                value={dietType}
                onChange={(e) => { setDietType(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none"
              >
                <option value="">All Diets</option>
                {DIET_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-rose-500 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400">No foods found matching your search. Try resetting filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {foods.map((food) => {
              const isFav = favorites.includes(food.name);
              return (
                <div
                  key={food._id}
                  onClick={() => setSelectedFood(food)}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-44 overflow-hidden relative shrink-0">
                    <img
                      src={getFoodImage(food.name)}
                      alt={food.name}
                      onError={(e) => {
                        if (!e.target.src.includes('loremflickr')) {
                          e.target.src = 'https://loremflickr.com/400/300/' + encodeURIComponent(food.name.split(' Variant')[0]);
                        } else {
                          e.target.src = defaultFoodSvg;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => toggleFavorite(food.name, e)}
                      className="absolute top-3 right-3 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full shadow-md hover:scale-110 active:scale-95 transition-all text-rose-500"
                    >
                      <Heart size={18} fill={isFav ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">{food.name}</h3>
                    
                    <div className="flex gap-2 mb-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">
                        {food.cuisine}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/50 mb-4 shrink-0 text-center">
                      <div>
                        <span className="block text-[8px] uppercase font-bold text-slate-400">Cal</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{Math.round(food.calories)}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase font-bold text-slate-400">Pro</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{Math.round(food.protein)}g</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase font-bold text-slate-400">Carb</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{Math.round(food.carbohydrates)}g</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase font-bold text-slate-400">Fat</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{Math.round(food.fat)}g</span>
                      </div>
                    </div>

                    <div className="mt-auto text-xs text-emerald-500 font-bold flex items-center gap-1 group-hover:underline">
                      <BookOpen size={12} /> View Recipe & Ingredients
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold disabled:opacity-50 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold disabled:opacity-50 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Next
              </button>
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
                  <span className="text-lg font-extrabold text-blue-500">{Math.round(selectedFood.carbohydrates)}g</span>
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

export default FoodSearchPage;
