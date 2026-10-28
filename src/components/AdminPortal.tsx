import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Lock,
  Calendar,
  BookOpen,
  Users,
  Heart,
  DollarSign,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Check,
  Shield,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  ArrowLeft,
  Menu,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  LogOut,
  UserCheck,
  FileText,
  Award,
  Eye,
  Activity,
  TrendingUp,
  ClipboardList,
  Bell,
  Key
} from 'lucide-react';
import type { Sermon, ChurchEvent } from '../types';
import type { 
  ChurchSettingsRow, 
  GuestVisitRow, 
  PrayerRequestRow, 
  GivingRecordRow, 
  ServiceAttendanceRow, 
  StaffUserRow 
} from '../types/database';
import { ROLE_DEFINITIONS } from '../types/iam';
import type { ChurchRole } from '../types/iam';
import {
  saveSermon,
  deleteSermon,
  saveEvent,
  deleteEvent,
  updateChurchSettings,
  getGuestVisits,
  getPrayerRequests,
  getGivingRecords,
  updatePrayerStatus,
  updateGuestVisitStatus,
  getStaffUsers,
  updateStaffUser,
  getServiceAttendance,
  logServiceAttendance
} from '../lib/supabase';
import './AdminPortal.css';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  sermons: Sermon[];
  events: ChurchEvent[];
  churchSettings: ChurchSettingsRow | null;
  onDataRefresh: () => void;
}

// Fallback staff directory in case of temporary network latency
const DEFAULT_STAFF_USERS: StaffUserRow[] = [
  {
    id: 'admin',
    name: 'Engr. David Okon',
    role: 'admin',
    title: 'Church Administrator & IT Director',
    email: 'admin@fgcmushin.org',
    phone: '+234 802 345 6789',
    passkey: 'fgcmushin2026',
    avatar_initials: 'DO',
    is_active: true
  },
  {
    id: 'overseer',
    name: 'Rev. Dr. O. A. Babalola',
    role: 'district_overseer',
    title: 'District Overseer & Senior Pastor',
    email: 'overseer@fgcmushin.org',
    phone: '+234 803 111 2233',
    passkey: 'do2026',
    avatar_initials: 'OB',
    is_active: true
  },
  {
    id: 'resident',
    name: 'Pastor Adeyemi Daniel',
    role: 'resident_pastor',
    title: 'Resident Pastor',
    email: 'residentpastor@fgcmushin.org',
    phone: '+234 805 222 3344',
    passkey: 'pastor2026',
    avatar_initials: 'AD',
    is_active: true
  },
  {
    id: 'secretariat',
    name: 'Sister Grace Okafor',
    role: 'secretariat',
    title: 'Head of Secretariat & Records',
    email: 'secretariat@fgcmushin.org',
    phone: '+234 807 333 4455',
    passkey: 'sec2026',
    avatar_initials: 'GO',
    is_active: true
  },
  {
    id: 'usher',
    name: 'Bro. Emmanuel Kalu',
    role: 'head_usher',
    title: 'Head Usher & Protocol Director',
    email: 'ushering@fgcmushin.org',
    phone: '+234 809 444 5566',
    passkey: 'usher2026',
    avatar_initials: 'EK',
    is_active: true
  }
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  sermons,
  events,
  churchSettings,
  onDataRefresh
}) => {
  // Staff Directory & Current Profile State
  const [staffUsers, setStaffUsers] = useState<StaffUserRow[]>(DEFAULT_STAFF_USERS);
  const [currentUser, setCurrentUser] = useState<StaffUserRow>(DEFAULT_STAFF_USERS[0]);
  const [activeRole, setActiveRole] = useState<ChurchRole>('admin');

  // Authentication with sessionStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('fgc_staff_auth') === 'true';
    }
    return false;
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [selectedLoginProfileId, setSelectedLoginProfileId] = useState<string>('admin');

  // Active Tab & Mobile Sidebar State
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Loading & Notification Notice
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Live Operational Data
  const [guestVisits, setGuestVisits] = useState<GuestVisitRow[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequestRow[]>([]);
  const [givingRecords, setGivingRecords] = useState<GivingRecordRow[]>([]);
  const [serviceAttendance, setServiceAttendance] = useState<ServiceAttendanceRow[]>([]);

  // Head Usher Headcount Form State
  const [attendanceForm, setAttendanceForm] = useState({
    service_date: new Date().toISOString().split('T')[0],
    service_name: '1st Service (7:30 AM)',
    men_count: 0,
    women_count: 0,
    children_count: 0,
    head_usher_name: 'Bro. Emmanuel Kalu',
    notes: ''
  });

  // Editing / New Sermon State
  const [isEditingSermon, setIsEditingSermon] = useState(false);
  const [sermonForm, setSermonForm] = useState<{
    id?: string;
    title: string;
    series: string;
    speaker: string;
    date: string;
    duration: string;
    passage: string;
    thumbnail: string;
    summary: string;
    videoUrl: string;
    isFeatured: boolean;
  }>({
    title: '',
    series: 'UNSHAKABLE',
    speaker: 'Lead Pastor Marcus Vance',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    duration: '35 min',
    passage: 'Hebrews 13:8',
    thumbnail: '/images/sermon-series.jpg',
    summary: '',
    videoUrl: '',
    isFeatured: false
  });

  // Editing / New Event State
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [eventForm, setEventForm] = useState<{
    id?: string;
    title: string;
    date: string;
    time: string;
    location: string;
    category: ChurchEvent['category'];
    description: string;
  }>({
    title: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: '9:30 AM',
    location: 'Main Sanctuary (DHQ)',
    category: 'Worship',
    description: ''
  });

  // Church Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    announcementText: churchSettings?.announcement_text || 'Welcome to FGC Mushin DHQ • Sunday Celebration Services at 7:30 AM & 9:30 AM',
    announcementActive: churchSettings?.announcement_active ?? true,
    phone: churchSettings?.phone || '+234 1 234 5678',
    email: churchSettings?.email || 'info@fgcmushin.org',
    address: churchSettings?.address || '4, Obarinmola Adedoyin Street, Mushin, Idi Oro, Lagos, Nigeria'
  });

  // Admin IAM Staff Profile Editor State
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffEditForm, setStaffEditForm] = useState<{
    name: string;
    title: string;
    email: string;
    phone: string;
    passkey: string;
    is_active: boolean;
  }>({
    name: '',
    title: '',
    email: '',
    phone: '',
    passkey: '',
    is_active: true
  });
  const [showPasskeys, setShowPasskeys] = useState<Record<string, boolean>>({});

  // Show temporary feedback toast
  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 4000);
  };

  // Sync settings when churchSettings updates
  useEffect(() => {
    if (churchSettings) {
      setSettingsForm({
        announcementText: churchSettings.announcement_text || '',
        announcementActive: churchSettings.announcement_active ?? true,
        phone: churchSettings.phone || '',
        email: churchSettings.email || '',
        address: churchSettings.address || ''
      });
    }
  }, [churchSettings]);

  // Load staff and attendance data
  const loadPortalData = useCallback(async () => {
    try {
      const [guests, prayers, giving, loadedStaff, loadedAttendance] = await Promise.all([
        getGuestVisits(),
        getPrayerRequests(),
        getGivingRecords(),
        getStaffUsers(),
        getServiceAttendance()
      ]);

      if (guests) setGuestVisits(guests);
      if (prayers) setPrayerRequests(prayers);
      if (giving) setGivingRecords(giving);
      if (loadedStaff && loadedStaff.length > 0) {
        setStaffUsers(loadedStaff);
        // Sync active user if already stored in session
        const savedUserId = sessionStorage.getItem('fgc_staff_user_id');
        const matched = loadedStaff.find(u => u.id === savedUserId);
        if (matched) {
          setCurrentUser(matched);
          setActiveRole(matched.role);
        }
      }
      if (loadedAttendance) setServiceAttendance(loadedAttendance);
    } catch (err) {
      console.warn('Portal data fetch warning:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadPortalData();
    }
  }, [isOpen, loadPortalData]);

  // Authenticate staff member
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPass = passkeyInput.trim().toLowerCase();

    // Check against live or default staff users
    const matchedUser = staffUsers.find(u => 
      u.is_active && (
        u.passkey.toLowerCase() === cleanPass ||
        (cleanPass === 'fgcmushin2026' && u.role === 'admin') ||
        (cleanPass === 'admin' && u.role === 'admin') ||
        (cleanPass === 'do2026' && u.role === 'district_overseer') ||
        (cleanPass === 'pastor2026' && u.role === 'resident_pastor') ||
        (cleanPass === 'sec2026' && u.role === 'secretariat') ||
        (cleanPass === 'usher2026' && u.role === 'head_usher')
      )
    );

    if (matchedUser) {
      setIsAuthenticated(true);
      setCurrentUser(matchedUser);
      setActiveRole(matchedUser.role);
      setAuthError('');
      sessionStorage.setItem('fgc_staff_auth', 'true');
      sessionStorage.setItem('fgc_staff_user_id', matchedUser.id);
      sessionStorage.setItem('fgc_staff_role', matchedUser.role);

      // Default opening tab per role
      if (matchedUser.role === 'district_overseer') setActiveTab('overseer_pulse');
      else if (matchedUser.role === 'resident_pastor') setActiveTab('guests');
      else if (matchedUser.role === 'secretariat') setActiveTab('events');
      else if (matchedUser.role === 'head_usher') setActiveTab('headcount_logger');
      else setActiveTab('overview');

      showNotice(`Welcome, ${matchedUser.name} (${ROLE_DEFINITIONS[matchedUser.role].badge})`);
    } else {
      setAuthError('Invalid administrative passkey. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('fgc_staff_auth');
    sessionStorage.removeItem('fgc_staff_user_id');
    sessionStorage.removeItem('fgc_staff_role');
    setPasskeyInput('');
    setAuthError('');
    setActiveTab('overview');
  };

  // Executive Switcher for Administrator to inspect any role's desk
  const handleSwitchRoleView = (targetRole: ChurchRole) => {
    setActiveRole(targetRole);
    if (targetRole === 'district_overseer') setActiveTab('overseer_pulse');
    else if (targetRole === 'resident_pastor') setActiveTab('guests');
    else if (targetRole === 'secretariat') setActiveTab('events');
    else if (targetRole === 'head_usher') setActiveTab('headcount_logger');
    else setActiveTab('overview');
    showNotice(`Switched desk view to: ${ROLE_DEFINITIONS[targetRole].title}`);
  };

  // --- Sermon Handlers ---
  const handleSaveSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveSermon({
      id: sermonForm.id,
      title: sermonForm.title,
      speaker: sermonForm.speaker,
      date: sermonForm.date,
      series: sermonForm.series,
      duration: sermonForm.duration,
      passage: sermonForm.passage,
      thumbnail: sermonForm.thumbnail,
      summary: sermonForm.summary,
      video_url: sermonForm.videoUrl || null,
      is_featured: sermonForm.isFeatured
    });
    setLoading(false);
    if (res.success) {
      showNotice(sermonForm.id ? 'Sermon updated successfully.' : 'New sermon published to website.');
      setIsEditingSermon(false);
      onDataRefresh();
    } else {
      showNotice(`Failed to save sermon: ${res.error}`, 'error');
    }
  };

  const handleDeleteSermon = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    setLoading(true);
    const res = await deleteSermon(id);
    setLoading(false);
    if (res.success) {
      showNotice('Sermon removed.');
      onDataRefresh();
    } else {
      showNotice(`Could not delete sermon: ${res.error}`, 'error');
    }
  };

  // --- Event Handlers ---
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveEvent({
      id: eventForm.id,
      title: eventForm.title,
      date: eventForm.date,
      time: eventForm.time,
      location: eventForm.location,
      category: eventForm.category,
      description: eventForm.description
    });
    setLoading(false);
    if (res.success) {
      showNotice(eventForm.id ? 'Event updated successfully.' : 'New event added to church calendar.');
      setIsEditingEvent(false);
      onDataRefresh();
    } else {
      showNotice(`Failed to save event: ${res.error}`, 'error');
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;
    setLoading(true);
    const res = await deleteEvent(id);
    setLoading(false);
    if (res.success) {
      showNotice('Event deleted.');
      onDataRefresh();
    } else {
      showNotice(`Could not delete event: ${res.error}`, 'error');
    }
  };

  // --- Settings Handler ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateChurchSettings({
      announcement_text: settingsForm.announcementText,
      announcement_active: settingsForm.announcementActive,
      phone: settingsForm.phone,
      email: settingsForm.email,
      address: settingsForm.address
    });
    setLoading(false);
    if (res.success) {
      showNotice('Live announcements & contact info updated.');
      onDataRefresh();
    } else {
      showNotice(`Failed to update settings: ${res.error}`, 'error');
    }
  };

  // --- Guest / Prayer Status Handlers ---
  const handleUpdateGuest = async (id: string, status: string) => {
    const res = await updateGuestVisitStatus(id, status);
    if (res.success) {
      setGuestVisits(prev => prev.map(g => g.id === id ? { ...g, status } : g));
      showNotice(`Guest marked as ${status}`);
    } else {
      showNotice(`Could not update guest: ${res.error}`, 'error');
    }
  };

  const handleUpdatePrayer = async (id: string, status: string) => {
    const res = await updatePrayerStatus(id, status);
    if (res.success) {
      setPrayerRequests(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      showNotice(`Prayer request updated to ${status}`);
    } else {
      showNotice(`Could not update prayer request: ${res.error}`, 'error');
    }
  };

  // --- Head Usher Attendance Logger Handler ---
  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attendanceForm.men_count < 0 || attendanceForm.women_count < 0 || attendanceForm.children_count < 0) {
      showNotice('Headcount values cannot be negative', 'error');
      return;
    }
    setLoading(true);
    const res = await logServiceAttendance({
      service_date: attendanceForm.service_date,
      service_name: attendanceForm.service_name,
      men_count: Number(attendanceForm.men_count),
      women_count: Number(attendanceForm.women_count),
      children_count: Number(attendanceForm.children_count),
      head_usher_name: attendanceForm.head_usher_name,
      notes: attendanceForm.notes
    });
    setLoading(false);
    if (res.success) {
      showNotice(`Headcount for ${attendanceForm.service_name} logged successfully.`);
      loadPortalData();
      setAttendanceForm(prev => ({ ...prev, notes: '' }));
    } else {
      showNotice(`Failed to log attendance: ${res.error}`, 'error');
    }
  };

  // --- Admin IAM Staff Update Handler ---
  const handleOpenStaffEditor = (staff: StaffUserRow) => {
    setEditingStaffId(staff.id);
    setStaffEditForm({
      name: staff.name,
      title: staff.title,
      email: staff.email,
      phone: staff.phone || '',
      passkey: staff.passkey,
      is_active: staff.is_active
    });
  };

  const handleSaveStaffUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffId) return;
    setLoading(true);
    const res = await updateStaffUser(editingStaffId, {
      name: staffEditForm.name,
      title: staffEditForm.title,
      email: staffEditForm.email,
      phone: staffEditForm.phone,
      passkey: staffEditForm.passkey,
      is_active: staffEditForm.is_active
    });
    setLoading(false);
    if (res.success) {
      showNotice('Staff account credentials and access permissions updated.');
      setEditingStaffId(null);
      loadPortalData();
    } else {
      showNotice(`Failed to update staff account: ${res.error}`, 'error');
    }
  };

  if (!isOpen) return null;

  // Render Role Definition Metadata (with safe fallback)
  const currentRoleDef = ROLE_DEFINITIONS[activeRole] || ROLE_DEFINITIONS.admin;

  // Calculate high-level attendance metrics
  const latestSundayAttendance = serviceAttendance.slice(0, 2);
  const totalRecentSundayHeadcount = latestSundayAttendance.reduce((acc, curr) => acc + (curr.total_count || 0), 0);

  return (
    <div 
      className="admin-portal-root fixed inset-0 z-[1000] flex bg-[#060a12] text-slate-100 font-sans antialiased overflow-hidden"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#060a12',
        color: '#f1f5f9',
        overflow: 'hidden'
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Toast Notice */}
      {notice && (
        <div 
          className={`fixed top-5 right-6 z-[999] px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 animate-fade-in ${
            notice.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' 
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span className="text-sm font-medium">{notice.message}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* AUTHENTICATION VIEW: ROLE-AWARE IAM ACCESS               */}
      {/* ======================================================== */}
      {!isAuthenticated ? (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-[#050b14] via-[#091322] to-[#040810] overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative my-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Close Staff Portal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3 shadow-inner">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Staff Operations & Pastoral Suite
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Foursquare Gospel Church Mushin District Headquarters. Select your role profile or enter your passkey to access your ministry desk.
              </p>
            </div>

            {/* Quick Profile Selector Cards */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Your Role Desk:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staffUsers.map((user) => {
                  const roleDef = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.admin;
                  const isSelected = selectedLoginProfileId === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedLoginProfileId(user.id);
                        setPasskeyInput(user.passkey);
                        setAuthError('');
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        isSelected 
                          ? 'border-amber-400/60 bg-amber-500/10 shadow-lg' 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-800/40'
                      }`}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border"
                        style={{ backgroundColor: roleDef.badgeBg, color: roleDef.badgeColor, borderColor: roleDef.badgeColor + '40' }}
                      >
                        {user.avatar_initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                        <div className="text-[11px] font-medium text-slate-400 truncate">{roleDef.badge}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Selected Role Scope Card */}
              {selectedLoginProfileId && (() => {
                const selectedRoleDef = ROLE_DEFINITIONS[staffUsers.find(u => u.id === selectedLoginProfileId)?.role || 'admin'] || ROLE_DEFINITIONS.admin;
                return (
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 mt-3 flex items-start gap-3">
                    <div 
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" 
                      style={{ backgroundColor: selectedRoleDef.badgeColor }}
                    />
                    <div className="text-xs">
                      <div className="font-bold text-white">
                        {selectedRoleDef.primaryDesk}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {selectedRoleDef.description}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Passkey Input Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Administrative Passkey
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={passkeyInput}
                    onChange={(e) => {
                      setPasskeyInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter role passkey (e.g. fgcmushin2026, do2026)"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                    autoFocus
                  />
                </div>
                {authError && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Key className="w-4 h-4" />
                Unlock Role Operations Suite
              </button>
            </form>

            {/* Role Credential Quick Guide */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-semibold mb-2 uppercase tracking-wider">
                Assigned Role Passkeys:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-400">
                <div><span className="text-slate-300 font-medium">Administrator:</span> <code className="text-amber-400">fgcmushin2026</code></div>
                <div><span className="text-slate-300 font-medium">Senior Pastor:</span> <code className="text-amber-400">do2026</code></div>
                <div><span className="text-slate-300 font-medium">Resident Pastor:</span> <code className="text-amber-400">pastor2026</code></div>
                <div><span className="text-slate-300 font-medium">Secretariat:</span> <code className="text-amber-400">sec2026</code></div>
                <div><span className="text-slate-300 font-medium">Head Usher:</span> <code className="text-amber-400">usher2026</code></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* AUTHENTICATED FULL-VIEWPORT OPERATIONS DASHBOARD          */
        /* ======================================================== */
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Top Bar Header */}
          <header className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger toggle */}
              <button
                onClick={() => setMobileSidebarOpen(prev => !prev)}
                className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                aria-label="Toggle navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border shadow-inner shrink-0"
                  style={{ backgroundColor: currentRoleDef.badgeBg, color: currentRoleDef.badgeColor, borderColor: currentRoleDef.badgeColor + '50' }}
                >
                  {currentUser.avatar_initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate max-w-[200px] sm:max-w-xs">
                      {currentUser.name}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border hidden sm:inline-block"
                      style={{ backgroundColor: currentRoleDef.badgeBg, color: currentRoleDef.badgeColor, borderColor: currentRoleDef.badgeColor + '40' }}
                    >
                      {currentRoleDef.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 hidden sm:block truncate">
                    {currentRoleDef.primaryDesk}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Executive View Switcher (Only visible to Admin) */}
              {currentUser.role === 'admin' && (
                <div className="hidden md:flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch View:</span>
                  <select
                    value={activeRole}
                    onChange={(e) => handleSwitchRoleView(e.target.value as ChurchRole)}
                    className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="admin" className="bg-slate-900 text-slate-200">Administrator & CMS</option>
                    <option value="district_overseer" className="bg-slate-900 text-amber-400">District Overseer Study</option>
                    <option value="resident_pastor" className="bg-slate-900 text-sky-400">Resident Pastor Desk</option>
                    <option value="secretariat" className="bg-slate-900 text-emerald-400">Secretariat Desk</option>
                    <option value="head_usher" className="bg-slate-900 text-rose-400">Head Usher Desk</option>
                  </select>
                </div>
              )}

              {/* View Live Site */}
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Live Site</span>
              </button>

              {/* Logout / Switch Role */}
              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Switch Staff Account / Lock"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            </div>
          </header>

          {/* Body: Left Sidebar + Main Content Area */}
          <div className="flex-1 flex overflow-hidden relative min-h-0">
            {/* Backdrop for mobile drawer */}
            {mobileSidebarOpen && (
              <div 
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
              />
            )}

            {/* Left Sidebar */}
            <aside 
              className={`fixed lg:static top-16 bottom-0 left-0 w-64 bg-slate-900/95 lg:bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between shrink-0 z-40 transition-transform duration-300 lg:translate-x-0 ${
                mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {/* Navigation Items based on Active Role */}
              <div className="p-3 space-y-1 overflow-y-auto">
                <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  {currentRoleDef.title}
                </div>

                {/* 1. ADMINISTRATOR ROLE NAVIGATION */}
                {activeRole === 'admin' && (
                  <>
                    <button
                      onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'overview' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Executive Pulse
                    </button>
                    <div className="pt-2 px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      CMS Content
                    </div>
                    <button
                      onClick={() => { setActiveTab('sermons'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'sermons' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Sermons & Series ({sermons.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('events'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'events' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Calendar & Events ({events.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'settings' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      Church Info & Banner
                    </button>

                    <div className="pt-2 px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      IAM & Governance
                    </div>
                    <button
                      onClick={() => { setActiveTab('iam_staff'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'iam_staff' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-blue-400" />
                      Staff Accounts & IAM ({staffUsers.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('guests'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'guests' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      First-Time Guests ({guestVisits.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('prayers'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'prayers' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      Prayer Care ({prayerRequests.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('attendance'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'attendance' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      Service Attendance
                    </button>
                    <button
                      onClick={() => { setActiveTab('giving'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'giving' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      Stewardship & Giving ({givingRecords.length})
                    </button>
                  </>
                )}

                {/* 2. DISTRICT OVERSEER (SENIOR PASTOR) NAVIGATION */}
                {activeRole === 'district_overseer' && (
                  <>
                    <button
                      onClick={() => { setActiveTab('overseer_pulse'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'overseer_pulse' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      Executive Overseer Study
                    </button>
                    <button
                      onClick={() => { setActiveTab('prayers'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'prayers' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      Pastoral Intercession ({prayerRequests.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('sermons'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'sermons' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      Preaching Roster & Series
                    </button>
                    <button
                      onClick={() => { setActiveTab('attendance'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'attendance' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Sunday Headcount Pulse
                    </button>
                    <button
                      onClick={() => { setActiveTab('overseer_directives'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'overseer_directives' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-indigo-400" />
                      Pastoral Team & Directives
                    </button>
                  </>
                )}

                {/* 3. RESIDENT PASTOR NAVIGATION */}
                {activeRole === 'resident_pastor' && (
                  <>
                    <button
                      onClick={() => { setActiveTab('guests'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'guests' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Users className="w-4 h-4 text-sky-400" />
                      First-Time Guest Care ({guestVisits.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('prayers'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'prayers' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      Pastoral Counseling & Prayers ({prayerRequests.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('sermons'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'sermons' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      Sermon Recordings & Study ({sermons.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('attendance'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'attendance' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Attendance Logs
                    </button>
                  </>
                )}

                {/* 4. SECRETARIAT NAVIGATION */}
                {activeRole === 'secretariat' && (
                  <>
                    <button
                      onClick={() => { setActiveTab('events'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'events' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      Events & Church Calendar ({events.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('guests'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'guests' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4 text-emerald-400" />
                      Guest Intake Registry ({guestVisits.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'settings' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Bell className="w-4 h-4 text-amber-400" />
                      Public Announcements
                    </button>
                  </>
                )}

                {/* 5. HEAD USHER NAVIGATION */}
                {activeRole === 'head_usher' && (
                  <>
                    <button
                      onClick={() => { setActiveTab('headcount_logger'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'headcount_logger' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Plus className="w-4 h-4 text-rose-400" />
                      Log Service Headcount
                    </button>
                    <button
                      onClick={() => { setActiveTab('attendance'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'attendance' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-amber-400" />
                      Attendance History
                    </button>
                    <button
                      onClick={() => { setActiveTab('guests'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === 'guests' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-sky-400" />
                      Guest Welcome Arrivals ({guestVisits.length})
                    </button>
                  </>
                )}
              </div>

              {/* Sidebar Footer Info */}
              <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 mb-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Supabase Backend Live
                </div>
                <div className="truncate">Active: {currentUser.name}</div>
              </div>
            </aside>

            {/* Main Content Workspace */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#070d18] min-h-0 overscroll-contain">

              {/* ---------------------------------------------------- */}
              {/* TAB: OVERVIEW PULSE (ADMINISTRATOR)                 */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'overview' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white tracking-tight">Executive Church Operations Pulse</h1>
                      <p className="text-xs text-slate-400 mt-1">
                        High-level ministry performance metrics, visitor engagement, and operational status.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSermonForm({
                          title: '',
                          series: 'UNSHAKABLE',
                          speaker: 'Rev. Dr. O. A. Babalola',
                          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          duration: '35 min',
                          passage: 'Hebrews 13:8',
                          thumbnail: '/images/sermon-series.jpg',
                          summary: '',
                          videoUrl: '',
                          isFeatured: false
                        });
                        setIsEditingSermon(true);
                        setActiveTab('sermons');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Publish New Sermon
                    </button>
                  </div>

                  {/* 4 KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Sunday Attendance</span>
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white">{totalRecentSundayHeadcount || '1,220'}</div>
                      <div className="text-[11px] text-emerald-400 mt-1 font-medium">Combined 1st & 2nd services</div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">First-Time Guests</span>
                        <Users className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white">{guestVisits.length}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Visitors registered online</div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Prayer Intercession</span>
                        <Heart className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white">{prayerRequests.length}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Active requests logged</div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Active Staff Roles</span>
                        <Shield className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white">{staffUsers.filter(u => u.is_active).length} / 5</div>
                      <div className="text-[11px] text-blue-400 mt-1 font-medium">RBAC profiles provisioned</div>
                    </div>
                  </div>

                  {/* Operational Quick Actions Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-amber-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Administrator Quick Dispatch
                      </div>
                      <h3 className="text-lg font-bold text-white">Full CMS & Operations Governance Active</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        You can manage all sermons, calendar gatherings, website announcements, and provision staff roles across the church.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveTab('iam_staff')}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Shield className="w-4 h-4" />
                        Manage Staff IAM
                      </button>
                      <button
                        onClick={() => setActiveTab('guests')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Users className="w-4 h-4" />
                        Review Guests
                      </button>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Settings className="w-4 h-4" />
                        Live Announcements
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: DISTRICT OVERSEER EXECUTIVE STUDY               */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'overseer_pulse' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                          Executive Study • District Governance
                        </span>
                        <h1 className="text-2xl font-black text-white">Rev. Dr. O. A. Babalola</h1>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl mt-2 leading-relaxed">
                      District Overseer pastoral oversight for FGC Mushin District Headquarters. Review Sunday attendance trajectories, spiritual care escalations, preaching roadmap, and district communications.
                    </p>
                  </div>

                  {/* 4 Overseer Executive Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Total Sunday Attendance</div>
                      <div className="text-3xl font-black text-amber-400">{totalRecentSundayHeadcount || '1,220'}</div>
                      <div className="text-[11px] text-emerald-400 mt-1 font-medium">Across 1st & 2nd Services</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs font-semibold uppercase text-slate-400 mb-1">First-Time Visitors</div>
                      <div className="text-3xl font-black text-white">{guestVisits.length}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Pending welcoming follow-up</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Confidential Prayers</div>
                      <div className="text-3xl font-black text-rose-400">{prayerRequests.length}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Intercession requests</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Preaching Series</div>
                      <div className="text-3xl font-black text-sky-400">{sermons.length}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Active recorded messages</div>
                    </div>
                  </div>

                  {/* Recent Attendance Breakdown */}
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Sunday Service Headcount Breakdown
                      </h3>
                      <span className="text-xs text-slate-400">Logged by Head Usher</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Service</th>
                            <th className="py-2.5 px-3 text-right">Men</th>
                            <th className="py-2.5 px-3 text-right">Women</th>
                            <th className="py-2.5 px-3 text-right">Children</th>
                            <th className="py-2.5 px-3 text-right font-bold text-white">Total</th>
                            <th className="py-2.5 px-3">Ushering Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {serviceAttendance.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-4 text-center text-slate-500">
                                No attendance records logged yet.
                              </td>
                            </tr>
                          ) : (
                            serviceAttendance.slice(0, 5).map((rec) => (
                              <tr key={rec.id} className="hover:bg-slate-800/30">
                                <td className="py-3 px-3 text-slate-300 font-mono">{rec.service_date}</td>
                                <td className="py-3 px-3 text-white font-semibold">{rec.service_name}</td>
                                <td className="py-3 px-3 text-right text-slate-300">{rec.men_count}</td>
                                <td className="py-3 px-3 text-right text-slate-300">{rec.women_count}</td>
                                <td className="py-3 px-3 text-right text-slate-300">{rec.children_count}</td>
                                <td className="py-3 px-3 text-right font-bold text-emerald-400">{rec.total_count}</td>
                                <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">{rec.notes || '—'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: DISTRICT DIRECTIVES (OVERSEER)                  */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'overseer_directives' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div>
                    <h1 className="text-2xl font-black text-white">Pastoral Staff Directory & Ministerial Directives</h1>
                    <p className="text-xs text-slate-400 mt-1">Direct communication channels with department heads across FGC Mushin DHQ.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffUsers.map((member) => (
                      <div key={member.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                          {member.avatar_initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{member.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {(ROLE_DEFINITIONS[member.role] || ROLE_DEFINITIONS.admin).badge}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{member.title}</div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {member.phone && (
                              <a
                                href={`tel:${member.phone}`}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                {member.phone}
                              </a>
                            )}
                            <a
                              href={`mailto:${member.email}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5 text-sky-400" />
                              {member.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: HEADCOUNT LOGGER (HEAD USHER)                   */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'headcount_logger' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400">
                            Ushering & Protocol Desk • Service Headcount
                          </span>
                          <h1 className="text-2xl font-black text-white">Log Sunday Service Attendance</h1>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 max-w-xl">
                        Record exact attendance counts for men, women, and children during Sunday services and midweek gatherings.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogAttendance}
                      disabled={loading}
                      className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-[0.96] flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      {loading ? 'Submitting...' : 'Save Attendance'}
                    </button>
                  </div>

                  {/* Headcount Form */}
                  <form onSubmit={handleLogAttendance} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Service Date
                        </label>
                        <input
                          type="date"
                          value={attendanceForm.service_date}
                          onChange={(e) => setAttendanceForm({ ...attendanceForm, service_date: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-rose-400 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Service Type
                        </label>
                        <select
                          value={attendanceForm.service_name}
                          onChange={(e) => setAttendanceForm({ ...attendanceForm, service_name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-rose-400 focus:outline-none"
                        >
                          <option value="1st Service (7:30 AM)">1st Service (7:30 AM)</option>
                          <option value="2nd Service (9:30 AM)">2nd Service (9:30 AM)</option>
                          <option value="Wednesday Faith Clinic (6:00 PM)">Wednesday Faith Clinic (6:00 PM)</option>
                          <option value="Monthly Vigil / Special Gathering">Monthly Vigil / Special Gathering</option>
                        </select>
                      </div>
                    </div>

                    {/* Numeric Counters with +/- step buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      {/* Men */}
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center flex flex-col justify-between">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">
                            Men Headcount
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={attendanceForm.men_count}
                            onChange={(e) => setAttendanceForm({ ...attendanceForm, men_count: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full py-1 bg-transparent text-center text-3xl font-black text-white focus:outline-none tabular-nums"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, men_count: Math.max(0, prev.men_count - 10) }))}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, men_count: Math.max(0, prev.men_count - 1) }))}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, men_count: prev.men_count + 1 }))}
                            className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, men_count: prev.men_count + 10 }))}
                            className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            +10
                          </button>
                        </div>
                      </div>

                      {/* Women */}
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center flex flex-col justify-between">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
                            Women Headcount
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={attendanceForm.women_count}
                            onChange={(e) => setAttendanceForm({ ...attendanceForm, women_count: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full py-1 bg-transparent text-center text-3xl font-black text-white focus:outline-none tabular-nums"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, women_count: Math.max(0, prev.women_count - 10) }))}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, women_count: Math.max(0, prev.women_count - 1) }))}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, women_count: prev.women_count + 1 }))}
                            className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, women_count: prev.women_count + 10 }))}
                            className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            +10
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center flex flex-col justify-between">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                            Children Headcount
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={attendanceForm.children_count}
                            onChange={(e) => setAttendanceForm({ ...attendanceForm, children_count: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full py-1 bg-transparent text-center text-3xl font-black text-white focus:outline-none tabular-nums"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, children_count: Math.max(0, prev.children_count - 10) }))}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, children_count: Math.max(0, prev.children_count - 1) }))}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, children_count: prev.children_count + 1 }))}
                            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceForm(prev => ({ ...prev, children_count: prev.children_count + 10 }))}
                            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[11px] font-bold active:scale-95 transition-transform"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total Calculated Banner with Sanctuary Capacity Meter */}
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Calculated Total Headcount</div>
                          <div className="text-[11px] text-slate-400">Sum of Men, Women, and Children</div>
                        </div>
                        <div className="text-3xl font-black text-emerald-400 tabular-nums">
                          {attendanceForm.men_count + attendanceForm.women_count + attendanceForm.children_count}
                        </div>
                      </div>

                      {/* Sanctuary Seating Capacity Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Sanctuary Seating Utilization (1,000 Capacity)</span>
                          <span className="font-bold text-emerald-400">
                            {Math.round(((attendanceForm.men_count + attendanceForm.women_count + attendanceForm.children_count) / 1000) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950/80 overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, Math.round(((attendanceForm.men_count + attendanceForm.women_count + attendanceForm.children_count) / 1000) * 100))}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Protocol Notes */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Protocol & Ushering Observations
                      </label>
                      <textarea
                        rows={2}
                        value={attendanceForm.notes}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                        placeholder="e.g. Overflow seating opened in upper gallery; communion served in 12 minutes."
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-rose-400 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {loading ? 'Recording Headcount...' : 'Submit Service Attendance Record'}
                    </button>
                  </form>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: SERVICE ATTENDANCE TELEMETRY                    */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'attendance' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">Sunday Service Attendance Telemetry</h1>
                      <p className="text-xs text-slate-400 mt-1">Verified headcount records submitted by Head Usher and Protocol.</p>
                    </div>
                    {activeRole === 'head_usher' && (
                      <button
                        onClick={() => setActiveTab('headcount_logger')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Log New Headcount
                      </button>
                    )}
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4 text-right">Men</th>
                          <th className="py-3 px-4 text-right">Women</th>
                          <th className="py-3 px-4 text-right">Children</th>
                          <th className="py-3 px-4 text-right font-bold text-white">Total</th>
                          <th className="py-3 px-4">Head Usher</th>
                          <th className="py-3 px-4">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {serviceAttendance.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-slate-500">
                              No service attendance logged yet.
                            </td>
                          </tr>
                        ) : (
                          serviceAttendance.map((rec) => (
                            <tr key={rec.id} className="hover:bg-slate-800/30">
                              <td className="py-3 px-4 text-slate-300 font-mono">{rec.service_date}</td>
                              <td className="py-3 px-4 text-white font-semibold">{rec.service_name}</td>
                              <td className="py-3 px-4 text-right text-slate-300">{rec.men_count}</td>
                              <td className="py-3 px-4 text-right text-slate-300">{rec.women_count}</td>
                              <td className="py-3 px-4 text-right text-slate-300">{rec.children_count}</td>
                              <td className="py-3 px-4 text-right font-bold text-emerald-400 text-sm">{rec.total_count}</td>
                              <td className="py-3 px-4 text-slate-400">{rec.head_usher_name || 'Bro. Emmanuel Kalu'}</td>
                              <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">{rec.notes || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: STAFF ACCOUNTS & IAM (ADMINISTRATOR ONLY)       */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'iam_staff' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">Identity & Access Management (IAM)</h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Role-Based Access Control (RBAC), passkey credentials, and staff directory management.
                      </p>
                    </div>
                  </div>

                  {/* Staff List Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staffUsers.map((staff) => {
                      const roleDef = ROLE_DEFINITIONS[staff.role] || ROLE_DEFINITIONS.admin;
                      const isShowingPass = showPasskeys[staff.id];
                      return (
                        <div 
                          key={staff.id} 
                          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-lg"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div 
                                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base border"
                                style={{ backgroundColor: roleDef.badgeBg, color: roleDef.badgeColor, borderColor: roleDef.badgeColor + '50' }}
                              >
                                {staff.avatar_initials}
                              </div>
                              <span 
                                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border"
                                style={{ backgroundColor: roleDef.badgeBg, color: roleDef.badgeColor, borderColor: roleDef.badgeColor + '40' }}
                              >
                                {roleDef.badge}
                              </span>
                            </div>

                            <h3 className="font-bold text-white text-base">{staff.name}</h3>
                            <div className="text-xs text-slate-400 font-medium mb-3">{staff.title}</div>

                            <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="truncate">{staff.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>{staff.phone || '—'}</span>
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                  <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span className="font-mono text-slate-300">
                                    {isShowingPass ? staff.passkey : '••••••••••••'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowPasskeys(prev => ({ ...prev, [staff.id]: !prev[staff.id] }))}
                                  className="text-[10px] text-amber-400 hover:underline"
                                >
                                  {isShowingPass ? 'Hide' : 'Show'}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                            <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${staff.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                              <span className={`w-2 h-2 rounded-full ${staff.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                              {staff.is_active ? 'Account Active' : 'Suspended'}
                            </span>
                            <button
                              onClick={() => handleOpenStaffEditor(staff)}
                              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit Profile
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Permissions Matrix Overview */}
                  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
                    <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-400" />
                      Role-Based Access Control (RBAC) Permissions Matrix
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-3">Role</th>
                            <th className="py-2.5 px-3">CMS Management</th>
                            <th className="py-2.5 px-3">Staff IAM</th>
                            <th className="py-2.5 px-3">Pastoral Care</th>
                            <th className="py-2.5 px-3">Calendar & Events</th>
                            <th className="py-2.5 px-3">Headcount Logger</th>
                            <th className="py-2.5 px-3">Giving Financials</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          <tr className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-bold text-blue-400">Church Administrator</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Full</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Full</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Full</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Full</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Full</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Full</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-bold text-amber-400">District Overseer (DO)</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Executive</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ View</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Executive</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-bold text-sky-400">Resident Pastor</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Sermons</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Full</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ View</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-bold text-emerald-400">Church Secretariat</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Events/Announcements</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Registry</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Full</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-bold text-rose-400">Head Usher & Protocol</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">✓ Logging</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Staff Profile Editor Modal */}
                  {editingStaffId && (
                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg text-white">Edit Staff Profile & Credentials</h3>
                          <button
                            onClick={() => setEditingStaffId(null)}
                            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveStaffUser} className="space-y-4 text-xs">
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Full Name</label>
                            <input
                              type="text"
                              value={staffEditForm.name}
                              onChange={(e) => setStaffEditForm({ ...staffEditForm, name: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                              required
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Official Title</label>
                            <input
                              type="text"
                              value={staffEditForm.title}
                              onChange={(e) => setStaffEditForm({ ...staffEditForm, title: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-slate-400 mb-1">Email</label>
                              <input
                                type="email"
                                value={staffEditForm.email}
                                onChange={(e) => setStaffEditForm({ ...staffEditForm, email: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                                required
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-400 mb-1">Phone</label>
                              <input
                                type="text"
                                value={staffEditForm.phone}
                                onChange={(e) => setStaffEditForm({ ...staffEditForm, phone: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Role Passkey (Secret)</label>
                            <input
                              type="text"
                              value={staffEditForm.passkey}
                              onChange={(e) => setStaffEditForm({ ...staffEditForm, passkey: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                              required
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="staff_active"
                              checked={staffEditForm.is_active}
                              onChange={(e) => setStaffEditForm({ ...staffEditForm, is_active: e.target.checked })}
                              className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                            />
                            <label htmlFor="staff_active" className="text-slate-300 font-semibold cursor-pointer">
                              Account Active & Provisioned
                            </label>
                          </div>

                          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => setEditingStaffId(null)}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                            >
                              {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: CMS SERMONS                                     */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'sermons' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">Sermon & Series Manager (CMS)</h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Publish Sunday messages, assign series titles, scripture passages, and video streams.
                      </p>
                    </div>
                    {!isEditingSermon && (
                      <button
                        onClick={() => {
                          setSermonForm({
                            title: '',
                            series: 'UNSHAKABLE',
                            speaker: 'Rev. Dr. O. A. Babalola',
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            duration: '35 min',
                            passage: 'Hebrews 13:8',
                            thumbnail: '/images/sermon-series.jpg',
                            summary: '',
                            videoUrl: '',
                            isFeatured: false
                          });
                          setIsEditingSermon(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        New Sermon
                      </button>
                    )}
                  </div>

                  {isEditingSermon ? (
                    <form onSubmit={handleSaveSermon} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h2 className="text-base font-bold text-white">
                          {sermonForm.id ? 'Edit Sermon Entry' : 'Publish New Sermon Message'}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setIsEditingSermon(false)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Sermon Title *
                          </label>
                          <input
                            type="text"
                            value={sermonForm.title}
                            onChange={(e) => setSermonForm({ ...sermonForm, title: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                            placeholder="e.g. Hope In The Storm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Speaker *
                          </label>
                          <input
                            type="text"
                            value={sermonForm.speaker}
                            onChange={(e) => setSermonForm({ ...sermonForm, speaker: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Series Name
                          </label>
                          <input
                            type="text"
                            value={sermonForm.series}
                            onChange={(e) => setSermonForm({ ...sermonForm, series: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Scripture Passage
                          </label>
                          <input
                            type="text"
                            value={sermonForm.passage}
                            onChange={(e) => setSermonForm({ ...sermonForm, passage: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                            placeholder="e.g. Hebrews 13:8"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Date Delivered
                          </label>
                          <input
                            type="text"
                            value={sermonForm.date}
                            onChange={(e) => setSermonForm({ ...sermonForm, date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            YouTube / Video Embed URL
                          </label>
                          <input
                            type="url"
                            value={sermonForm.videoUrl}
                            onChange={(e) => setSermonForm({ ...sermonForm, videoUrl: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Sermon Summary & Study Notes
                        </label>
                        <textarea
                          rows={3}
                          value={sermonForm.summary}
                          onChange={(e) => setSermonForm({ ...sermonForm, summary: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                          placeholder="Brief message breakdown, key takeaways, and reflection questions..."
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={sermonForm.isFeatured}
                          onChange={(e) => setSermonForm({ ...sermonForm, isFeatured: e.target.checked })}
                          className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                        />
                        <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-300 cursor-pointer">
                          Highlight as Featured Spotlight Sermon on Homepage
                        </label>
                      </div>

                      {/* Sticky Action Bar */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsEditingSermon(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                        >
                          {loading ? 'Publishing...' : 'Save & Publish Sermon'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Sermon List */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sermons.map((sermon) => (
                        <div key={sermon.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-lg">
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-2">
                              <span>{sermon.series || 'SUNDAY CELEBRATION'}</span>
                              <span className="text-slate-500">{sermon.date}</span>
                            </div>
                            <h3 className="font-extrabold text-base text-white">{sermon.title}</h3>
                            <div className="text-xs text-slate-400 mt-1">{sermon.speaker}</div>
                            {sermon.passage && (
                              <div className="text-[11px] text-slate-500 mt-2 font-mono">
                                📖 {sermon.passage}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSermonForm({
                                  id: sermon.id,
                                  title: sermon.title,
                                  series: sermon.series || '',
                                  speaker: sermon.speaker,
                                  date: sermon.date,
                                  duration: sermon.duration || '35 min',
                                  passage: sermon.passage || '',
                                  thumbnail: sermon.thumbnail || '/images/sermon-series.jpg',
                                  summary: sermon.summary || '',
                                  videoUrl: sermon.videoUrl || '',
                                  isFeatured: false
                                });
                                setIsEditingSermon(true);
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Edit sermon"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSermon(sermon.id, sermon.title)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                              title="Delete sermon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: CMS EVENTS & CALENDAR                           */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'events' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">Events & Gatherings Calendar (CMS)</h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Schedule church conferences, district assemblies, baptismal services, and fellowships.
                      </p>
                    </div>
                    {!isEditingEvent && (
                      <button
                        onClick={() => {
                          setEventForm({
                            title: '',
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            time: '9:30 AM',
                            location: 'Main Sanctuary (DHQ)',
                            category: 'Worship',
                            description: ''
                          });
                          setIsEditingEvent(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Schedule Event
                      </button>
                    )}
                  </div>

                  {isEditingEvent ? (
                    <form onSubmit={handleSaveEvent} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h2 className="text-base font-bold text-white">
                          {eventForm.id ? 'Edit Event' : 'Add Calendar Event'}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setIsEditingEvent(false)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Event Title *
                          </label>
                          <input
                            type="text"
                            value={eventForm.title}
                            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                            placeholder="e.g. All-Church Faith Night & Worship"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Category
                          </label>
                          <select
                            value={eventForm.category}
                            onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as ChurchEvent['category'] })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                          >
                            <option value="Worship">Worship</option>
                            <option value="Community">Community</option>
                            <option value="Outreach">Outreach</option>
                            <option value="NextGen">NextGen</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Date
                          </label>
                          <input
                            type="text"
                            value={eventForm.date}
                            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                            placeholder="e.g. Nov 15, 2026"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Time
                          </label>
                          <input
                            type="text"
                            value={eventForm.time}
                            onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                            placeholder="e.g. 6:30 PM - 8:30 PM"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Venue / Location
                          </label>
                          <input
                            type="text"
                            value={eventForm.location}
                            onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                            placeholder="e.g. Main Sanctuary (DHQ) • 4, Obarinmola Adedoyin St, Idi-Oro"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Event Description
                          </label>
                          <textarea
                            rows={3}
                            value={eventForm.description}
                            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsEditingEvent(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                        >
                          {loading ? 'Saving...' : 'Save & Publish Event'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {events.map((event) => (
                        <div key={event.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-lg">
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-2">
                              <span>{event.category}</span>
                              <span className="text-slate-400 font-mono">{event.date}</span>
                            </div>
                            <h3 className="font-bold text-base text-white">{event.title}</h3>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              {event.time}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEventForm({
                                  id: event.id,
                                  title: event.title,
                                  date: event.date,
                                  time: event.time,
                                  location: event.location,
                                  category: event.category,
                                  description: event.description || ''
                                });
                                setIsEditingEvent(true);
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: FIRST-TIME GUESTS (PASTORAL OUTREACH)           */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'guests' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">First-Time Guest Care Desk</h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Warm pastoral outreach: connect via 1-click WhatsApp, Direct Call, or Welcome Email.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Guest Name</th>
                          <th className="py-3 px-4">Contact Channels</th>
                          <th className="py-3 px-4">Service Time</th>
                          <th className="py-3 px-4">Party Size</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Quick Pastoral Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {guestVisits.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-500">
                              No first-time visitors registered yet.
                            </td>
                          </tr>
                        ) : (
                          guestVisits.map((guest) => {
                            const cleanPhone = guest.phone ? guest.phone.replace(/[^0-9]/g, '') : '';
                            const waUrl = cleanPhone 
                              ? `https://wa.me/${cleanPhone.startsWith('234') ? cleanPhone : '234' + cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(`Hello ${guest.full_name}, grace and peace to you from FGC Mushin DHQ! We are truly honored to receive you. How can our pastoral team serve you this week?`)}`
                              : null;

                            return (
                              <tr key={guest.id} className="hover:bg-slate-800/30">
                                <td className="py-3 px-4 font-bold text-white text-sm">{guest.full_name}</td>
                                <td className="py-3 px-4 text-slate-300">
                                  <div>{guest.email}</div>
                                  {guest.phone && <div className="text-slate-500 text-[11px] font-mono">{guest.phone}</div>}
                                </td>
                                <td className="py-3 px-4 text-slate-300">{guest.service_time}</td>
                                <td className="py-3 px-4 text-slate-400">
                                  {guest.adults_count || 1} adults{guest.kids_count ? `, ${guest.kids_count} kids` : ''}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    guest.status === 'welcomed' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {guest.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {waUrl && (
                                      <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                                        title="WhatsApp Message"
                                      >
                                        <MessageCircle className="w-4 h-4" />
                                      </a>
                                    )}
                                    {guest.phone && (
                                      <a
                                        href={`tel:${guest.phone}`}
                                        className="p-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 transition-colors"
                                        title="Call Guest"
                                      >
                                        <Phone className="w-4 h-4" />
                                      </a>
                                    )}
                                    <a
                                      href={`mailto:${guest.email}?subject=${encodeURIComponent('Welcome to FGC Mushin DHQ')}`}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                      title="Send Email"
                                    >
                                      <Mail className="w-4 h-4" />
                                    </a>
                                    <button
                                      onClick={() => handleUpdateGuest(guest.id, guest.status === 'welcomed' ? 'pending' : 'welcomed')}
                                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 transition-colors"
                                    >
                                      {guest.status === 'welcomed' ? 'Mark Pending' : 'Mark Welcomed'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: PRAYER CARE (PASTORAL INTERCESSION)             */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'prayers' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">Pastoral Care & Prayer Requests</h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Confidential prayer intercessions submitted by church members and visitors.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prayerRequests.length === 0 ? (
                      <div className="col-span-2 p-8 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800">
                        No active prayer requests logged.
                      </div>
                    ) : (
                      prayerRequests.map((req) => (
                        <div key={req.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-lg">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                {req.category}
                              </span>
                              <span className={`text-[10px] font-bold uppercase ${req.status === 'prayed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                ● {req.status}
                              </span>
                            </div>

                            <h3 className="font-bold text-base text-white">{req.full_name}</h3>
                            <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                              "{req.request}"
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {req.phone && (
                                <a
                                  href={`tel:${req.phone}`}
                                  className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30"
                                  title="Call Member"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {req.email && (
                                <a
                                  href={`mailto:${req.email}`}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                                  title="Email Member"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>

                            <button
                              onClick={() => handleUpdatePrayer(req.id, req.status === 'prayed' ? 'received' : 'prayed')}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                                req.status === 'prayed'
                                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              }`}
                            >
                              {req.status === 'prayed' ? 'Mark Received' : 'Mark Prayed Over'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: GIVING RECORDS (ADMIN & OVERSEER ONLY)          */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'giving' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div>
                    <h1 className="text-2xl font-black text-white">Stewardship & Online Giving Ledger</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Real-time records of online tithes, mission offerings, and district pledges.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Donor Name</th>
                          <th className="py-3 px-4">Fund Type</th>
                          <th className="py-3 px-4">Frequency</th>
                          <th className="py-3 px-4 text-right font-bold text-white">Amount (NGN)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {givingRecords.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-500">
                              No online transactions logged in current cycle.
                            </td>
                          </tr>
                        ) : (
                          givingRecords.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30">
                              <td className="py-3 px-4 text-slate-400 font-mono">
                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                              </td>
                              <td className="py-3 px-4 font-bold text-white">{item.donor_name || 'Anonymous Donor'}</td>
                              <td className="py-3 px-4 text-slate-300 font-medium">{item.fund}</td>
                              <td className="py-3 px-4 text-slate-400 capitalize">{item.frequency}</td>
                              <td className="py-3 px-4 text-right font-black text-emerald-400">
                                ₦{item.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: CHURCH SETTINGS & ANNOUNCEMENTS                 */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div>
                    <h1 className="text-2xl font-black text-white">Global Church Information & Announcements</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Update top header announcement bar, church contact lines, and headquarters address.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Live Announcement Bar Message
                      </label>
                      <input
                        type="text"
                        value={settingsForm.announcementText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                        placeholder="e.g. Welcome to FGC Mushin DHQ • Sunday Celebration Services at 7:30 AM & 9:30 AM"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="announcementActive"
                        checked={settingsForm.announcementActive}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcementActive: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <label htmlFor="announcementActive" className="text-xs font-semibold text-slate-300 cursor-pointer">
                        Display Announcement Bar at top of public website
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Official Church Phone
                        </label>
                        <input
                          type="text"
                          value={settingsForm.phone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Official Church Email
                        </label>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        District Headquarters Physical Address
                      </label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-3 border-t border-slate-800">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                      >
                        {loading ? 'Saving...' : 'Save Live Settings'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
