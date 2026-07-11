import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Activity, Heart, Award, ArrowLeft, Loader2, 
  CheckCircle2, ChevronRight, Eye, Download, Printer, Search 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const HealthRiskPage = () => {
  const { user } = useAuth();
  const [riskData, setRiskData] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHealthData = async () => {
      try {
        setLoading(true);
        const [riskRes, recordsRes] = await Promise.all([
          api.post('/health/risk-assessment'),
          api.get('/health/records')
        ]);
        setRiskData(riskRes.data?.data?.riskAssessment || null);
        const fetchedRecords = recordsRes.data?.data?.records || [];
        setRecords(fetchedRecords);
        if (fetchedRecords.length > 0) {
          setSelectedRecord(fetchedRecords[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to retrieve your health risk profile. Ensure your profile metrics are filled.");
        toast.error("Error loading clinical reports");
      } finally {
        setLoading(false);
      }
    };

    loadHealthData();
  }, []);

  const getWorkoutRecommendations = () => {
    if (!riskData) return [];
    const workouts = [];
    if ((riskData.obesity_risk || 0) > 0.4) {
      workouts.push({
        title: "HIIT Weight Shred",
        time: "35 mins",
        intensity: "High",
        benefit: "Accelerates caloric deficit and lipid metabolism."
      });
    }
    if ((riskData.diabetes_risk || 0) > 0.4) {
      workouts.push({
        title: "Resistance Strength Splits",
        time: "45 mins",
        intensity: "Moderate",
        benefit: "Enhances insulin sensitivity and skeletal muscle glucose clearance."
      });
    }
    if ((riskData.hypertension_risk || 0) > 0.4 || (riskData.heart_disease_risk || 0) > 0.4) {
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

  const getSugarStatus = (sugar) => {
    if (!sugar) return { text: 'N/A', class: 'text-slate-400' };
    if (sugar >= 126) return { text: `${sugar} mg/dL (High)`, class: 'text-rose-500 font-extrabold' };
    if (sugar >= 100) return { text: `${sugar} mg/dL (Elevated)`, class: 'text-amber-500 font-extrabold' };
    return { text: `${sugar} mg/dL (Normal)`, class: 'text-emerald-500 font-extrabold' };
  };

  const getBPStatus = (sys, dia) => {
    if (!sys || !dia) return { text: 'N/A', class: 'text-slate-400' };
    if (sys >= 140 || dia >= 90) return { text: `${sys}/${dia} mmHg (High)`, class: 'text-rose-500 font-extrabold' };
    if (sys >= 120 || dia >= 80) return { text: `${sys}/${dia} mmHg (Elevated)`, class: 'text-amber-500 font-extrabold' };
    return { text: `${sys}/${dia} mmHg (Normal)`, class: 'text-emerald-500 font-extrabold' };
  };

  const getCholesterolStatus = (chol) => {
    if (!chol) return { text: 'N/A', class: 'text-slate-400' };
    if (chol >= 240) return { text: `${chol} mg/dL (High)`, class: 'text-rose-500 font-extrabold' };
    if (chol >= 200) return { text: `${chol} mg/dL (Borderline)`, class: 'text-amber-500 font-extrabold' };
    return { text: `${chol} mg/dL (Optimal)`, class: 'text-emerald-500 font-extrabold' };
  };

  const getHeartRateStatus = (hr) => {
    if (!hr) return { text: 'N/A', class: 'text-slate-400' };
    if (hr > 100 || hr < 60) return { text: `${hr} bpm (Abnormal)`, class: 'text-rose-500 font-extrabold' };
    return { text: `${hr} bpm (Normal)`, class: 'text-emerald-500 font-extrabold' };
  };

  const handleDownloadReport = (record) => {
    if (!record) return;
    const content = `
CLINICAL HEALTH SUMMARY REPORT
------------------------------
NutriAI Medical Center
Date: ${new Date(record.date).toLocaleString()}
Patient: Niranjan S
Age / Gender: 21 yrs / Male
Height / Weight: 175 cm / ${record.weight || '76'} kg
BMI Status: 24.8 (Normal)

CLINICAL VITALS:
- Fasting Glucose: ${record.bloodSugarLevel || 'N/A'} mg/dL
- Blood Pressure: ${record.bloodPressureSystolic || 'N/A'}/${record.bloodPressureDiastolic || 'N/A'} mmHg
- Total Cholesterol: ${record.cholesterolLevel || 'N/A'} mg/dL
- Heart Rate: ${record.heartRate || 'N/A'} bpm

LIFESTYLE SUMMARY:
- Sleep Hours: ${record.sleepHours || 'N/A'} hrs
- Exercise Minutes: ${record.exerciseMinutes || 'N/A'} mins
- Diet Adherence: ${record.dietaryCompliance || 'N/A'}
- Mood State: ${record.mood || 'N/A'}

PRESCRIPTIONS & ADVICE:
- Medications: ${record.medications || 'None'}
- Diagnostics Notes: ${record.notes || 'None'}
`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Clinical_Report_${new Date(record.date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Clinical Report downloaded successfully!");
  };

  const handlePrintRecord = (record) => {
    setSelectedRecord(record);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const filteredRecords = records.filter(r => {
    const term = searchTerm.toLowerCase();
    const dateStr = new Date(r.date).toLocaleDateString().toLowerCase();
    const noteType = "History and Physical";
    const author = "Dr. Arun Kumar";
    return dateStr.includes(term) || noteType.toLowerCase().includes(term) || author.toLowerCase().includes(term);
  });

  const getRiskLabel = (val) => {
    const num = val || 0;
    if (num >= 0.7) return { text: 'High Risk', class: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    if (num >= 0.4) return { text: 'Medium Risk', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    return { text: 'Low Risk', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
  };

  const getRiskBarColor = (val) => {
    const num = val || 0;
    if (num >= 0.7) return 'bg-rose-500';
    if (num >= 0.4) return 'bg-amber-500';
    return 'bg-emerald-500';
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

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl space-y-8 print:p-0">
      
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-report-layout, .print-report-layout * {
            visibility: visible !important;
          }
          .print-report-layout {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 30px !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
      
      {/* Back button */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors print:hidden">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Medical Records
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Browse clinical evaluations, nutritionist diagnostic logs, and pathological risk predictions.
          </p>
        </div>
        <div className="text-right text-xs font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 px-4 py-2.5 rounded-2xl shadow-sm">
          ⏰ {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} today, {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Main Split Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Section (Table + Risk Cards) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Medical Records Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-xl space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Clinician Logs Registry</h3>
              
              {/* Search bar */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Date</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Note Type</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">Last Updated</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-350">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-450 dark:text-slate-500 italic">No medical records registered.</td>
                    </tr>
                  ) : (
                    filteredRecords.map(r => (
                      <tr 
                        key={r._id} 
                        onClick={() => setSelectedRecord(r)}
                        className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${selectedRecord?._id === r._id ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''}`}
                      >
                        <td className="p-3 text-slate-500">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="p-3 text-slate-900 dark:text-white font-extrabold">Health Update</td>
                        <td className="p-3 text-slate-500">History and Physical</td>
                        <td className="p-3">Dr. Arun Kumar</td>
                        <td className="p-3 text-slate-500">{new Date(r.updatedAt || r.date).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-2.5 print:hidden" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setSelectedRecord(r)}
                            className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 transition-all cursor-pointer"
                            title="View Report"
                          >
                            <Eye size={13} />
                          </button>
                          <button 
                            onClick={() => handleDownloadReport(r)}
                            className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all cursor-pointer"
                            title="Download TXT Report"
                          >
                            <Download size={13} />
                          </button>
                          <button 
                            onClick={() => handlePrintRecord(r)}
                            className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition-all cursor-pointer"
                            title="Print Report"
                          >
                            <Printer size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Predicted Pathological Risks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-xl space-y-6 print:hidden">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="text-amber-500" size={18} />
              Predicted Pathological Risks
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Obesity Risk */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Obesity Index</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRiskLabel(riskData.obesity_risk).class}`}>
                    {getRiskLabel(riskData.obesity_risk).text}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {Math.round((riskData.obesity_risk || 0) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Confidence</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(riskData.obesity_risk)}`} 
                      style={{ width: `${Math.round((riskData.obesity_risk || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Diabetes Risk */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-955/40 border border-slate-200/50 dark:border-slate-850 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Diabetes (Type 2)</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRiskLabel(riskData.diabetes_risk).class}`}>
                    {getRiskLabel(riskData.diabetes_risk).text}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {Math.round((riskData.diabetes_risk || 0) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Confidence</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(riskData.diabetes_risk)}`} 
                      style={{ width: `${Math.round((riskData.diabetes_risk || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hypertension Risk */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-955/40 border border-slate-200/50 dark:border-slate-850 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Hypertension</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRiskLabel(riskData.hypertension_risk).class}`}>
                    {getRiskLabel(riskData.hypertension_risk).text}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {Math.round((riskData.hypertension_risk || 0) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Confidence</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(riskData.hypertension_risk)}`} 
                      style={{ width: `${Math.round((riskData.hypertension_risk || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Heart Disease Risk */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-955/40 border border-slate-200/50 dark:border-slate-850 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Heart Disease</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRiskLabel(riskData.heart_disease_risk).class}`}>
                    {getRiskLabel(riskData.heart_disease_risk).text}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {Math.round((riskData.heart_disease_risk || 0) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Confidence</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(riskData.heart_disease_risk)}`} 
                      style={{ width: `${Math.round((riskData.heart_disease_risk || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Suggested Workouts & Activities */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4 print:hidden">
            <h3 className="text-sm font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
              <Activity size={16} className="text-amber-500" />
              AI Suggested Activities & Conditioning
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {getWorkoutRecommendations().map((workout, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 space-y-2 font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-800 dark:text-white">{workout.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-extrabold uppercase tracking-wide">{workout.intensity}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold">Duration: {workout.time}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold italic">{workout.benefit}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Section: Detailed Clinical Report Card */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          {selectedRecord ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-xl space-y-5 text-slate-700 dark:text-slate-350 transition-colors duration-500">
              <div className="flex flex-col gap-1.5 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="text-rose-500 animate-pulse" size={18} />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Detailed Medical Report</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">Logged: {new Date(selectedRecord.date).toLocaleDateString()} at {new Date(selectedRecord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <div className="mt-2 flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/30 dark:border-white/5">
                  <span className="text-[9px] font-bold uppercase text-slate-400">Health Index Score</span>
                  <span className="text-xs font-black text-emerald-500">{selectedRecord.healthScore}/100</span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                {/* Vitals */}
                <div className="space-y-2 bg-slate-50 dark:bg-slate-955/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                  <span className="text-slate-400 uppercase text-[9px] font-bold block">Clinical Vitals</span>
                  <div className="space-y-1.5">
                    <p className="flex justify-between"><span>Weight:</span> <strong className="text-slate-900 dark:text-slate-100">{selectedRecord.weight || 'N/A'} kg</strong></p>
                    <p className="flex justify-between"><span>Blood Sugar:</span> <strong className={getSugarStatus(selectedRecord.bloodSugarLevel).class}>{getSugarStatus(selectedRecord.bloodSugarLevel).text}</strong></p>
                    <p className="flex justify-between"><span>BP:</span> <strong className={getBPStatus(selectedRecord.bloodPressureSystolic, selectedRecord.bloodPressureDiastolic).class}>{getBPStatus(selectedRecord.bloodPressureSystolic, selectedRecord.bloodPressureDiastolic).text}</strong></p>
                    <p className="flex justify-between"><span>Heart Rate:</span> <strong className={getHeartRateStatus(selectedRecord.heartRate).class}>{getHeartRateStatus(selectedRecord.heartRate).text}</strong></p>
                    <p className="flex justify-between"><span>Cholesterol:</span> <strong className={getCholesterolStatus(selectedRecord.cholesterolLevel).class}>{getCholesterolStatus(selectedRecord.cholesterolLevel).text}</strong></p>
                  </div>
                </div>

                {/* Lifestyle */}
                <div className="space-y-2 bg-slate-50 dark:bg-slate-955/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                  <span className="text-slate-400 uppercase text-[9px] font-bold block">Lifestyle Habits</span>
                  <div className="space-y-1.5">
                    <p className="flex justify-between"><span>Sleep Hours:</span> <strong className="text-slate-900 dark:text-slate-100">{selectedRecord.sleepHours ? `${selectedRecord.sleepHours} hrs` : 'N/A'}</strong></p>
                    <p className="flex justify-between"><span>Exercise:</span> <strong className="text-slate-900 dark:text-slate-100">{selectedRecord.exerciseMinutes ? `${selectedRecord.exerciseMinutes} mins` : 'N/A'}</strong></p>
                    <p className="flex justify-between"><span>Water Intake:</span> <strong className="text-slate-900 dark:text-slate-100">{selectedRecord.waterIntake ? `${selectedRecord.waterIntake} L` : 'N/A'}</strong></p>
                    <p className="flex justify-between"><span>Mood State:</span> <strong className="text-slate-900 dark:text-slate-100">{selectedRecord.mood || 'N/A'}</strong></p>
                    <p className="flex justify-between"><span>Diet Adherence:</span> <strong className="text-slate-900 dark:text-slate-100">{selectedRecord.dietaryCompliance || 'N/A'}</strong></p>
                  </div>
                </div>

                {/* Overrides */}
                <div className="space-y-2 bg-slate-50 dark:bg-slate-955/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                  <span className="text-slate-400 uppercase text-[9px] font-bold block">Overrides & Meds</span>
                  <div className="space-y-1.5">
                    <p className="flex justify-between"><span>Calorie Target:</span> <strong className="text-emerald-605 dark:text-emerald-450">{selectedRecord.caloriesTarget ? `${selectedRecord.caloriesTarget} kcal` : 'N/A'}</strong></p>
                    <p className="flex justify-between"><span>Calories Consumed:</span> <strong className="text-slate-900 dark:text-slate-100">{selectedRecord.caloriesConsumed ? `${selectedRecord.caloriesConsumed} kcal` : 'N/A'}</strong></p>
                    <p className="flex flex-col gap-0.5 pt-1">
                      <span className="text-slate-500">Medications:</span>
                      <strong className="text-slate-900 dark:text-slate-200 font-bold block bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/30 dark:border-white/5">{selectedRecord.medications || 'None'}</strong>
                    </p>
                  </div>
                </div>

                {/* Advice Notes */}
                <div className="space-y-2 bg-slate-50 dark:bg-slate-955/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                  <span className="text-slate-400 uppercase text-[9px] font-bold block">Clinician Diagnostics Notes</span>
                  <p className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200/40 dark:border-white/5 leading-relaxed font-bold italic text-slate-800 dark:text-slate-200 text-[11px] shadow-sm">
                    "{selectedRecord.notes || 'No notes logged.'}"
                  </p>
                </div>

                {/* Print button */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePrintRecord(selectedRecord)}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-lg transition-all active:scale-95 text-center block cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Printer size={14} /> Print Detailed Sheet
                  </button>
                  <button 
                    onClick={() => handleDownloadReport(selectedRecord)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                    title="Download Report text"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-8 shadow-xl text-center text-slate-450 dark:text-slate-500 font-bold min-h-[300px] flex flex-col items-center justify-center">
              <Activity className="text-slate-300 dark:text-slate-800 mb-3 animate-pulse" size={40} />
              <p className="text-xs">Select a record from the registry table to view detailed diagnostics advice report.</p>
            </div>
          )}
        </div>

      </div>

      {/* Formal Clinical Print Report Layout */}
      {selectedRecord && (
        <div className="print-report-layout hidden print:block bg-white text-slate-900 p-8 space-y-6 text-xs border border-slate-200 rounded-lg max-w-[21cm] min-h-[29.7cm] mx-auto font-sans leading-relaxed">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">NutriAI Medical Center</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clinical Nutrition & Diagnostics Division</p>
              <p className="text-[9px] text-slate-400 mt-0.5">121 Wellness Blvd, Suite 400 • Tel: +1 (555) 019-2834</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-[10px] font-black uppercase text-slate-800 rounded">
                Official Health Summary
              </span>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Report Ref: NA-{selectedRecord._id?.substring(18).toUpperCase()}</p>
              <p className="text-[9px] text-slate-400">Date: {new Date(selectedRecord.date).toLocaleString()}</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
            <div className="space-y-1">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Patient Information</p>
              <p className="text-sm font-black text-slate-900">Name: Niranjan S</p>
              <p className="text-slate-700">Email: {user?.email || '127003173@sastra.ac.in'}</p>
              <p className="text-slate-700">Age / Gender: 21 yrs / Male</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Clinical Assessment Metrics</p>
              <p className="text-slate-700">Height: 175 cm</p>
              <p className="text-slate-700">Weight: {selectedRecord.weight || '76'} kg</p>
              <p className="text-slate-700 font-bold">BMI Status: 24.8 (Normal)</p>
            </div>
          </div>

          {/* Vitals Summary Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider border-b border-slate-300 pb-1 text-slate-900">1. Clinical Vitals Summary</h3>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-500 border-b border-slate-200">
                  <th className="p-2.5 uppercase font-bold text-[9px]">Parameter</th>
                  <th className="p-2.5 uppercase font-bold text-[9px]">Logged Value</th>
                  <th className="p-2.5 uppercase font-bold text-[9px]">Reference Range</th>
                  <th className="p-2.5 uppercase font-bold text-[9px] text-right">Diagnostic Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-bold">Fasting Blood Glucose</td>
                  <td className="p-2.5">{selectedRecord.bloodSugarLevel ? `${selectedRecord.bloodSugarLevel} mg/dL` : 'N/A'}</td>
                  <td className="p-2.5">70 - 100 mg/dL</td>
                  <td className="p-2.5 text-right font-extrabold">{selectedRecord.bloodSugarLevel >= 126 ? 'High (Diabetic)' : (selectedRecord.bloodSugarLevel >= 100 ? 'Elevated (Pre-diabetic)' : 'Normal')}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Blood Pressure (Systolic/Diastolic)</td>
                  <td className="p-2.5">{selectedRecord.bloodPressureSystolic && selectedRecord.bloodPressureDiastolic ? `${selectedRecord.bloodPressureSystolic}/${selectedRecord.bloodPressureDiastolic} mmHg` : 'N/A'}</td>
                  <td className="p-2.5">&lt; 120 / 80 mmHg</td>
                  <td className="p-2.5 text-right font-extrabold">{(selectedRecord.bloodPressureSystolic >= 140 || selectedRecord.bloodPressureDiastolic >= 90) ? 'Stage 1 Hypertension' : ((selectedRecord.bloodPressureSystolic >= 120 || selectedRecord.bloodPressureDiastolic >= 80) ? 'Elevated' : 'Normal')}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Total Cholesterol</td>
                  <td className="p-2.5">{selectedRecord.cholesterolLevel ? `${selectedRecord.cholesterolLevel} mg/dL` : 'N/A'}</td>
                  <td className="p-2.5">&lt; 200 mg/dL</td>
                  <td className="p-2.5 text-right font-extrabold">{selectedRecord.cholesterolLevel >= 240 ? 'High' : (selectedRecord.cholesterolLevel >= 200 ? 'Borderline' : 'Desirable')}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Resting Heart Rate</td>
                  <td className="p-2.5">{selectedRecord.heartRate ? `${selectedRecord.heartRate} bpm` : 'N/A'}</td>
                  <td className="p-2.5">60 - 100 bpm</td>
                  <td className="p-2.5 text-right font-extrabold">{(selectedRecord.heartRate > 100 || selectedRecord.heartRate < 60) ? 'Abnormal' : 'Normal'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Lifestyle Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider border-b border-slate-300 pb-1 text-slate-900">2. Lifestyle & Target Overrides</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sleep Hours</p>
                <p className="text-sm font-extrabold text-slate-900">{selectedRecord.sleepHours ? `${selectedRecord.sleepHours} hrs/night` : 'N/A'}</p>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Daily Exercise</p>
                <p className="text-sm font-extrabold text-slate-900">{selectedRecord.exerciseMinutes ? `${selectedRecord.exerciseMinutes} mins` : 'N/A'}</p>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-bold">Diet Adherence</p>
                <p className="text-sm font-extrabold text-slate-900">{selectedRecord.dietaryCompliance || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Nutrition Targets */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="p-4 border border-slate-200 rounded-xl space-y-1.5 bg-slate-50/20">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Dietary Targets Overrides</span>
              <p className="text-slate-700">Daily Calorie Target: <strong className="text-slate-900">{selectedRecord.caloriesTarget ? `${selectedRecord.caloriesTarget} kcal` : 'N/A'}</strong></p>
              <p className="text-slate-700">Water Limit: <strong className="text-slate-900">{selectedRecord.waterIntake ? `${selectedRecord.waterIntake} L` : 'N/A'}</strong></p>
              <p className="text-slate-700">Current Calories Logged: <strong className="text-slate-900">{selectedRecord.caloriesConsumed ? `${selectedRecord.caloriesConsumed} kcal` : 'N/A'}</strong></p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl space-y-1.5 bg-slate-50/20">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Active Prescriptions & Medications</span>
              <p className="text-slate-900 leading-relaxed font-bold">{selectedRecord.medications || 'No active medications logged.'}</p>
            </div>
          </div>

          {/* Diagnosis Remarks */}
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Clinician Diagnostics remarks & advice</span>
            <p className="text-slate-800 leading-relaxed font-bold italic">
              "{selectedRecord.notes || 'No notes logged.'}"
            </p>
          </div>

          {/* Pathological Risk Classifiers */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider border-b border-slate-300 pb-1 text-slate-900">3. AI Predicted Pathological Risks</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/20">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Obesity Index</span>
                <span className="text-sm font-black text-slate-900">{riskData && Math.round((riskData.obesity_risk || 0) * 100)}%</span>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/20">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Diabetes Index</span>
                <span className="text-sm font-black text-slate-900">{riskData && Math.round((riskData.diabetes_risk || 0) * 100)}%</span>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/20">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Hypertension Index</span>
                <span className="text-sm font-black text-slate-900">{riskData && Math.round((riskData.hypertension_risk || 0) * 100)}%</span>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/20">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Heart Disease Index</span>
                <span className="text-sm font-black text-slate-900">{riskData && Math.round((riskData.heart_disease_risk || 0) * 100)}%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 text-center font-bold mt-2">Overall Patient Health Standing: {riskData && (riskData.overall_health_score || 100)}% Optimal Condition</p>
          </div>

          {/* Signature Block */}
          <div className="flex justify-between items-end pt-12">
            <div className="text-[9px] text-slate-400 font-bold">
              <p>Generated via NutriAI Clinic Diagnostics Suite</p>
              <p>Authorized Electronic Signature Match Valid</p>
            </div>
            <div className="text-right border-t border-slate-400 w-64 pt-2">
              <p className="text-[10px] font-black text-slate-900">Dr. Arun Kumar</p>
              <p className="text-[9px] text-slate-500">Certified Clinical Nutritionist (CCN)</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HealthRiskPage;
