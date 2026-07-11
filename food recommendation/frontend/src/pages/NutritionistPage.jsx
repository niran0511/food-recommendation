import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Stethoscope, Clock, Heart, Trash2, Calendar, 
  Check, X, Loader, Search, Key, ChevronRight, Activity, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const defaultDocSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2310b981'/><stop offset='100%' stop-color='%23059669'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='white'/><path d='M20 80c0-15 15-22 30-22s30 7 30 22v5H20v-5z' fill='white'/><path d='M40 38h20v4H40v-4z' fill='%23059669'/></svg>";

const NutritionistPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('appointments'); 
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  
  // User directory
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRecords, setUserRecords] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  
  // Record Form state
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordFormData, setRecordFormData] = useState({
    weight: '76',
    caloriesConsumed: '2000',
    caloriesTarget: '2200',
    waterIntake: '2.5',
    healthScore: '80',
    notes: 'Patient has elevated blood pressure and fasting blood glucose. Advised to reduce sodium intake, avoid simple carbs, and walk for 30 minutes daily. Will monitor vitals weekly.',
    bloodPressureSystolic: '135',
    bloodPressureDiastolic: '85',
    bloodSugarLevel: '115',
    heartRate: '72',
    cholesterolLevel: '210',
    sleepHours: '8',
    exerciseMinutes: '30',
    mood: 'Good',
    medications: 'Metformin 500mg daily, Omega-3 supplements',
    dietaryCompliance: 'Excellent'
  });

  // Change Password state
  const [pwdFormData, setPwdFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const loadAppointments = async () => {
    try {
      const res = await api.get('/appointments/nutritionist');
      setAppointments(res.data.data || []);
    } catch (e) {
      toast.error("Failed to load appointments");
    }
  };

  const loadUsers = async () => {
    try {
      // Nutritionist accesses standard registry
      const res = await api.get('/nutritionist/users', { params: { limit: 100, search: userSearch || undefined } });
      setUsers(res.data.data.users || []);
    } catch (e) {
      toast.error("Failed to load patients list");
    }
  };

  const loadUserRecords = async (userId) => {
    try {
      // Nutritionist logs health record histories
      const res = await api.get(`/health/records`, { params: { userId } }); // fallback if query param is set
      setUserRecords(res.data.data.records || []);
    } catch (e) {
      toast.error("Failed to load user health updates");
    }
  };

  const handleUpdateStatus = async (apptId, status) => {
    try {
      await api.put(`/appointments/admin/${apptId}/status`, { status });
      toast.success(`Booking status successfully marked as ${status}!`);
      loadAppointments();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleAddRecordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      await api.post(`/nutritionist/records/${selectedUser._id}`, recordFormData);
      toast.success("Health record logged successfully!");
      setRecordModalOpen(false);
      setRecordFormData({
        weight: '76',
        caloriesConsumed: '2000',
        caloriesTarget: '2200',
        waterIntake: '2.5',
        healthScore: '80',
        notes: 'Patient has elevated blood pressure and fasting blood glucose. Advised to reduce sodium intake, avoid simple carbs, and walk for 30 minutes daily. Will monitor vitals weekly.',
        bloodPressureSystolic: '135',
        bloodPressureDiastolic: '85',
        bloodSugarLevel: '115',
        heartRate: '72',
        cholesterolLevel: '210',
        sleepHours: '8',
        exerciseMinutes: '30',
        mood: 'Good',
        medications: 'Metformin 500mg daily, Omega-3 supplements',
        dietaryCompliance: 'Excellent'
      });
      // reload health records for selected user
      loadUserRecords(selectedUser._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to log health update");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdFormData.newPassword !== pwdFormData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword: pwdFormData.currentPassword,
        newPassword: pwdFormData.newPassword
      });
      toast.success("Password changed successfully!");
      setPwdFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    }
  };

  useEffect(() => {
    if (user && user.role !== 'nutritionist') {
      navigate('/dashboard');
      return;
    }
    
    const init = async () => {
      setLoading(true);
      if (activeTab === 'appointments') {
        await loadAppointments();
      } else if (activeTab === 'users') {
        await loadUsers();
      }
      setLoading(false);
    };
    init();
  }, [activeTab, userSearch]);

  const handleUserClick = async (u) => {
    setSelectedUser(u);
    await loadUserRecords(u._id);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading && appointments.length === 0 && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-slate-100 flex flex-row overflow-hidden font-sans">
      
      {/* 1. SIDEBAR */}
      <aside className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
            N
          </div>
          <div>
            <h1 className="font-extrabold text-sm uppercase tracking-wider text-emerald-400">NutriAI Portal</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nutritionist Console</span>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          <SidebarLink active={activeTab === 'appointments'} label="Appointments" icon={<Calendar size={18} />} onClick={() => setActiveTab('appointments')} />
          <SidebarLink active={activeTab === 'users'} label="User Directory" icon={<Users size={18} />} onClick={() => setActiveTab('users')} />
          <SidebarLink active={activeTab === 'settings'} label="Change Password" icon={<Key size={18} />} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-sm shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'N'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEW */}
      <main className="flex-grow flex flex-col min-w-0 bg-[#090b0e] overflow-y-auto">
        <header className="p-6 border-b border-slate-900 bg-slate-950/20 backdrop-blur-md flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              Welcome back, {user?.name || 'Nutritionist'} 👋
            </h2>
            <p className="text-xs text-slate-500">Manage consult bookings and update patient logs.</p>
          </div>
        </header>

        <div className="p-8 flex-grow">
          
          {/* TAB 1: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <h3 className="font-bold text-sm text-slate-200">Patient Consultation Bookings</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-850 text-slate-400 border-b border-slate-800">
                        <th className="p-4 uppercase tracking-wider font-bold">Patient</th>
                        <th className="p-4 uppercase tracking-wider font-bold">Date & Time</th>
                        <th className="p-4 uppercase tracking-wider font-bold">Clinical Focus</th>
                        <th className="p-4 uppercase tracking-wider font-bold">Status</th>
                        <th className="p-4 uppercase tracking-wider font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-slate-500 font-bold">No consultation bookings assigned to you yet.</td>
                        </tr>
                      ) : (
                        appointments.map(ap => (
                          <tr key={ap._id} className="border-b border-slate-800 hover:bg-slate-850/50">
                            <td className="p-4 font-bold text-slate-100">{ap.userName}</td>
                            <td className="p-4 text-slate-350 font-semibold">{ap.date} at {ap.time}</td>
                            <td className="p-4 text-slate-450 italic truncate max-w-[200px]">{ap.reason}</td>
                            <td className="p-4">
                              {ap.status === 'accepted' && <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-extrabold uppercase border border-emerald-500/20">Accepted</span>}
                              {ap.status === 'rejected' && <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-450 text-[8px] font-extrabold uppercase border border-rose-500/20">Rejected</span>}
                              {ap.status === 'pending' && <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-extrabold uppercase border border-amber-500/20 animate-pulse">Pending</span>}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {ap.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatus(ap._id, 'accepted')}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-all"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatus(ap._id, 'rejected')}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-all"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Panel: Search & List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs outline-none text-slate-100"
                  />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 space-y-1 max-h-[60vh] overflow-y-auto">
                  {users.filter(u => u.role !== 'admin' && u.role !== 'nutritionist').map(u => (
                    <button
                      key={u._id}
                      onClick={() => handleUserClick(u)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border text-left ${
                        selectedUser?._id === u._id 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block font-bold text-xs truncate">{u.name}</span>
                        <span className="block text-[10px] text-slate-500 truncate">{u.email}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Panel: Patient Profile & Health History Logs */}
              <div className="lg:col-span-2">
                {selectedUser ? (
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold text-slate-100">{selectedUser.name}</h4>
                          <p className="text-xs text-slate-500">{selectedUser.email}</p>
                        </div>
                        <button
                          onClick={() => setRecordModalOpen(true)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Plus size={14} /> Log Health Record
                        </button>
                      </div>

                      {/* Physical Details Summary Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800/50 text-[11px] font-bold">
                        <div>
                          <span className="block text-slate-500 mb-0.5">AGE / GENDER</span>
                          <span className="text-slate-200">{selectedUser.profile?.age || 'N/A'} yrs / {selectedUser.profile?.gender || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 mb-0.5">HEIGHT / WEIGHT</span>
                          <span className="text-slate-200">{selectedUser.profile?.height || 'N/A'} cm / {selectedUser.profile?.weight || 'N/A'} kg</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 mb-0.5">BMI / TDEE</span>
                          <span className="text-slate-200">BMI: {selectedUser.profile?.bmi || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 mb-0.5">HEALTH GOAL</span>
                          <span className="text-amber-500">{selectedUser.profile?.goal || 'General Health'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 bg-slate-950/20 border border-slate-800/40 rounded-xl">
                          <span className="block text-[10px] uppercase font-extrabold text-slate-500 mb-2">Diseases & Conditions</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedUser.profile?.diseases?.length > 0 ? (
                              selectedUser.profile.diseases.map(d => <span key={d} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">{d}</span>)
                            ) : <span className="text-slate-500 italic">None logged</span>}
                          </div>
                        </div>

                        <div className="p-4 bg-slate-950/20 border border-slate-800/40 rounded-xl">
                          <span className="block text-[10px] uppercase font-extrabold text-slate-500 mb-2">Allergies & Deficiencies</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedUser.profile?.allergies?.length > 0 ? (
                              selectedUser.profile.allergies.map(d => <span key={d} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">{d}</span>)
                            ) : <span className="text-slate-500 italic">None logged</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Health Records Logs History */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-slate-200">Health History Log</h4>
                      <div className="space-y-3">
                        {userRecords.length === 0 ? (
                          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center text-xs text-slate-500 font-bold">
                            No health updates logged for this user yet.
                          </div>
                        ) : (
                          userRecords.map(r => (
                            <div key={r._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 text-slate-300">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-100">{new Date(r.date).toLocaleDateString()} at {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold border border-emerald-500/20">Health Score: {r.healthScore}/100</span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-400">
                                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg">Weight: {r.weight || 'N/A'} kg</span>
                                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg">Water: {r.waterIntake || 'N/A'} L</span>
                                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg">Calories: {r.caloriesConsumed}/{r.caloriesTarget} kcal</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                                <div>
                                  <span className="text-slate-500 block uppercase text-[8px] font-bold">Clinical Vitals</span>
                                  <p className="text-slate-350 mt-0.5 font-semibold">
                                    BP: {r.bloodPressureSystolic && r.bloodPressureDiastolic ? `${r.bloodPressureSystolic}/${r.bloodPressureDiastolic} mmHg` : 'N/A'}<br />
                                    Sugar: {r.bloodSugarLevel ? `${r.bloodSugarLevel} mg/dL` : 'N/A'}<br />
                                    HR: {r.heartRate ? `${r.heartRate} bpm` : 'N/A'}<br />
                                    Cholesterol: {r.cholesterolLevel ? `${r.cholesterolLevel} mg/dL` : 'N/A'}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-slate-500 block uppercase text-[8px] font-bold">Lifestyle</span>
                                  <p className="text-slate-350 mt-0.5 font-semibold">
                                    Sleep: {r.sleepHours ? `${r.sleepHours} hrs` : 'N/A'}<br />
                                    Exercise: {r.exerciseMinutes ? `${r.exerciseMinutes} mins` : 'N/A'}<br />
                                    Mood: {r.mood || 'N/A'}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-slate-500 block uppercase text-[8px] font-bold">Adherence</span>
                                  <p className="text-slate-350 mt-0.5 font-semibold">
                                    Diet Adherence: {r.dietaryCompliance || 'N/A'}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-slate-500 block uppercase text-[8px] font-bold">Medications</span>
                                  <p className="text-slate-355 mt-0.5 font-semibold truncate hover:text-clip hover:overflow-visible hover:whitespace-normal" title={r.medications}>
                                    {r.medications || 'None logged'}
                                  </p>
                                </div>
                              </div>

                              <p className="text-xs text-slate-350 leading-relaxed font-semibold italic mt-1">Clinical Notes: {r.notes || "No notes logged."}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 font-bold min-h-[300px] flex items-center justify-center flex-col">
                    <Users size={40} className="text-slate-700 mb-2" />
                    <p className="text-xs">Select a patient from the user directory to view profile logs.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: PASSWORD CONFIG */}
          {activeTab === 'settings' && (
            <div className="max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 text-xs text-slate-300">
              <h3 className="font-bold text-sm text-slate-200">Change Account Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Current Password</label>
                  <input type="password" value={pwdFormData.currentPassword} onChange={e => setPwdFormData(prev => ({ ...prev, currentPassword: e.target.value }))} required placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">New Password</label>
                  <input type="password" value={pwdFormData.newPassword} onChange={e => setPwdFormData(prev => ({ ...prev, newPassword: e.target.value }))} required placeholder="Minimum 6 characters"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Confirm New Password</label>
                  <input type="password" value={pwdFormData.confirmPassword} onChange={e => setPwdFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} required placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-colors active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key size={14} /> Update Password
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Log Health Record Modal */}
      {recordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-slate-800 dark:text-slate-100">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center text-slate-100">
              <h2 className="text-md font-bold">Log Clinical Health Record Update for {selectedUser.name}</h2>
              <button onClick={() => setRecordModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddRecordSubmit} className="p-6 space-y-5 text-xs text-slate-350 overflow-y-auto">
              {/* Section 1: Physical & Nutrition Metrics */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Physical & Nutrition Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Weight (kg)</label>
                    <input type="number" step="0.1" value={recordFormData.weight} onChange={e => setRecordFormData(prev => ({ ...prev, weight: e.target.value }))} required placeholder="e.g. 72.5"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Health Score</label>
                    <input type="number" min="1" max="100" value={recordFormData.healthScore} onChange={e => setRecordFormData(prev => ({ ...prev, healthScore: e.target.value }))} required placeholder="1-100"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Cal. Consumed</label>
                    <input type="number" value={recordFormData.caloriesConsumed} onChange={e => setRecordFormData(prev => ({ ...prev, caloriesConsumed: e.target.value }))} required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Cal. Target</label>
                    <input type="number" value={recordFormData.caloriesTarget} onChange={e => setRecordFormData(prev => ({ ...prev, caloriesTarget: e.target.value }))} required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Water Intake (L)</label>
                    <input type="number" step="0.1" value={recordFormData.waterIntake} onChange={e => setRecordFormData(prev => ({ ...prev, waterIntake: e.target.value }))} required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>
                </div>
              </div>

              {/* Section 2: Clinical Vitals */}
              <div className="space-y-3 pt-3 border-t border-slate-800/50">
                <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Clinical Vitals (Optional)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">BP Systolic</label>
                    <input type="number" value={recordFormData.bloodPressureSystolic} onChange={e => setRecordFormData(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))} placeholder="mmHg"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">BP Diastolic</label>
                    <input type="number" value={recordFormData.bloodPressureDiastolic} onChange={e => setRecordFormData(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))} placeholder="mmHg"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Blood Sugar</label>
                    <input type="number" value={recordFormData.bloodSugarLevel} onChange={e => setRecordFormData(prev => ({ ...prev, bloodSugarLevel: e.target.value }))} placeholder="mg/dL"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Heart Rate</label>
                    <input type="number" value={recordFormData.heartRate} onChange={e => setRecordFormData(prev => ({ ...prev, heartRate: e.target.value }))} placeholder="bpm"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Cholesterol</label>
                    <input type="number" value={recordFormData.cholesterolLevel} onChange={e => setRecordFormData(prev => ({ ...prev, cholesterolLevel: e.target.value }))} placeholder="mg/dL"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>
                </div>
              </div>

              {/* Section 3: Lifestyle & Adherence */}
              <div className="space-y-3 pt-3 border-t border-slate-800/50">
                <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Lifestyle & Adherence</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Sleep Hours</label>
                    <input type="number" step="0.5" value={recordFormData.sleepHours} onChange={e => setRecordFormData(prev => ({ ...prev, sleepHours: e.target.value }))} placeholder="hrs"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Exercise (min)</label>
                    <input type="number" value={recordFormData.exerciseMinutes} onChange={e => setRecordFormData(prev => ({ ...prev, exerciseMinutes: e.target.value }))} placeholder="mins"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Diet Adherence</label>
                    <select value={recordFormData.dietaryCompliance} onChange={e => setRecordFormData(prev => ({ ...prev, dietaryCompliance: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none">
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Needs Improvement">Needs Improvement</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Mood State</label>
                    <select value={recordFormData.mood} onChange={e => setRecordFormData(prev => ({ ...prev, mood: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none">
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Diagnostics, Meds & Notes */}
              <div className="space-y-3 pt-3 border-t border-slate-800/50">
                <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Diagnostics & Advice</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Medications / Prescriptions</label>
                    <input type="text" value={recordFormData.medications} onChange={e => setRecordFormData(prev => ({ ...prev, medications: e.target.value }))} placeholder="e.g. Metformin 500mg daily, Omega-3 supplements"
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none" />
                  </div>

                  <div>
                    <label className="block text-slate-450 mb-1.5 uppercase font-bold text-[9px]">Clinical Progress Notes</label>
                    <textarea rows="3" value={recordFormData.notes} onChange={e => setRecordFormData(prev => ({ ...prev, notes: e.target.value }))} required placeholder="Enter diagnostic advice, custom recipe suggestions or general clinical remarks..."
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none resize-none" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setRecordModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-850">Cancel</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-components
const SidebarLink = ({ active, label, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
      active 
        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' 
        : 'bg-transparent border-transparent text-slate-450 hover:bg-slate-850 hover:text-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default NutritionistPage;
