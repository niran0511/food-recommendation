import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
                N
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white">
                Nutri<span className="text-emerald-500">AI</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Your intelligent companion for personalized health-based food recommendations and automated meal planning.
            </p>
            <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-emerald-500 transition-colors">Twitter</a>
              <a href="#" className="hover:text-emerald-500 transition-colors">GitHub</a>
              <a href="#" className="hover:text-emerald-500 transition-colors">LinkedIn</a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Features</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/recommendations" className="hover:text-emerald-500 transition-colors">AI Recommendations</Link></li>
              <li><Link to="/meal-planner" className="hover:text-emerald-500 transition-colors">Smart Meal Planning</Link></li>
              <li><Link to="/nutrition" className="hover:text-emerald-500 transition-colors">Nutrition Tracking</Link></li>
              <li><Link to="/health-risk" className="hover:text-emerald-500 transition-colors">Health Risk Prediction</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} NutriAI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> by DeepMind AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
