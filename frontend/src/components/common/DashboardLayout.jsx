import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Menu, X, Home, Compass, Calendar, PieChart, 
  User as UserIcon, LogOut, Sun, Moon, Bell, Search,
  Activity, Heart
} from 'lucide-react';
import ChatWidget from './ChatWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [topSearch, setTopSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      const n = notifications.find(x => x._id === id);
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(item => item._id === id ? { ...item, isRead: true } : item));
      setIsNotificationsOpen(false);

      if (n) {
        const title = n.title.toLowerCase();
        if (title.includes('profile') || title.includes('health') || title.includes('record')) {
          navigate('/health-risk');
        } else if (title.includes('appointment') || title.includes('booking') || title.includes('consult')) {
          navigate('/doctors');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTopSearchSubmit = (e) => {
    e.preventDefault();
    if (topSearch.trim()) {
      navigate(`/food-search?q=${encodeURIComponent(topSearch.trim())}`);
      setTopSearch('');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Food Recommendation', path: '/recommendations', icon: <Compass size={20} /> },
    { name: 'Meal Planner', path: '/meal-planner', icon: <Calendar size={20} /> },
    { name: 'Nutrition Analysis', path: '/nutrition', icon: <PieChart size={20} /> },
    { name: 'Health Reports', path: '/health-risk', icon: <Activity size={20} /> },
    { name: 'Consult Doctors', path: '/doctors', icon: <Heart size={20} /> },
    { name: 'Profile', path: '/profile', icon: <UserIcon size={20} /> }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors duration-500 overflow-hidden w-full">
      
      {/* Background Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 dark:bg-amber-600/5 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#f97316]/5 dark:bg-[#6366f1]/5 blur-[150px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Elegant Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/70 dark:bg-slate-950/40 backdrop-blur-xl border-r border-slate-205/50 dark:border-white/5 flex flex-col justify-between transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:h-screen shrink-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header & Logo */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
                N
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Nutri<span className="text-amber-500">AI</span>
              </span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all relative overflow-hidden group ${
                  isActive(item.path)
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-500/10 shadow-inner'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-105/50 dark:hover:bg-white/5'
                }`}
              >
                {/* Glowing line for active link */}
                {isActive(item.path) && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-amber-500 dark:bg-amber-400" />
                )}
                <span className={`transition-transform duration-300 group-hover:scale-110 ${
                  isActive(item.path) ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-650 dark:group-hover:text-slate-300'
                }`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer User Section */}
        <div className="p-6 border-t border-slate-200/50 dark:border-white/5 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
          <Link
            to="/profile"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-200/30 dark:border-amber-800/30 shadow-md shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {user?.name || 'User Profile'}
              </p>
              <p className="text-xs font-semibold text-slate-450 dark:text-slate-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 min-w-0">
        
        {/* Glassmorphic Top Navigation Bar */}
        <header className="bg-white/40 dark:bg-[#090d16]/30 backdrop-blur-md border-b border-slate-200/40 dark:border-white/5 px-6 py-4 flex items-center justify-between shrink-0 relative z-50">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden text-slate-500 dark:text-slate-400"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'} 👋
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Track your nutrient goals and stay healthy!
              </p>
            </div>
          </div>

          {/* Top Nav Controls */}
          <div className="flex items-center gap-4">
            
            {/* Global Search Bar */}
            <form onSubmit={handleTopSearchSubmit} className="relative hidden md:block w-64 group">
              <input 
                type="text"
                placeholder="Search recipe, metrics..."
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                className="w-full bg-slate-150/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
              />
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            </form>

            {/* Notification Icon */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 relative active:scale-95 transition-all"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500"></span>
                  </>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl shadow-xl p-4 z-50 space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Notifications ({unreadCount})</span>
                      <button 
                        onClick={handleClearAll}
                        className="text-[10px] font-extrabold text-amber-500 hover:underline"
                      >
                        Clear All Unread
                      </button>
                    </div>
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-450 dark:text-slate-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n._id}
                            onClick={() => handleMarkAsRead(n._id)}
                            className="cursor-pointer"
                          >
                            <NotificationItem 
                              title={n.title}
                              text={n.message} 
                              time={new Date(n.createdAt).toLocaleDateString() + ' ' + new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                              isRead={n.isRead}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Scrollable Layout Body */}
        <main className="flex-grow overflow-y-auto relative p-6">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Chat Assistant Widget */}
      <ChatWidget />
    </div>
  );
};

// Notification item row helper
const NotificationItem = ({ title, text, time, isRead }) => (
  <div className={`p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border ${isRead ? 'border-transparent' : 'border-amber-100 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-900/5'} flex flex-col gap-1`}>
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wide">{title}</span>
      {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
    </div>
    <p className="text-xs text-slate-750 dark:text-slate-350 leading-relaxed">{text}</p>
    <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{time}</span>
  </div>
);

export default DashboardLayout;
