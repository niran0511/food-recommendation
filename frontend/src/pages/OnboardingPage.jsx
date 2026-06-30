import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { 
  User, Activity, Target, Utensils, AlertCircle, 
  ChevronRight, ChevronLeft, Check, Plus, HeartPulse, Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON_DISEASES = [
  'None', 'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 
  'Heart Disease', 'PCOS', 'Thyroid Disorder', 'Other'
];

const COMMON_ALLERGIES = [
  'None', 'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 
  'Wheat', 'Soy', 'Fish', 'Shellfish', 'Other'
];

const OnboardingPage = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    activityLevel: 'Moderately Active',
    goal: 'Healthy Eating',
    dietType: 'Non-Vegetarian',
    diseaseSelection: 'None',
    customDisease: '',
    allergySelection: 'None',
    customAllergy: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.age || !formData.height || !formData.weight) {
        toast.error("Please fill in all basic details.");
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const diseases = [];
    if (formData.diseaseSelection !== 'None') {
      diseases.push(formData.diseaseSelection === 'Other' ? formData.customDisease : formData.diseaseSelection);
    }
    
    const allergies = [];
    if (formData.allergySelection !== 'None') {
      allergies.push(formData.allergySelection === 'Other' ? formData.customAllergy : formData.allergySelection);
    }

    const profileData = {
      age: Number(formData.age),
      gender: formData.gender,
      height: Number(formData.height),
      weight: Number(formData.weight),
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      dietType: formData.dietType,
      diseases: diseases.filter(Boolean),
      allergies: allergies.filter(Boolean),
    };

    try {
      setIsSubmitting(true);
      await api.put('/users/profile', { profile: profileData });
      toast.success('Profile completed successfully!');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative z-10">
      <div className="max-w-2xl w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 overflow-hidden relative">
        
        {/* Progress Bar */}
        <div className="mb-8 relative">
          <div className="flex justify-between mb-2">
            {['Basic Info', 'Lifestyle', 'Dietary', 'Medical'].map((label, i) => (
              <span key={i} className={`text-xs font-medium ${step >= i + 1 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {label}
              </span>
            ))}
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {step === 1 && "Let's get to know you"}
            {step === 2 && "Your lifestyle & goals"}
            {step === 3 && "Dietary preferences"}
            {step === 4 && "Medical information"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {step === 1 && "This helps us calculate your specific nutritional needs."}
            {step === 2 && "We'll tailor recommendations to support your daily activity."}
            {step === 3 && "Tell us what you like to eat."}
            {step === 4 && "Critical for generating safe, health-focused recommendations."}
          </p>
        </div>

        <div className="relative min-h-[350px]">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Age</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input type="number" name="age" value={formData.age} onChange={handleChange} min="10" max="120"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                        placeholder="Years" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Height (cm)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Activity size={18} />
                      </div>
                      <input type="number" name="height" value={formData.height} onChange={handleChange} min="50" max="300"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                        placeholder="e.g. 175" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Weight (kg)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Scale size={18} />
                      </div>
                      <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="20" max="300"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                        placeholder="e.g. 70" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Activity Level</label>
                  <select name="activityLevel" value={formData.activityLevel} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none">
                    <option value="Sedentary">Sedentary (Little or no exercise)</option>
                    <option value="Lightly Active">Lightly Active (Light exercise 1-3 days/week)</option>
                    <option value="Moderately Active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                    <option value="Very Active">Very Active (Hard exercise 6-7 days/week)</option>
                    <option value="Athlete">Athlete (Very hard exercise/physical job)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Primary Goal</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Weight Loss', 'Weight Gain', 'Muscle Gain', 'Fat Loss', 'Maintain Weight', 'Healthy Eating'].map((goal) => (
                      <div 
                        key={goal}
                        onClick={() => setFormData(prev => ({...prev, goal}))}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          formData.goal === goal 
                            ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Target size={18} className={formData.goal === goal ? 'text-emerald-500' : 'text-slate-400'} />
                          <span className={formData.goal === goal ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                            {goal}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Diet Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Vegetarian'].map((diet) => (
                      <div 
                        key={diet}
                        onClick={() => setFormData(prev => ({...prev, dietType: diet}))}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          formData.dietType === diet 
                            ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Utensils size={18} className={formData.dietType === diet ? 'text-emerald-500' : 'text-slate-400'} />
                          <span className={formData.dietType === diet ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                            {diet}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <HeartPulse size={16} className="text-rose-500" />
                    Medical Conditions
                  </label>
                  <select 
                    name="diseaseSelection" 
                    value={formData.diseaseSelection} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none mb-3"
                  >
                    {COMMON_DISEASES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  
                  {formData.diseaseSelection === 'Other' && (
                    <input 
                      type="text" 
                      name="customDisease" 
                      value={formData.customDisease} 
                      onChange={handleChange}
                      placeholder="Please specify your medical condition"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all animate-fade-in"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-500" />
                    Food Allergies
                  </label>
                  <select 
                    name="allergySelection" 
                    value={formData.allergySelection} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none mb-3"
                  >
                    {COMMON_ALLERGIES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>

                  {formData.allergySelection === 'Other' && (
                    <input 
                      type="text" 
                      name="customAllergy" 
                      value={formData.customAllergy} 
                      onChange={handleChange}
                      placeholder="Please specify your allergy"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all animate-fade-in"
                    />
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={prevStep}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              step === 1 
                ? 'opacity-0 pointer-events-none' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
            >
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile'} <Check size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingPage;
