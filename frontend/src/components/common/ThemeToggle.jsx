import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${
        isDark
          ? 'bg-slate-700/50 text-amber-400 hover:bg-slate-600/50'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      } ${className}`}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
