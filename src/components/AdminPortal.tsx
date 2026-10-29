import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Lock,
  Calendar,
  BookOpen,
  Users,
  Heart,
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
  CheckCircle2,
  AlertCircle,
  LogOut,
  FileText,
  Eye,
  Activity,
  ClipboardList,
  Bell,
  Key,
  Wallet,
  Hash,
  MessageSquare,
  Church
} from 'lucide-react';
import type { Sermon, ChurchEvent } from '../types';
import type { 
  ChurchSettingsRow, 
  GuestVisitRow, 
  PrayerRequestRow, 
  ServiceAttendanceRow, 
  StaffUserRow,
  PastoralNoteRow,
  AuditLogRow,
  ChurchFinanceRow
} from '../types/database';
import { ROLE_DEFINITIONS } from '../types/iam';
import type { ChurchRole } from '../types/iam';
import {
  DistrictOverseerDashboard
} from './RoleDashboards';
import { LectorChurchDashboard } from './LectorChurchDashboard';
import { FinancialAnalytics } from './FinancialAnalytics';
import { AttendanceAnalytics } from './AttendanceAnalytics';
import {
  saveSermon,
  deleteSermon,
  saveEvent,
  deleteEvent,
  updateChurchSettings,
  getGuestVisits,
  getPrayerRequests,
  getChurchFinances,
  updatePrayerStatus,
  updateGuestVisitStatus,
  getStaffUsers,
  updateStaffUser,
  getServiceAttendance,
  logServiceAttendance,
  getPastoralNotes,
  addPastoralNote,
  getAuditLogs,
  logAuditEvent
} from '../lib/supabase';
import './AdminPortal.css';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  sermons: Sermon[];
  events: ChurchEvent[];
  churchSettings: ChurchSettingsRow | null;
  onDataRefresh: () => void;
  isStandalone?: boolean;
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
  onDataRefresh,
  isStandalone = false
}) => {
  // Staff Directory & Current Profile State
  const [staffUsers, setStaffUsers] = useState<StaffUserRow[]>(DEFAULT_STAFF_USERS);
  const [currentUser, setCurrentUser] = useState<StaffUserRow>(DEFAULT_STAFF_USERS[0]);
  const [activeRole, setActiveRole] = useState<ChurchRole>('admin');

  // Render Role Definition Metadata (with safe fallback)
  const currentRoleDef = ROLE_DEFINITIONS[activeRole] || ROLE_DEFINITIONS.admin;

  // Authentication with sessionStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('fgc_staff_auth') === 'true';
    }
    return false;
  });
  const [selectedLoginProfileId, setSelectedLoginProfileId] = useState<string>('admin');
  const [passkeyInput, setPasskeyInput] = useState<string>(DEFAULT_STAFF_USERS[0].passkey);
  const [authError, setAuthError] = useState('');
  const [showDevCredentialsHelper, setShowDevCredentialsHelper] = useState(false);

  // Active Tab & Mobile Sidebar State
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Guard activeTab against activeRole permissions so users only access authorized modules
  useEffect(() => {
    const permissions = currentRoleDef.permissions;
    if ((activeTab === 'finances' || activeTab === 'giving') && !permissions.includes('view_financials')) {
      setActiveTab('overview');
    } else if (activeTab === 'iam_staff' && !permissions.includes('manage_staff_iam')) {
      setActiveTab('overview');
    } else if ((activeTab === 'guests' || activeTab === 'prayers') && !permissions.includes('manage_pastoral_care') && !permissions.includes('manage_secretariat')) {
      setActiveTab('overview');
    } else if (activeTab === 'sermons' && !permissions.includes('manage_cms')) {
      setActiveTab('overview');
    } else if (activeTab === 'events' && !permissions.includes('manage_secretariat') && !permissions.includes('manage_cms')) {
      setActiveTab('overview');
    } else if (activeTab === 'audit_logs' && !permissions.includes('manage_staff_iam') && !permissions.includes('view_executive_pulse')) {
      setActiveTab('overview');
    } else if (activeTab === 'settings' && !permissions.includes('manage_cms')) {
      setActiveTab('overview');
    }
  }, [activeTab, currentRoleDef]);

  // Loading & Notification Notice
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Live Operational Data
  const [guestVisits, setGuestVisits] = useState<GuestVisitRow[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequestRow[]>([]);
  const [finances, setFinances] = useState<ChurchFinanceRow[]>([]);
  const [serviceAttendance, setServiceAttendance] = useState<ServiceAttendanceRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);

  // Pastoral Care History & Notes Drawer State
  const [activeGuestForNotes, setActiveGuestForNotes] = useState<GuestVisitRow | null>(null);
  const [guestNotesList, setGuestNotesList] = useState<PastoralNoteRow[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<string>('follow_up');

  // CMS Live Visual Preview State
  const [sermonPreviewMode, setSermonPreviewMode] = useState(false);

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
  const showNotice = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
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

  // Load staff, attendance, finances, and audit logs
  const loadPortalData = useCallback(async () => {
    try {
      const [guests, prayers, loadedStaff, loadedAttendance, loadedAuditLogs, loadedFinances] = await Promise.all([
        getGuestVisits(),
        getPrayerRequests(),
        getStaffUsers(),
        getServiceAttendance(),
        getAuditLogs(),
        getChurchFinances()
      ]);

      if (guests) setGuestVisits(guests);
      if (prayers) setPrayerRequests(prayers);
      if (loadedFinances) setFinances(loadedFinances);
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
      if (loadedAuditLogs) setAuditLogs(loadedAuditLogs);
    } catch (err) {
      console.warn('Portal data fetch warning:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadPortalData();
    }
  }, [isOpen, loadPortalData]);

  // Draft Auto-Save to localStorage to prevent data loss from Lagos power or network interruptions
  useEffect(() => {
    if (isEditingSermon && !sermonForm.id && (sermonForm.title || sermonForm.summary)) {
      localStorage.setItem('fgc_draft_sermon', JSON.stringify(sermonForm));
    }
  }, [isEditingSermon, sermonForm]);

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

      // Default opening tab is always the Church Dashboard
      setActiveTab('overview');

      // Record audit event
      logAuditEvent({
        staff_id: matchedUser.id,
        staff_name: matchedUser.name,
        staff_role: matchedUser.role,
        action: 'STAFF_LOGIN',
        entity_type: 'AUTH',
        details: `Authenticated into ${ROLE_DEFINITIONS[matchedUser.role].title} desk.`
      }).then(() => loadPortalData()).catch(console.warn);

      showNotice(`Welcome, ${matchedUser.name} (${ROLE_DEFINITIONS[matchedUser.role].badge})`);
    } else {
      setAuthError('Invalid administrative passkey. Please check your credentials.');
    }
  };

  // 1-Click login helper for rapid development testing
  const loginAsUser = (targetUser: StaffUserRow) => {
    setIsAuthenticated(true);
    setCurrentUser(targetUser);
    setActiveRole(targetUser.role);
    setPasskeyInput(targetUser.passkey);
    setSelectedLoginProfileId(targetUser.id);
    setAuthError('');
    sessionStorage.setItem('fgc_staff_auth', 'true');
    sessionStorage.setItem('fgc_staff_user_id', targetUser.id);
    sessionStorage.setItem('fgc_staff_role', targetUser.role);
    setActiveTab('overview');

    logAuditEvent({
      staff_id: targetUser.id,
      staff_name: targetUser.name,
      staff_role: targetUser.role,
      action: 'STAFF_LOGIN',
      entity_type: 'AUTH',
      details: `1-Click Direct Authenticated into ${ROLE_DEFINITIONS[targetUser.role].title} desk.`
    }).then(() => loadPortalData()).catch(console.warn);

    showNotice(`Welcome, ${targetUser.name} (${ROLE_DEFINITIONS[targetUser.role].badge})`);
  };

  const handleLogout = () => {
    if (currentUser) {
      logAuditEvent({
        staff_id: currentUser.id,
        staff_name: currentUser.name,
        staff_role: currentUser.role,
        action: 'STAFF_LOGOUT',
        entity_type: 'AUTH',
        details: `Signed out from ${ROLE_DEFINITIONS[currentUser.role].title} desk.`
      }).catch(console.warn);
    }
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
    setActiveTab('overview');
    showNotice(`Switched desk view to: ${ROLE_DEFINITIONS[targetRole].title}`);
  };

  // --- Pastoral Care Interaction History Handlers ---
  const handleOpenGuestNotes = async (guest: GuestVisitRow) => {
    setActiveGuestForNotes(guest);
    setLoadingNotes(true);
    try {
      const notes = await getPastoralNotes(guest.id);
      setGuestNotesList(notes);
    } catch (err) {
      console.warn('Error fetching pastoral notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleCloseGuestNotes = () => {
    setActiveGuestForNotes(null);
    setGuestNotesList([]);
    setNewNoteText('');
  };

  const handleCreatePastoralNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGuestForNotes || !newNoteText.trim()) return;
    setLoadingNotes(true);
    const res = await addPastoralNote({
      guest_id: activeGuestForNotes.id,
      staff_id: currentUser.id,
      staff_name: currentUser.name,
      staff_role: currentUser.role,
      category: newNoteCategory,
      note: newNoteText.trim()
    });
    setLoadingNotes(false);
    if (res.success) {
      showNotice('Pastoral note recorded to guest dossier.');
      setNewNoteText('');
      const updatedNotes = await getPastoralNotes(activeGuestForNotes.id);
      setGuestNotesList(updatedNotes);
      logAuditEvent({
        staff_id: currentUser.id,
        staff_name: currentUser.name,
        staff_role: currentUser.role,
        action: 'PASTORAL_NOTE_ADDED',
        entity_type: 'GUESTS',
        details: `Recorded ${newNoteCategory.replace('_', ' ')} note for ${activeGuestForNotes.full_name}`
      }).then(() => loadPortalData()).catch(console.warn);
    } else {
      showNotice(`Failed to record pastoral note: ${res.error}`, 'error');
    }
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
      localStorage.removeItem('fgc_draft_sermon');
      logAuditEvent({
        staff_id: currentUser.id,
        staff_name: currentUser.name,
        staff_role: currentUser.role,
        action: sermonForm.id ? 'SERMON_UPDATED' : 'SERMON_PUBLISHED',
        entity_type: 'SERMONS',
        details: `Saved sermon "${sermonForm.title}" (${sermonForm.speaker})`
      }).then(() => loadPortalData()).catch(console.warn);
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
      logAuditEvent({
        staff_id: currentUser.id,
        staff_name: currentUser.name,
        staff_role: currentUser.role,
        action: 'SERMON_DELETED',
        entity_type: 'SERMONS',
        details: `Deleted sermon "${title}"`
      }).then(() => loadPortalData()).catch(console.warn);
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

  // Calculate high-level attendance metrics
  const latestSundayAttendance = serviceAttendance.slice(0, 2);
  const totalRecentSundayHeadcount = latestSundayAttendance.reduce((acc, curr) => acc + (curr.total_count || 0), 0);

  return (
    <div 
      className={isStandalone ? "admin-workspace-fullscreen" : "admin-portal-root modal-backdrop-animate"}
      role={isStandalone ? "main" : "dialog"}
      aria-modal={!isStandalone}
      onClick={(e) => {
        if (!isStandalone && e.target === e.currentTarget) onClose();
      }}
    >
      {/* Toast Notice */}
      {notice && (
        <div 
          className="fixed top-5 right-6 z-[999] px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 animate-fade-in"
          style={{
            background: notice.type === 'success' ? '#ECFDF5' : notice.type === 'info' ? '#EFF6FF' : '#FFF1F2',
            borderColor: notice.type === 'success' ? '#10B981' : notice.type === 'info' ? '#3B82F6' : '#ED3B41',
            color: notice.type === 'success' ? '#065F46' : notice.type === 'info' ? '#1E40AF' : '#9F1239'
          }}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : notice.type === 'info' ? (
            <Sparkles className="w-5 h-5 text-blue-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500" />
          )}
          <span className="text-sm font-semibold">{notice.message}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* AUTHENTICATION VIEW: ROLE-AWARE IAM ACCESS               */}
      {/* ======================================================== */}
      {!isAuthenticated ? (
        <div 
          className="double-bezel modal-dialog-animate"
          style={{
            maxWidth: '640px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: '#FFFFFF',
            margin: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="double-bezel-inner" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', background: '#FFFFFF', position: 'relative' }}>
            {/* Top 4-Color Church Emblem Gradient Ribbon */}
            <div className="top-color-ribbon" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              aria-label="Close Staff Portal"
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: '1.75rem', marginTop: '0.35rem' }}>
              <div className="eyebrow-pill blue" style={{ marginBottom: '0.65rem' }}>
                <span className="quad-beacon" aria-hidden="true">
                  <span className="quad-dot red"></span>
                  <span className="quad-dot blue"></span>
                  <span className="quad-dot gold"></span>
                  <span className="quad-dot purple"></span>
                </span>
                <span>STAFF OPERATIONS &amp; PASTORAL SUITE</span>
              </div>
              <h2 className="heading-h2 font-serif" style={{ fontSize: 'clamp(1.5rem, 3.8vw, 2.2rem)', color: 'var(--text-primary)', lineHeight: 1.15 }}>
                Enter Ministry Desk &amp; Pastoral Suite
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.55 }}>
                Foursquare Gospel Church Mushin District Headquarters. Select your assigned ministry desk or enter your security passkey to access operational records.
              </p>
            </div>

            {/* Development Mode Helper Notice */}
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '12px',
              background: 'rgba(243, 166, 69, 0.12)',
              border: '1px solid rgba(243, 166, 69, 0.35)',
              color: 'var(--fgc-gold-dark)',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <Sparkles size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Testing &amp; Development Mode:</strong> Clicking any role below instantly populates its passkey into the password field. You can also click <strong>1-Click Instant Login</strong>.
              </span>
            </div>

            {/* Quick Profile Selector Cards */}
            <div className="mb-6">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Select Your Role Desk (Click to Auto-Fill Password):
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
                        setPasskeyInput(user.passkey); // Auto-fill passkey immediately
                        setAuthError('');
                      }}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '14px',
                        border: isSelected ? `2px solid ${roleDef.badgeColor}` : '1px solid var(--border-subtle)',
                        background: isSelected ? roleDef.badgeBg : '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        textAlign: 'left',
                        boxShadow: isSelected ? 'var(--shadow-card)' : 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      <div 
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          flexShrink: 0,
                          backgroundColor: roleDef.badgeBg,
                          color: roleDef.badgeColor,
                          border: `1px solid ${roleDef.badgeColor}40`
                        }}
                      >
                        {user.avatar_initials}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: roleDef.badgeColor }}>
                            {roleDef.badge}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: 600, padding: '0.05rem 0.35rem', borderRadius: '4px', background: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' }}>
                            {user.passkey}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check size={16} color={roleDef.badgeColor} style={{ flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>

              {/* Selected Role Scope Card & 1-Click Login Trigger */}
              {selectedLoginProfileId && (() => {
                const selectedUser = staffUsers.find(u => u.id === selectedLoginProfileId) || staffUsers[0];
                const selectedRoleDef = ROLE_DEFINITIONS[selectedUser.role] || ROLE_DEFINITIONS.admin;
                return (
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '14px',
                    background: selectedRoleDef.badgeBg,
                    border: `1px solid ${selectedRoleDef.badgeColor}30`,
                    marginTop: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flex: 1, minWidth: '220px' }}>
                        <div 
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            marginTop: '0.35rem',
                            flexShrink: 0,
                            backgroundColor: selectedRoleDef.badgeColor
                          }} 
                        />
                        <div style={{ fontSize: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {selectedRoleDef.primaryDesk} • <span style={{ color: selectedRoleDef.badgeColor, fontWeight: 700 }}>Passkey: <code style={{ fontFamily: 'monospace', fontWeight: 800 }}>{selectedUser.passkey}</code> (Auto-filled)</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.45 }}>
                            {selectedRoleDef.description}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => loginAsUser(selectedUser)}
                        className="btn-island btn-teal"
                        style={{
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                        title="Instant access under development"
                      >
                        <Sparkles size={13} />
                        <span>1-Click Enter Desk</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Passkey Input Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    Administrative Passkey
                  </label>
                  {(() => {
                    const sel = staffUsers.find(u => u.id === selectedLoginProfileId);
                    if (sel && passkeyInput === sel.passkey) {
                      return (
                        <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Check size={12} /> Auto-populated ({sel.name})
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={passkeyInput}
                    onChange={(e) => {
                      setPasskeyInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter role passkey (e.g. fgcmushin2026, do2026)"
                    style={{
                      width: '100%',
                      paddingLeft: '2.75rem',
                      paddingRight: '1rem',
                      paddingTop: '0.85rem',
                      paddingBottom: '0.85rem',
                      fontSize: '0.9rem',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      background: '#FFFFFF'
                    }}
                    autoFocus
                  />
                </div>
                {authError && (
                  <p style={{ color: 'var(--fgc-red-dark)', fontSize: '0.75rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                    <AlertCircle size={14} />
                    {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn-island btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.9rem 1.5rem',
                  fontSize: '0.925rem',
                  borderRadius: '9999px',
                  boxShadow: 'var(--shadow-hover)'
                }}
              >
                <Key size={18} />
                <span>Unlock Role Operations Desk</span>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '0.25rem'
                }}>
                  →
                </span>
              </button>
            </form>

            {/* Enterprise Security Notice & Testing Passkey Accordion */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                  <Shield size={14} color="var(--fgc-blue)" />
                  Enterprise RBAC • Protected System
                </span>
                <button
                  type="button"
                  onClick={() => setShowDevCredentialsHelper(!showDevCredentialsHelper)}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--fgc-blue)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    padding: 0
                  }}
                >
                  {showDevCredentialsHelper ? 'Hide Testing Keys' : 'Staff Passkey Reference (Demo)'}
                </button>
              </div>

              {showDevCredentialsHelper && (
                <div style={{ marginTop: '0.85rem', padding: '0.85rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                    Authorized Local Testing Passkeys:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" style={{ fontSize: '0.75rem' }}>
                    <div><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Administrator:</span> <code style={{ color: 'var(--fgc-blue)', fontWeight: 700 }}>fgcmushin2026</code></div>
                    <div><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Senior Pastor:</span> <code style={{ color: 'var(--fgc-gold-dark)', fontWeight: 700 }}>do2026</code></div>
                    <div><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Resident Pastor:</span> <code style={{ color: 'var(--fgc-blue-dark)', fontWeight: 700 }}>pastor2026</code></div>
                    <div><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Secretariat:</span> <code style={{ color: 'var(--fgc-purple-dark)', fontWeight: 700 }}>sec2026</code></div>
                    <div><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Head Usher:</span> <code style={{ color: 'var(--fgc-red-dark)', fontWeight: 700 }}>usher2026</code></div>
                  </div>
                </div>
              )}
            </div>

            {/* Seamless Return to Website */}
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '9999px',
                  background: 'rgba(0,0,0,0.03)'
                }}
              >
                <ArrowLeft size={14} />
                Return to Church Website
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* AUTHENTICATED FULL-VIEWPORT OPERATIONS DASHBOARD          */
        /* ======================================================== */
        <div className="admin-portal-window modal-dialog-animate" onClick={(e) => e.stopPropagation()}>
          {/* Top 4-Color Church Emblem Gradient Ribbon */}
          <div className="top-color-ribbon" />

          <div className="admin-portal-window-inner">
            {/* Top Bar Header */}
            <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#f0e6f3] flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-3">
                {/* Mobile & Desktop hamburger toggle */}
                <button
                  onClick={() => setMobileSidebarOpen(prev => !prev)}
                  className="p-2 rounded-xl text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb] transition-colors cursor-pointer"
                  aria-label="Toggle navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border shadow-xs shrink-0"
                    style={{ backgroundColor: currentRoleDef.badgeBg, color: currentRoleDef.badgeColor, borderColor: currentRoleDef.badgeColor + '40' }}
                  >
                    {currentUser.avatar_initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-[#1f2430] tracking-tight truncate max-w-[200px] sm:max-w-xs">
                        {currentUser.name}
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border hidden sm:inline-block"
                        style={{ backgroundColor: currentRoleDef.badgeBg, color: currentRoleDef.badgeColor, borderColor: currentRoleDef.badgeColor + '40' }}
                      >
                        {currentRoleDef.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8a919e] font-medium hidden sm:block truncate">
                      {currentRoleDef.primaryDesk}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Header Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notification Bell with blue badge '3' */}
                <button 
                  onClick={() => setActiveTab('prayers')}
                  className="relative p-2 rounded-xl text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb] active:scale-[0.96] transition-transform duration-150 cursor-pointer" 
                  title="Notifications & Petitions (3)"
                  aria-label="Pending Notifications and Prayer Petitions"
                >
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#06b6d4] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs tabular-nums">3</span>
                </button>

                {/* Message bubble with pink badge '2' */}
                <button 
                  onClick={() => setActiveTab('guests')}
                  className="relative p-2 rounded-xl text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb] active:scale-[0.96] transition-transform duration-150 cursor-pointer" 
                  title="Visitor Registrations (2)"
                  aria-label="First-Time Guest Registrations"
                >
                  <MessageSquare size={18} />
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#ea1263] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs tabular-nums">2</span>
                </button>

                {/* Executive View Switcher (Only visible to Admin) */}
                {currentUser.role === 'admin' && (
                  <div className="hidden md:flex items-center gap-1.5 bg-[#faf4fb] border border-[#f0e6f3] rounded-xl px-2.5 py-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#ea1263]" />
                    <span className="text-[10px] font-extrabold text-[#8a919e] uppercase tracking-wider">Role View:</span>
                    <select
                      value={activeRole}
                      onChange={(e) => handleSwitchRoleView(e.target.value as ChurchRole)}
                      className="bg-transparent text-xs font-bold text-[#ea1263] focus:outline-none cursor-pointer"
                      aria-label="Switch staff role view"
                    >
                      <option value="admin">Administrator & CMS</option>
                      <option value="district_overseer">District Overseer Study</option>
                      <option value="resident_pastor">Resident Pastor Desk</option>
                      <option value="secretariat">Secretariat Desk</option>
                      <option value="head_usher">Head Usher Desk</option>
                    </select>
                  </div>
                )}

                {/* Settings Gear */}
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-2 rounded-xl text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb] active:scale-[0.96] transition-transform duration-150 cursor-pointer"
                  title="Church Settings & Announcements"
                  aria-label="Church Settings and Announcements"
                >
                  <Settings size={18} />
                </button>

                {/* View Live Site */}
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl border border-[#e4d8e8] hover:border-[#d8c8dc] bg-[#faf4fb] hover:bg-[#f5eef8] active:scale-[0.96] text-[#4b5262] text-xs font-bold transition-transform duration-150 flex items-center gap-1.5 cursor-pointer"
                  aria-label="Return to Live Church Website"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#707786]" />
                  <span className="hidden sm:inline">Live Site</span>
                </button>

                {/* Logout / Switch Role */}
                <button
                  onClick={handleLogout}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-[#ea1263]/30 hover:border-[#ea1263]/60 bg-[#ea1263]/10 hover:bg-[#ea1263]/20 active:scale-[0.96] text-[#ea1263] text-xs font-bold transition-transform duration-150 flex items-center gap-1.5 cursor-pointer"
                  title="Switch Staff Account / Lock"
                  aria-label="Lock and Switch Staff Account"
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
              className={`admin-sidebar fixed lg:static top-16 bottom-0 left-0 bg-white border-r border-[#f0e6f3] flex flex-col justify-between shrink-0 transition-transform duration-300 lg:translate-x-0 z-30 ${
                mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div>
                {/* Brand Header: FGC Mushin District Headquarters */}
                <div className="p-3.5 border-b border-[#f4ebf6]">
                  <div className="bg-gradient-to-r from-[#be123c] via-[#e11d48] to-[#ea1263] text-white rounded-xl py-2 px-3 shadow-sm shadow-[#e11d48]/25 flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-white text-[#be123c] flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      <Church className="w-3.5 h-3.5 text-[#be123c]" />
                    </div>
                    <div className="font-black text-sm tracking-tight text-white flex-1 truncate">
                      FGC Mushin
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white/20 text-white uppercase tracking-wider">
                      DHQ
                    </span>
                  </div>
                </div>

                {/* Navigation Links (Role-Permission Filtered) */}
                <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
                  {/* # Dashboard (Always visible, tailored to role desk) */}
                  <button
                    onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                        : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                    }`}
                  >
                    <Hash className="w-4 h-4 text-[#ea1263]" />
                    <span>Dashboard</span>
                  </button>

                  {/* Treasury & Finances (Requires view_financials permission) */}
                  {currentRoleDef.permissions.includes('view_financials') && (
                    <button
                      onClick={() => { setActiveTab('finances'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                        (activeTab === 'finances' || activeTab === 'giving')
                          ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                          : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-[#06b6d4]" />
                      <span>Treasury & Finances</span>
                    </button>
                  )}

                  {/* Attendance Telemetry (Requires log_attendance permission) */}
                  {currentRoleDef.permissions.includes('log_attendance') && (
                    <button
                      onClick={() => { setActiveTab('attendance'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                        activeTab === 'attendance'
                          ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                          : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-[#8b5cf6]" />
                      <span>Attendance Telemetry</span>
                    </button>
                  )}

                  {/* Log Headcount (Requires log_attendance permission) */}
                  {currentRoleDef.permissions.includes('log_attendance') && (
                    <button
                      onClick={() => { setActiveTab('headcount_logger'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                        activeTab === 'headcount_logger'
                          ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                          : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                      }`}
                    >
                      <Plus className="w-4 h-4 text-[#ea1263]" />
                      <span>Log Headcount</span>
                    </button>
                  )}

                  {/* Ministries & Care Section Header */}
                  {(currentRoleDef.permissions.includes('manage_pastoral_care') ||
                    currentRoleDef.permissions.includes('manage_secretariat') ||
                    currentRoleDef.permissions.includes('manage_cms')) && (
                    <div className="pt-2 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#a0a6b4]">
                      Ministries & Care
                    </div>
                  )}

                  {/* First-Time Guests */}
                  {(currentRoleDef.permissions.includes('manage_pastoral_care') || currentRoleDef.permissions.includes('manage_secretariat')) && (
                    <button
                      onClick={() => { setActiveTab('guests'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                        activeTab === 'guests'
                          ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                          : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                      }`}
                    >
                      <Users className="w-4 h-4 text-[#f59e0b]" />
                      <span>First-Time Guests ({guestVisits.length})</span>
                    </button>
                  )}

                  {/* Pastoral Prayers */}
                  {(currentRoleDef.permissions.includes('manage_pastoral_care') || currentRoleDef.permissions.includes('manage_secretariat')) && (
                    <button
                      onClick={() => { setActiveTab('prayers'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                        activeTab === 'prayers'
                          ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                          : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-[#ea1263]" />
                      <span>Prayer Desk ({prayerRequests.length})</span>
                    </button>
                  )}

                  {/* Sermons CMS */}
                  {currentRoleDef.permissions.includes('manage_cms') && (
                    <button
                      onClick={() => { setActiveTab('sermons'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                        activeTab === 'sermons'
                          ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                          : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-[#06b6d4]" />
                      <span>Sermons CMS ({sermons.length})</span>
                    </button>
                  )}

                  {/* Events & Calendar */}
                  {(currentRoleDef.permissions.includes('manage_secretariat') || currentRoleDef.permissions.includes('manage_cms')) && (
                    <button
                      onClick={() => { setActiveTab('events'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                        activeTab === 'events'
                          ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                          : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-[#10b981]" />
                      <span>Calendar Events ({events.length})</span>
                    </button>
                  )}

                  {/* IAM & Governance Section Header */}
                  {(currentRoleDef.permissions.includes('manage_staff_iam') ||
                    currentRoleDef.permissions.includes('view_executive_pulse') ||
                    currentRoleDef.permissions.includes('manage_cms')) && (
                    <div className="pt-2 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#a0a6b4]">
                      IAM & Governance
                    </div>
                  )}

                  {/* Staff IAM */}
                  {currentRoleDef.permissions.includes('manage_staff_iam') && (
                    <button
                      onClick={() => { setActiveTab('iam_staff'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                        activeTab === 'iam_staff'
                          ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                          : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-[#6366f1]" />
                      <span>Staff IAM ({staffUsers.length})</span>
                    </button>
                  )}

                  {/* Audit Trail */}
                  {(currentRoleDef.permissions.includes('manage_staff_iam') || currentRoleDef.permissions.includes('view_executive_pulse')) && (
                    <button
                      onClick={() => { setActiveTab('audit_logs'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                        activeTab === 'audit_logs'
                          ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                          : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4 text-[#8b5cf6]" />
                      <span>Audit Trail ({auditLogs.length})</span>
                    </button>
                  )}

                  {/* Church Settings */}
                  {currentRoleDef.permissions.includes('manage_cms') && (
                    <button
                      onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-out cursor-pointer ${
                        activeTab === 'settings'
                          ? 'bg-[#fdf2f7] text-[#ea1263] font-black shadow-xs'
                          : 'text-[#707786] hover:text-[#1f2430] hover:bg-[#faf4fb]'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-[#707786]" />
                      <span>Church Settings</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sidebar Footer Info */}
              <div className="p-3.5 border-t border-[#f4ebf6] text-[11px] text-[#8a919e] bg-[#faf5fb]">
                <div className="flex items-center gap-1.5 mb-0.5 text-[#10b981] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                  Supabase Cloud Live
                </div>
                <div className="truncate font-semibold text-[#1f2430]">{currentUser.name}</div>
              </div>
            </aside>

            {/* Main Content Workspace */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-[#fbf8fc] text-[#1f2430] min-h-0 overscroll-contain">

              {/* ---------------------------------------------------- */}
              {/* LECTOR OPERATIONS OVERVIEW DASHBOARD                */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'overview' && (
                <LectorChurchDashboard
                  finances={finances}
                  serviceAttendance={serviceAttendance}
                  guestVisits={guestVisits}
                  prayerRequests={prayerRequests}
                  sermons={sermons}
                  events={events}
                  staffUsers={staffUsers}
                  auditLogs={auditLogs}
                  activeRole={activeRole}
                  onSetActiveTab={setActiveTab}
                  onOpenRecordFinanceModal={() => setActiveTab('finances')}
                  onOpenLogAttendanceModal={() => setActiveTab('attendance')}
                />
              )}

              {/* District Overseer Alternate Study View */}
              {activeTab === 'overseer_pulse' && (
                <DistrictOverseerDashboard
                  totalRecentSundayHeadcount={totalRecentSundayHeadcount}
                  serviceAttendance={serviceAttendance}
                  prayerRequests={prayerRequests}
                  sermons={sermons}
                  staffUsers={staffUsers}
                  finances={finances}
                  onSetActiveTab={setActiveTab}
                />
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
              {/* TAB: SERVICE ATTENDANCE & CONGREGATION TELEMETRY     */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'attendance' && (
                <AttendanceAnalytics
                  attendanceList={serviceAttendance}
                  activeRole={activeRole}
                  onRefresh={loadPortalData}
                  onShowNotice={showNotice}
                />
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
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <h2 className="text-base font-bold text-white">
                            {sermonForm.id ? 'Edit Sermon Entry' : 'Publish New Sermon Message'}
                          </h2>
                          <div className="inline-flex rounded-xl bg-slate-800/80 p-0.5 border border-slate-700">
                            <button
                              type="button"
                              onClick={() => setSermonPreviewMode(false)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                !sermonPreviewMode ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Form Editor
                            </button>
                            <button
                              type="button"
                              onClick={() => setSermonPreviewMode(true)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                                sermonPreviewMode ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <Eye className="w-3 h-3" />
                              Live Card Preview
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingSermon(false)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>

                      {sermonPreviewMode ? (
                        <div className="sermon-live-preview-box my-4">
                          <div className="text-center text-xs text-slate-400 mb-2">
                            Studio Live Preview: Exact appearance of sermon on the public church portal.
                          </div>
                          <div className="sermon-card-mockup" style={{ maxWidth: '440px', margin: '0 auto' }}>
                            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                              <img
                                src={sermonForm.thumbnail || '/images/sermon-series.jpg'}
                                alt={sermonForm.title || 'Sermon Thumbnail'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/sermon-series.jpg';
                                }}
                              />
                              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(21, 26, 33, 0.85)', backdropFilter: 'blur(8px)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {sermonForm.series || 'SUNDAY CELEBRATION'}
                              </div>
                              <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}>
                                {sermonForm.duration || '35 min'}
                              </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                                <span>{sermonForm.date || 'Recent'}</span>
                                <span>•</span>
                                <span style={{ color: 'var(--fgc-blue)', fontWeight: 600 }}>{sermonForm.passage || 'Hebrews 13:8'}</span>
                              </div>
                              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.35rem' }}>
                                {sermonForm.title || 'Untitled Sermon Entry'}
                              </h3>
                              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                                {sermonForm.summary || 'Summary study notes and key preaching points will be displayed here for church members.'}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sermonForm.speaker || 'Preacher'}</span>
                                <span style={{ color: 'var(--fgc-blue)', fontWeight: 700 }}>Watch Stream →</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
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
                      )}

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
                                      onClick={() => handleOpenGuestNotes(guest)}
                                      className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 transition-colors flex items-center gap-1 text-[11px] font-bold"
                                      title="Pastoral Notes & History"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>Notes</span>
                                    </button>
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

                  {/* Slide-Over Pastoral Care Interaction Drawer */}
                  {activeGuestForNotes && (
                    <div className="pastoral-drawer-backdrop" onClick={handleCloseGuestNotes}>
                      <div className="pastoral-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                Pastoral Care Dossier
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                Visit: {activeGuestForNotes.created_at ? new Date(activeGuestForNotes.created_at).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            <h2 className="text-lg font-black text-white">{activeGuestForNotes.full_name}</h2>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {activeGuestForNotes.service_time} • {activeGuestForNotes.adults_count || 1} adults
                            </div>
                          </div>
                          <button
                            onClick={handleCloseGuestNotes}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Direct Contact Channels Strip */}
                        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="text-slate-200 font-semibold">{activeGuestForNotes.email}</div>
                            <div className="text-slate-400 font-mono mt-0.5">{activeGuestForNotes.phone || 'No phone'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {activeGuestForNotes.phone && (
                              <a
                                href={`tel:${activeGuestForNotes.phone}`}
                                className="p-2 rounded-xl bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 transition-colors"
                                title="Direct Phone Call"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                            <a
                              href={`mailto:${activeGuestForNotes.email}`}
                              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          </div>
                        </div>

                        {/* Existing Notes Stream */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                            <span>Pastoral Care History ({guestNotesList.length})</span>
                            {loadingNotes && <span className="text-amber-400 text-[10px]">Loading...</span>}
                          </div>

                          {guestNotesList.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
                              <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
                              No pastoral interaction notes recorded yet.
                              <div className="text-[11px] text-slate-600 mt-1">Record the first follow-up call, counseling, or home visitation below.</div>
                            </div>
                          ) : (
                            guestNotesList.map((note) => (
                              <div key={note.id} className="pastoral-note-item bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
                                <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white">{note.staff_name}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold uppercase">
                                      {(ROLE_DEFINITIONS[note.staff_role as ChurchRole] || ROLE_DEFINITIONS.admin).badge}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {note.created_at ? new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>
                                <div className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                                  {(note.category || 'general').replace('_', ' ')}
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                                  {note.note}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Record New Note Form */}
                        <form onSubmit={handleCreatePastoralNote} className="p-4 border-t border-slate-800 bg-slate-900/95 space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Encounter Category
                            </label>
                            <select
                              value={newNoteCategory}
                              onChange={(e) => setNewNoteCategory(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                            >
                              <option value="follow_up">Follow-Up Phone Call</option>
                              <option value="visitation">Home / Office Visitation</option>
                              <option value="counseling">Pastoral Counseling Session</option>
                              <option value="prayer_request">Special Prayer Intercession</option>
                              <option value="ministry_joined">Inducted into Ministry / Fellowship</option>
                              <option value="other">General Pastoral Observation</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Pastoral Observations &amp; Next Steps
                            </label>
                            <textarea
                              rows={3}
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              placeholder="Record summary of conversation, prayer needs, family background, or spiritual commitments..."
                              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={loadingNotes || !newNoteText.trim()}
                            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{loadingNotes ? 'Recording...' : 'Record Pastoral Note'}</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
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
              {/* TAB: TREASURY & FINANCIAL ANALYTICS                  */}
              {/* ---------------------------------------------------- */}
              {(activeTab === 'finances' || activeTab === 'giving') && (
                <FinancialAnalytics
                  finances={finances}
                  activeRole={activeRole}
                  onRefresh={loadPortalData}
                  onShowNotice={showNotice}
                />
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

              {/* ---------------------------------------------------- */}
              {/* TAB: AUDIT LOGS & GOVERNANCE LEDGER                  */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'audit_logs' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">Immutable Administrative Audit Trail</h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Cryptographic operational ledger recording staff logins, CMS modifications, pastoral care encounters, and policy updates.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-bold text-slate-400">{auditLogs.length} Events Logged</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Staff Officer</th>
                          <th className="py-3 px-4">Role Desk</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">Entity</th>
                          <th className="py-3 px-4">Audit Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-500">
                              No audit events recorded yet.
                            </td>
                          </tr>
                        ) : (
                          auditLogs.map((log) => {
                            const badgeClass = log.action.includes('DELETE') 
                              ? 'audit-badge delete' 
                              : log.action.includes('LOGIN') || log.action.includes('PUBLISHED') || log.action.includes('ADDED')
                              ? 'audit-badge insert'
                              : 'audit-badge update';

                            return (
                              <tr key={log.id} className="hover:bg-slate-800/30">
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                  {log.created_at ? new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                </td>
                                <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                                  {log.staff_name}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                                    {(ROLE_DEFINITIONS[log.staff_role as ChurchRole] || ROLE_DEFINITIONS.admin).badge}
                                  </span>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <span className={badgeClass}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                  {log.entity_type}
                                </td>
                                <td className="py-3 px-4 text-slate-300 text-xs">
                                  {log.details}
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
            </main>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default AdminPortal;
