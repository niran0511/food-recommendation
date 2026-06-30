import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Activity, Heart, Award, ArrowLeft, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const HealthRiskPage = () => {
  const { user } = useAuth();
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiskAssessment = async () => {
      try {
        setLoading(true);
        const res = await api.post('/health/risk-assessment');
        setRiskData(res.data?.data?.riskAssessment || null);
      } catch (err) {
        console.error(err);
        setError("Failed to retrieve your health risk profile. Ensure your profile metrics are filled.");
        toast.error("Error loading health risk assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchRiskAssessment();
  }, []);

  const getWorkoutRecommendations = () => {
    if (!riskData) return [];
    const workouts = [];
    if (riskData.obesity_risk > 0.4) {
      workouts.push({
        title: "HIIT Weight Shred",
        time: "35 mins",
        intensity: "High",
        benefit: "Accelerates caloric deficit and lipid metabolism."
      });
    }
    if (riskData.diabetes_risk > 0.4) {
      workouts.push({
        title: "Resistance Strength Splits",
        time: "45 mins",
        intensity: "Moderate",
        benefit: "Enhances insulin sensitivity and skeletal muscle glucose clearance."
      });
    }
    if (riskData.hypertension_risk > 0.4 || riskData.heart_disease_risk > 0.4) {
      workouts.push({
        title: "Aerobic Cardiovascular pace",
        time: "30 mins",
        intensity: "Low-Moderate",
        benefit: "Improves diastolic stroke volume and reduces arterial stiffness."
      });
    }
    if (workouts.length === 0) {
      workouts.push({
        title: "General Fitness splits",
        time: "45 mins",
        intensity: "Varies",
        benefit: "General aerobic capacity and core stabilization splits."
      });
    }
    return workouts;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
          <Loader2 className="w-16 h-16 text-amber-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-8 mb-2">Analyzing Health Risks</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-md">
          Running your vitals and feature vectors through our Random Forest and Multi-Output classifiers...
        </p>
      </div>
    );
  }

  // Profile incomplete warning
  if (error || !riskData || !user?.profile?.age) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Profile Setup Required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We need vital parameters like Age, Weight, Height, Activity Levels, and existing diseases to predict risks using our ML models.
            </p>
          </div>
          <Link 
            to="/profile" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl shadow-md transition-all active:scale-95"
          >
            Complete Health Profile <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // Helper to color-code risk percentages
  const getRiskLabel = (val) => {
    if (val >= 0.7) return { text: 'High Risk', class: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    if (val >= 0.4) return { text: 'Medium Risk', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    return { text: 'Low Risk', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
  };

  const getRiskBarColor = (val) => {
    if (val >= 0.7) return 'bg-rose-500';
    if (val >= 0.4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl space-y-8 print:p-0">
      
      {/* Print stylesheet */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          header, aside, .floating-chat-button {
            display: none !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* Back button */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors print:hidden">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Health Risk Profile
            </h1>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-205 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 text-slate-750 dark:text-slate-300 font-extrabold text-[10px] rounded-xl shadow-sm transition-all print:hidden active:scale-95 cursor-pointer"
            >
              🖨️ Print Clinical Report
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-450 text-sm mt-1">
            Machine Learning risk assessments calculated from your clinical data.
          </p>
        </div>
        
        {/* Overall Score Badge */}
        <div className="px-6 py-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-202 dark:border-white/5 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Overall Health Score</span>
            <span className="text-xl font-black text-slate-800 dark:text-white">
              {riskData.overall_health_score}% Optimal
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Risks list & factor summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Disease Risk Breakdown Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="text-amber-500" size={18} />
            Predicted Pathological Risks
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Obesity Risk */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Obesity Index</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRiskLabel(riskData.obesity_risk).class}`}>
                  {getRiskLabel(riskData.obesity_risk).text}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-slate-850 dark:text-white">
                    {Math.round(riskData.obesity_risk * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Confidence</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(riskData.obesity_risk)}`} 
                    style={{ width: `${Math.round(riskData.obesity_risk * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Diabetes Risk */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Diabetes (Type 2)</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRiskLabel(riskData.diabetes_risk).class}`}>
                  {getRiskLabel(riskData.diabetes_risk).text}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-slate-850 dark:text-white">
                    {Math.round(riskData.diabetes_risk * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Confidence</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(riskData.diabetes_risk)}`} 
                    style={{ width: `${Math.round(riskData.diabetes_risk * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Hypertension Risk */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Hypertension</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRiskLabel(riskData.hypertension_risk).class}`}>
                  {getRiskLabel(riskData.hypertension_risk).text}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-slate-850 dark:text-white">
                    {Math.round(riskData.hypertension_risk * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Confidence</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(riskData.hypertension_risk)}`} 
                    style={{ width: `${Math.round(riskData.hypertension_risk * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Heart Disease Risk */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Heart Disease</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRiskLabel(riskData.heart_disease_risk).class}`}>
                  {getRiskLabel(riskData.heart_disease_risk).text}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-slate-850 dark:text-white">
                    {Math.round(riskData.heart_disease_risk * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Confidence</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(riskData.heart_disease_risk)}`} 
                    style={{ width: `${Math.round(riskData.heart_disease_risk * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Suggested Workouts & Activities (Workout Widget) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-450 dark:text-slate-505 tracking-wider flex items-center gap-1.5">
              <Activity size={16} className="text-amber-500" />
              AI Suggested Activities & Conditioning
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {getWorkoutRecommendations().map((workout, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-800 dark:text-white">{workout.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-extrabold uppercase tracking-wide">{workout.intensity}</span>
                  </div>
                  <p className="text-[10px] text-slate-450 font-bold">Duration: {workout.time}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold italic">{workout.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Risk Factors & AI Recommendations */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Risk Factors Detected */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-955/40 border border-slate-205/50 dark:border-white/5 shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-500" />
              Risk Factors Detected
            </h3>
            
            <div className="space-y-2.5">
              {riskData.risk_factors && riskData.risk_factors.length > 0 ? (
                riskData.risk_factors.map((factor, idx) => (
                  <div key={idx} className="flex gap-2 items-center text-xs font-bold text-slate-700 dark:text-slate-350">
                    <span className="text-amber-500">•</span>
                    <span>{factor}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No major clinical risk factors identified in your metrics.</p>
              )}
            </div>
          </div>

          {/* AI Clinical Recommendations */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-955/40 border border-slate-205/50 dark:border-white/5 shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-amber-500" />
              AI Preventive Actions
            </h3>
            
            <div className="space-y-3.5">
              {riskData.recommendations && riskData.recommendations.length > 0 ? (
                riskData.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-3 items-start text-xs font-bold text-slate-700 dark:text-slate-350">
                    <CheckCircle2 className="text-amber-500 shrink-0 mt-0.5" size={14} />
                    <span>{rec}</span>
                  </div>
                ))
              ) : (
                <div className="flex gap-3 items-start text-xs font-bold text-slate-700 dark:text-slate-350">
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                  <span>Maintain current healthy nutritional splits.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default HealthRiskPage;
