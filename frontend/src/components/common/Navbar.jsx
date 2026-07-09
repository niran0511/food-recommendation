import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Menu, X, Home, Compass, Calendar, PieChart, 
  User as UserIcon, LogOut, Sun, Moon, Shield 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = user ? [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Recommendations', path: '/recommendations', icon: <Compass size={18} /> },
    { name: 'Meal Plan', path: '/meal-planner', icon: <Calendar size={18} /> },
    { name: 'Nutrition', path: '/nutrition', icon: <PieChart size={18} /> }
  ] : [
    { name: 'Home', path: '/', icon: <Home size={18} /> }
  ];

  if (user && user.role === 'admin') {
    navLinks.push({ name: 'Admin Console', path: '/admin', icon: <Shield size={18} /> });
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all">
              N
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">
              Nutri<span className="text-emerald-500">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors font-medium text-sm"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <UserIcon size={16} />
                  </div>
                  <span className="text-sm font-medium hidden lg:block text-slate-700 dark:text-slate-200">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-md shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl py-4 px-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 font-medium"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          
          <div className="my-2 border-t border-slate-200 dark:border-slate-800"></div>
          
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
              >
                <UserIcon size={18} />
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium w-full text-left"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-center font-medium border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-center font-medium bg-emerald-500 text-white rounded-lg"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
