import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { 
  User, Activity, Target, Utensils, AlertCircle, 
  HeartPulse, Scale, Save, RefreshCw
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
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    if (user) {
      const profile = user.profile || {};
      
      // Determine disease selection
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

      // Determine allergy selection
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      toast.success('Profile updated successfully!');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Failed to save profile settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Profile Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <User className="text-emerald-500" size={20} /> Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} required min="10" max="120"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} required min="50" max="300"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} required min="20" max="300"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Goals and Activity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Activity className="text-emerald-500" size={20} /> Lifestyle & Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Activity Level</label>
              <select name="activityLevel" value={formData.activityLevel} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all">
                <option value="Sedentary">Sedentary (Little or no exercise)</option>
                <option value="Lightly Active">Lightly Active (Light exercise 1-3 days/week)</option>
                <option value="Moderately Active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                <option value="Very Active">Very Active (Hard exercise 6-7 days/week)</option>
                <option value="Athlete">Athlete (Very hard exercise/physical job)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Primary Goal</label>
              <select name="goal" value={formData.goal} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all">
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Utensils className="text-emerald-500" size={20} /> Dietary Preference
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Diet Type</label>
            <select name="dietType" value={formData.dietType} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all">
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Eggetarian">Eggetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </div>
        </div>

        {/* Medical & Allergies */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <HeartPulse className="text-rose-500" size={20} /> Medical Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Health Condition</label>
              <select name="diseaseSelection" value={formData.diseaseSelection} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all mb-3">
                {COMMON_DISEASES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {formData.diseaseSelection === 'Other' && (
                <input type="text" name="customDisease" value={formData.customDisease} onChange={handleChange}
                  placeholder="Specify health condition"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Allergy</label>
              <select name="allergySelection" value={formData.allergySelection} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all mb-3">
                {COMMON_ALLERGIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {formData.allergySelection === 'Other' && (
                <input type="text" name="customAllergy" value={formData.customAllergy} onChange={handleChange}
                  placeholder="Specify allergy"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button type="submit" disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-70">
            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProfilePage;
