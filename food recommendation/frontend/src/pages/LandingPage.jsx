import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Heart, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-slate-800 -z-10"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-emerald-300/30 dark:bg-emerald-900/20 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-md mb-8 shadow-sm">
              <Sparkles size={16} className="text-emerald-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI-Powered Nutrition Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-tight">
              Eat smarter, live better with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">NutriAI</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Personalized food recommendations and smart meal planning based on your unique health profile, conditions, and goals.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
                  >
                    Start Your Journey <ArrowRight size={20} />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-all hover:-translate-y-1"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Intelligence at every meal
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our advanced machine learning models analyze thousands of data points to craft the perfect nutritional strategy just for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Health-Driven AI</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Recommendations tailored to your BMI, medical conditions like diabetes or hypertension, and specific fitness goals.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Allergen & Disease Safe</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Strict filtering guarantees you'll never be recommended foods that clash with your allergies or existing medical conditions.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Smart Meal Planning</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatically generate perfectly balanced daily and weekly meal plans that hit your precise macro and micronutrient targets.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
