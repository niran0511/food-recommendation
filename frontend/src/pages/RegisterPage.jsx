import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const { register, loginWithProvider, user } = useAuth();
  const navigate = useNavigate();

  const handleSwitchToggle = () => {
    setIsLightOn(!isLightOn);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialLogin = async (provider) => {
    setIsSubmitting(true);
    try {
      const userData = await loginWithProvider(provider);
      toast.success(`Successfully authenticated with ${provider}!`);

      localStorage.removeItem('dashboard_calories_logged');
      localStorage.removeItem('dashboard_water_logged');
      localStorage.removeItem('dashboard_protein_logged');
      localStorage.removeItem('dashboard_meals_eaten');

      const hasCompletedOnboarding = userData?.profile?.age && 
                                     userData?.profile?.height && 
                                     userData?.profile?.weight;

      if (userData && userData.role === 'admin') {
        navigate('/admin');
      } else if (!hasCompletedOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error(`Authentication failed with ${provider}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await register(formData);
      toast.success('Account created successfully!');

      // Clear persistent tracker logs on fresh register to start clean
      localStorage.removeItem('dashboard_calories_logged');
      localStorage.removeItem('dashboard_water_logged');
      localStorage.removeItem('dashboard_protein_logged');
      localStorage.removeItem('dashboard_meals_eaten');

      navigate('/onboarding');
    } catch (error) {
      // Error handled by api interceptor mostly
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0c0d0e] select-none">
      
      {/* Top Light Fixture & Pull Chain */}
      <div className="absolute top-0 left-0 right-0 z-40 flex flex-col items-center">
        
        {/* Trapezoidal Lampshade */}
        <div 
          className="w-32 h-14 bg-[#232425] shadow-md border-b border-black/30 relative"
          style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}
        />
        
        {/* Light Bulb */}
        <button
          onClick={handleSwitchToggle}
          className={`w-8 h-8 rounded-full -mt-1 transition-all duration-500 focus:outline-none relative z-50 ${
            isLightOn 
              ? 'bg-[#fffbeb] shadow-[0_0_60px_#fef08a,0_0_30px_#fbbf24] border border-amber-200' 
              : 'bg-slate-700 border border-slate-800'
          }`}
          title="Toggle Light"
        />

        {/* Pull Chain */}
        <motion.div 
          onClick={handleSwitchToggle}
          className="cursor-pointer group flex flex-col items-center relative z-40"
          style={{ originY: 0 }}
          animate={isLightOn ? { y: [0, 8, 0] } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Metal Chain Cord */}
          <div className="w-[1.5px] h-32 bg-gradient-to-b from-slate-600 to-slate-400 group-hover:bg-amber-400 transition-colors" />
          
          {/* Little metal pull knob */}
          <div className={`w-3.5 h-3.5 rounded-full -mt-0.5 border shadow-md group-hover:scale-110 transition-all ${
            isLightOn 
              ? 'bg-amber-400 border-amber-600 shadow-amber-500/20' 
              : 'bg-slate-500 border-slate-600'
          }`} />
        </motion.div>
      </div>

      {/* Cone/Spotlight Beam of Light */}
      <AnimatePresence>
        {isLightOn && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ 
              opacity: 1, 
              scaleY: 1,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            }}
            exit={{ 
              opacity: 0, 
              scaleY: 0,
              transition: { duration: 0.5, ease: 'easeInOut' }
            }}
            style={{ 
              originX: 0.5, 
              originY: 0,
              top: '52px', // Bottom of the lampshade / bulb center
              clipPath: 'polygon(50% 0%, 18% 100%, 82% 100%)'
            }}
            className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-b from-[#8f8f63]/30 via-[#8f8f63]/18 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Helper text when light is OFF */}
      <AnimatePresence>
        {!isLightOn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-32 z-30 text-center pointer-events-none"
          >
            <p className="text-slate-550 text-sm font-bold tracking-wide animate-pulse">
              Pull the cord to turn on the light
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Card Container */}
      <div className="relative z-20 w-full max-w-[420px] px-4 mt-20">
        <AnimatePresence>
          {isLightOn && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
              }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              className="bg-white rounded-[24px] shadow-2xl p-8 border border-slate-100 flex flex-col relative"
            >
              
              {/* Close Button in top right */}
              <button 
                onClick={handleSwitchToggle}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors font-bold text-lg"
              >
                ×
              </button>

              {/* Register Card Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Create Account
                </h2>
              </div>

              {/* Register Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  
                  {/* Name Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Name:</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <User className="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Email Address:</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium text-sm"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Password:</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <Lock className="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {/* SIGN UP Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-slate-900 bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-250 hover:to-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/10 cursor-pointer mt-2"
                >
                  {isSubmitting ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                </button>

                {/* Social Login buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <FaGoogle size={14} className="text-red-500" />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <FaGithub size={14} className="text-slate-900" />
                    GitHub
                  </button>
                </div>
              </form>

              {/* Bottom onboarding/create link */}
              <div className="mt-6 text-center border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-450 font-bold">
                  Already have an account?{' '}
                  <Link to="/login" className="font-extrabold text-amber-600 hover:text-amber-500 transition-colors inline-flex items-center gap-0.5">
                    Sign in instead <ArrowRight size={12} />
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Branding Badge */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center">
        <a 
          href="https://nutriai.org"
          target="_blank" 
          rel="noreferrer"
          className="px-4 py-2 rounded-full bg-black/60 border border-slate-800/80 backdrop-blur-md inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] text-white font-black">
            N
          </div>
          nutriai.org
        </a>
      </div>

    </div>
  );
};

export default RegisterPage;
