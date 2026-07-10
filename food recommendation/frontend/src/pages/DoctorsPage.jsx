import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Heart, Stethoscope, Phone, Clock, MapPin, Calendar, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const defaultDocSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2310b981'/><stop offset='100%' stop-color='%23059669'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='white'/><path d='M20 80c0-15 15-22 30-22s30 7 30 22v5H20v-5z' fill='white'/><path d='M40 38h20v4H40v-4z' fill='%23059669'/></svg>";

const doctorsDatabase = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    specialty: "Endocrinologist (Diabetes Care)",
    experience: "14 yrs experience",
    location: "Metabolic Health Clinic, Suite 402",
    phone: "+1 (555) 321-7890",
    rating: 4.9,
    availability: "Mon, Wed, Fri (9:00 AM - 4:00 PM)",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&fit=crop"
  },
  {
    id: 2,
    name: "Dr. Marcus Vance",
    specialty: "Cardiologist (Heart Health)",
    experience: "18 yrs experience",
    location: "Cardiovascular Wellness Center, Block B",
    phone: "+1 (555) 789-0123",
    rating: 4.8,
    availability: "Tue, Thu (10:00 AM - 5:00 PM)",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&fit=crop"
  },
  {
    id: 3,
    name: "Dr. Priya Patel",
    specialty: "Clinical Dietician & Nutritionist",
    experience: "9 yrs experience",
    location: "NutriLife Preventive Wellness, Suite 105",
    phone: "+1 (555) 456-7890",
    rating: 4.7,
    availability: "Mon, Tue, Thu, Fri (8:00 AM - 3:00 PM)",
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300&fit=crop"
  },
  {
    id: 4,
    name: "Dr. Robert Chen",
    specialty: "Bariatric Specialist (Obesity Management)",
    experience: "15 yrs experience",
    location: "Weight Science Institute, Suite 210",
    phone: "+1 (555) 901-2345",
    rating: 4.9,
    availability: "Wed, Thu (1:00 PM - 6:00 PM)",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&fit=crop"
  }
];

const DoctorsPage = () => {
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [searchSpecialist, setSearchSpecialist] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        const apptRes = await api.get('/appointments');
        setBookedAppointments(apptRes.data.data || []);

        const nutRes = await api.get('/users/nutritionists');
        const dbNuts = nutRes.data.data.nutritionists || [];

        const mappedNuts = dbNuts.map((nut) => ({
          id: nut._id,
          name: nut.name.toLowerCase().startsWith('dr.') ? nut.name : `Dr. ${nut.name}`,
          specialty: nut.nutritionistProfile?.specialty || "Clinical Nutritionist",
          experience: nut.nutritionistProfile?.experience || "5 yrs experience",
          location: nut.nutritionistProfile?.location || "Wellness Center, Suite 101",
          phone: nut.nutritionistProfile?.phone || "+1 (555) 000-0000",
          availability: nut.nutritionistProfile?.availability || "Mon - Fri",
          rating: nut.nutritionistProfile?.rating || 5.0,
          image: nut.avatar || "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300&fit=crop"
        }));

        const mergedList = [...mappedNuts, ...doctorsDatabase];
        const uniqueList = [];
        const seen = new Set();
        for (const doc of mergedList) {
          const lowerName = doc.name.toLowerCase();
          if (!seen.has(lowerName)) {
            seen.add(lowerName);
            uniqueList.push(doc);
          }
        }

        setDoctorsList(uniqueList);
      } catch (err) {
        console.error("Failed to load page data", err);
        setDoctorsList(doctorsDatabase);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const filteredDoctors = doctorsList.filter(doc => {
    const term = searchSpecialist.toLowerCase();
    return doc.name.toLowerCase().includes(term) || 
           doc.specialty.toLowerCase().includes(term) || 
           doc.location.toLowerCase().includes(term);
  });

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      toast.error("Please fill in appointment date and time");
      return;
    }
    
    try {
      const res = await api.post('/appointments', {
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: bookingDate,
        time: bookingTime,
        reason: bookingReason || "General consultation setup"
      });
      
      setBookedAppointments(prev => [res.data.data, ...prev]);
      toast.success(`Successfully booked appointment with ${selectedDoctor.name}!`);
      setIsBookingOpen(false);
      
      // Clear states
      setBookingDate('');
      setBookingTime('');
      setBookingReason('');
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule appointment");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Clinical Consultation Directory
        </h1>
        <p className="text-slate-500 dark:text-slate-450 text-sm mt-1">
          Connect with recommended nutritionists, cardiologists, and endocrinologists matching your vitals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Directory Listings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Search bar */}
          <div className="relative group">
            <input 
              type="text"
              placeholder="Search specialists by name, location, or focus area..."
              value={searchSpecialist}
              onChange={(e) => setSearchSpecialist(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-semibold"
            />
            <Search className="absolute left-4 top-4.5 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredDoctors.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white dark:bg-slate-955/30 border border-slate-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex gap-4">
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    onError={(e) => { e.target.src = defaultDocSvg; }}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 dark:border-white/5 shadow-inner shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-800 dark:text-white truncate">{doc.name}</h3>
                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-0.5">{doc.specialty}</p>
                    <span className="inline-block text-[10px] text-slate-400 font-bold mt-1">{doc.experience}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-bold text-slate-505 dark:text-slate-400">
                  <div className="flex gap-2 items-center">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{doc.location}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{doc.availability}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{doc.phone}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setIsBookingOpen(true);
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Calendar size={14} /> Book Consultation
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Right Side: Active Consultations */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="text-amber-500" size={20} />
            My Consultations
          </h2>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-955/40 border border-slate-205/50 dark:border-white/5 shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Scheduled Consultations</h3>
            
            {bookedAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-450 space-y-2">
                <span className="text-3xl block">📅</span>
                <p className="text-xs font-bold leading-relaxed">No pending appointments scheduled. Click book to consult an expert nutritionist.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 scrollbar-none">
                {bookedAppointments.map((ap) => (
                  <div key={ap._id || ap.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 space-y-2 relative overflow-hidden">
                    <div className="absolute top-3 right-3">
                      {ap.status === 'accepted' && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-extrabold uppercase">Accepted</span>}
                      {ap.status === 'rejected' && <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[8px] font-extrabold uppercase">Rejected</span>}
                      {ap.status === 'pending' && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-extrabold uppercase animate-pulse">Pending</span>}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{ap.doctorName}</h4>
                      <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wide">{ap.specialty}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold space-y-0.5">
                      <p>Date: {ap.date}</p>
                      <p>Time: {ap.time}</p>
                      <p className="italic text-[9px] mt-1 text-slate-450 truncate">Reason: {ap.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Booking Form Dialog Modal */}
      <AnimatePresence>
        {isBookingOpen && selectedDoctor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingOpen(false)}
              className="absolute inset-0 bg-slate-955/60 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-white/5 z-10 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
                <h3 className="font-extrabold text-slate-800 dark:text-white">Schedule Consultation</h3>
                <button 
                  onClick={() => setIsBookingOpen(false)}
                  className="text-slate-455 hover:text-slate-700 dark:hover:text-white text-xs font-black"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-3 items-center">
                <img 
                  src={selectedDoctor.image} 
                  alt={selectedDoctor.name} 
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">{selectedDoctor.name}</h4>
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-wide">{selectedDoctor.specialty}</p>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-455 dark:text-slate-500">Appointment Date</label>
                  <input 
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-455 dark:text-slate-500">Preferred Time Slot</label>
                  <input 
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200/50 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-455 dark:text-slate-500">Reason for Consultation</label>
                  <textarea 
                    placeholder="Enter details (e.g. insulin tracking support, low heart endurance advice...)"
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200/50 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 h-20 font-bold resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="flex-grow py-3 border border-slate-200 dark:border-white/5 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 font-extrabold text-xs rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-grow py-3 bg-amber-500 hover:bg-amber-600 text-slate-955 font-black text-xs rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DoctorsPage;
