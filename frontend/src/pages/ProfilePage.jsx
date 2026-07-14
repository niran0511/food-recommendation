import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { 
  User, Activity, Utensils, AlertCircle, 
  HeartPulse, Scale, Save, RefreshCw, ClipboardList, ShieldAlert
} from 'lucide-react';

const COMMON_DISEASES = [
  'None', 'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 
  'Heart Disease', 'PCOS', 'Thyroid Disorder', 'Other'
];

const COMMON_ALLERGIES = [
  'None', 'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 
  'Wheat', 'Soy', 'Fish', 'Shellfish', 'Other'
];

const ProfilePage = () => {
  const { user } = useAuth();
  
  // Navigation tabs
  const [profileTab, setProfileTab] = useState('general'); // 'general' or 'intake'

  const [isSaving, setIsSaving] = useState(false);
  const [isIntakeSaving, setIsIntakeSaving] = useState(false);

  // Profile fields
  const [formData, setFormData] = useState({
    name: '',
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

  // Pre-Consultation Intake fields
  const [intakeData, setIntakeData] = useState({
    dietaryPreferences: '',
    allergies: '',
    dailySchedule: '',
    budgetPreference: '',
    fitnessGoals: '',
    barriersToProgress: ''
  });

  // Load basic profile
  useEffect(() => {
    if (user) {
      const profile = user.profile || {};
      
      let diseaseSelection = 'None';
      let customDisease = '';
      if (profile.diseases && profile.diseases.length > 0) {
        const primaryDisease = profile.diseases[0];
        if (COMMON_DISEASES.includes(primaryDisease)) {
          diseaseSelection = primaryDisease;
        } else {
          diseaseSelection = 'Other';
          customDisease = primaryDisease;
        }
      }

      let allergySelection = 'None';
      let customAllergy = '';
      if (profile.allergies && profile.allergies.length > 0) {
        const primaryAllergy = profile.allergies[0];
        if (COMMON_ALLERGIES.includes(primaryAllergy)) {
          allergySelection = primaryAllergy;
        } else {
          allergySelection = 'Other';
          customAllergy = primaryAllergy;
        }
      }

      setFormData({
        name: user.name || '',
        age: profile.age || '',
        gender: profile.gender || 'Male',
        height: profile.height || '',
        weight: profile.weight || '',
        activityLevel: profile.activityLevel || 'Moderately Active',
        goal: profile.goal || 'Healthy Eating',
        dietType: profile.dietType || 'Non-Vegetarian',
        diseaseSelection,
        customDisease,
        allergySelection,
        customAllergy
      });
    }
  }, [user]);

  // Load Intake questionnaire
  useEffect(() => {
    const fetchIntake = async () => {
      try {
        const res = await api.get('/intake');
        if (res.data?.data?.questionnaire) {
          const q = res.data.data.questionnaire;
          setIntakeData({
            dietaryPreferences: q.dietaryPreferences || '',
            allergies: q.allergies || '',
            dailySchedule: q.dailySchedule || '',
            budgetPreference: q.budgetPreference || '',
            fitnessGoals: q.fitnessGoals || '',
            barriersToProgress: q.barriersToProgress || ''
          });
        }
      } catch (err) {
        console.error("No existing intake loaded", err);
      }
    };
    fetchIntake();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIntakeChange = (e) => {
    const { name, value } = e.target;
    setIntakeData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const diseases = [];
    if (formData.diseaseSelection !== 'None') {
      diseases.push(formData.diseaseSelection === 'Other' ? formData.customDisease : formData.diseaseSelection);
    }
    
    const allergies = [];
    if (formData.allergySelection !== 'None') {
      allergies.push(formData.allergySelection === 'Other' ? formData.customAllergy : formData.allergySelection);
    }

    const payload = {
      name: formData.name,
      profile: {
        age: Number(formData.age),
        gender: formData.gender,
        height: Number(formData.height),
        weight: Number(formData.weight),
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        dietType: formData.dietType,
        diseases: diseases.filter(Boolean),
        allergies: allergies.filter(Boolean)
      }
    };

    try {
      await api.put('/users/profile', payload);
      toast.success('Profile parameters updated successfully!');
    } catch (error) {
      toast.error('Failed to save profile settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    setIsIntakeSaving(true);
    try {
      await api.post('/intake', intakeData);
      toast.success('Consultation intake history saved! Your nutritionist can inspect this.');
    } catch (e) {
      toast.error('Failed to save intake questionnaire details');
    } finally {
      setIsIntakeSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Configure your physiological parameters and pre-consultation intake history.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5">
          <button 
            onClick={() => setProfileTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${profileTab === 'general' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
          >
            <User size={13} className="inline mr-1" /> General Profile
          </button>
          <button 
            onClick={() => setProfileTab('intake')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${profileTab === 'intake' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
          >
            <ClipboardList size={13} className="inline mr-1" /> Consultation Intake
          </button>
        </div>
      </div>

      {/* Tab 1: General Profile Form */}
      {profileTab === 'general' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="text-emerald-500" size={20} /> Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-bold text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} required min="10" max="120"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-bold text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-bold text-slate-900 dark:text-slate-100">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Height (cm)</label>
                  <input type="number" name="height" value={formData.height} onChange={handleChange} required min="50" max="300"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-bold text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} required min="20" max="300"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-bold text-slate-900 dark:text-slate-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Goals and Activity */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="text-emerald-500" size={20} /> Lifestyle & Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Activity Level</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-bold text-slate-900 dark:text-slate-100">
                  <option value="Sedentary">Sedentary (Little or no exercise)</option>
                  <option value="Lightly Active">Lightly Active (Light exercise 1-3 days/week)</option>
                  <option value="Moderately Active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                  <option value="Very Active">Very Active (Hard exercise 6-7 days/week)</option>
                  <option value="Athlete">Athlete (Very hard exercise/physical job)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Primary Goal</label>
                <select name="goal" value={formData.goal} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-bold text-slate-900 dark:text-slate-100">
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Weight Gain">Weight Gain</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Fat Loss">Fat Loss</option>
                  <option value="Maintain Weight">Maintain Weight</option>
                  <option value="Healthy Eating">Healthy Eating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm text-xs">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Utensils className="text-emerald-500" size={20} /> Dietary Preference
            </h2>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Diet Type</label>
              <select name="dietType" value={formData.dietType} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-bold text-slate-900 dark:text-slate-100">
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Eggetarian">Eggetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          {/* Medical & Allergies */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm text-xs">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <HeartPulse className="text-rose-500" size={20} /> Medical Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Health Condition</label>
                <select name="diseaseSelection" value={formData.diseaseSelection} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all mb-3 font-bold text-slate-900 dark:text-slate-100">
                  {COMMON_DISEASES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {formData.diseaseSelection === 'Other' && (
                  <input type="text" name="customDisease" value={formData.customDisease} onChange={handleChange}
                    placeholder="Specify health condition"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-bold text-slate-900 dark:text-slate-100" />
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Allergy</label>
                <select name="allergySelection" value={formData.allergySelection} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all mb-3 font-bold text-slate-900 dark:text-slate-100">
                  {COMMON_ALLERGIES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                {formData.allergySelection === 'Other' && (
                  <input type="text" name="customAllergy" value={formData.customAllergy} onChange={handleChange}
                    placeholder="Specify allergy"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-bold text-slate-900 dark:text-slate-100" />
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button type="submit" disabled={isSaving}
              className="flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-70 cursor-pointer">
              {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              Save Changes
            </button>
          </div>

        </form>
      )}

      {/* Tab 2: Consultation Intake questionnaire */}
      {profileTab === 'intake' && (
        <form onSubmit={handleIntakeSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm text-xs">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <ClipboardList className="text-amber-500" size={20} /> Consultation Intake History
            </h2>
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl mb-6 flex gap-3 text-slate-650 dark:text-slate-300 font-bold items-start">
              <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <p>Filling this questionnaire helps our clinical nutritionist analyze your food preferences, dietary limits, daily scheduling barriers, and customize your diet guidelines.</p>
            </div>

            <div className="space-y-5 text-xs font-bold text-slate-700 dark:text-slate-350">
              <div>
                <label className="block text-slate-500 mb-1.5 uppercase">Detailed Dietary & Food Preferences</label>
                <textarea name="dietaryPreferences" value={intakeData.dietaryPreferences} onChange={handleIntakeChange} required placeholder="e.g. Vegetarian, avoid high dairy, prefer low carb rice variations."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 h-20 resize-none" />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 uppercase">Specific Allergies or Dietary Sensitivities</label>
                <textarea name="allergies" value={intakeData.allergies} onChange={handleIntakeChange} required placeholder="e.g. Lactose intolerant, slight peanut sensitivity."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 h-20 resize-none" />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 uppercase">Daily Schedule & Meal Timing constraints</label>
                <textarea name="dailySchedule" value={intakeData.dailySchedule} onChange={handleIntakeChange} required placeholder="e.g. Breakfast around 8:30 AM, Lunch at 1:30 PM, Dinner by 8:30 PM. Gym at 6:00 PM."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 h-20 resize-none" />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 uppercase">Grocery Budgetary preferences</label>
                <input type="text" name="budgetPreference" value={intakeData.budgetPreference} onChange={handleIntakeChange} required placeholder="e.g. Moderate budget, prefer easily accessible local products."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30" />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 uppercase">Health Goals (Short & Long-term)</label>
                <textarea name="fitnessGoals" value={intakeData.fitnessGoals} onChange={handleIntakeChange} required placeholder="e.g. Reduce blood pressure, lose 5kg weight, stabilize fasting sugar levels."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 h-20 resize-none" />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 uppercase">Key Obstacles & Barriers to progress</label>
                <textarea name="barriersToProgress" value={intakeData.barriersToProgress} onChange={handleIntakeChange} required placeholder="e.g. Late night snacks cravings, desk job with minimal activity."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 h-20 resize-none" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button type="submit" disabled={isIntakeSaving}
              className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-500/10 active:scale-95 transition-all disabled:opacity-70 cursor-pointer">
              {isIntakeSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              Submit Intake Form
            </button>
          </div>
        </form>
      )}

    </div>
  );
};

export default ProfilePage;
