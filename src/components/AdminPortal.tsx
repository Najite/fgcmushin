import React, { useState, useEffect } from 'react';
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
  RefreshCw,
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
  ChevronRight,
  LogOut
} from 'lucide-react';
import type { Sermon, ChurchEvent } from '../types';
import type { ChurchSettingsRow, GuestVisitRow, PrayerRequestRow, GivingRecordRow } from '../types/database';
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
  updateGuestVisitStatus
} from '../lib/supabase';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  sermons: Sermon[];
  events: ChurchEvent[];
  churchSettings: ChurchSettingsRow | null;
  onDataRefresh: () => void;
}

type TabType = 'overview' | 'sermons' | 'events' | 'guests' | 'prayers' | 'giving' | 'settings';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  sermons,
  events,
  churchSettings,
  onDataRefresh
}) => {
  // Authentication with sessionStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('fgc_staff_auth') === 'true';
    }
    return false;
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab & Mobile Sidebar State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Loading & Notification Notice
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Live Submissions Data
  const [guestVisits, setGuestVisits] = useState<GuestVisitRow[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequestRow[]>([]);
  const [givingRecords, setGivingRecords] = useState<GivingRecordRow[]>([]);

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
    category: 'Worship' | 'Community' | 'Outreach';
    description: string;
  }>({
    title: '',
    date: 'Sunday, Nov 29, 2026',
    time: '9:30 AM',
    location: 'District Headquarters, Idi-Oro',
    category: 'Community',
    description: ''
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    announcementText: churchSettings?.announcement_text || 'Welcome to FGC Mushin DHQ • Sunday Celebration Services at 7:30 AM & 9:30 AM',
    announcementActive: churchSettings?.announcement_active ?? true,
    phone: churchSettings?.phone || '+234 1 234 5678',
    email: churchSettings?.email || 'info@fgcmushin.org',
    address: churchSettings?.address || '4, Obarinmola Adedoyin Street, Mushin, Idi Oro, Lagos, Nigeria'
  });

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

  // Load Submissions
  const loadSubmissions = async () => {
    setLoading(true);
    const [guests, prayers, giving] = await Promise.all([
      getGuestVisits(),
      getPrayerRequests(),
      getGivingRecords()
    ]);
    setGuestVisits(guests);
    setPrayerRequests(prayers);
    setGivingRecords(giving);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadSubmissions();
    }
  }, [isAuthenticated, isOpen]);

  if (!isOpen) return null;

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkeyInput === 'fgcmushin2026' || passkeyInput === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('fgc_staff_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect church administration passkey. Please check with the Secretariat.');
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('fgc_staff_auth');
  };

  // --- Sermon Handlers ---
  const handleOpenAddSermon = () => {
    setSermonForm({
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
    setIsEditingSermon(true);
  };

  const handleEditSermon = (s: Sermon) => {
    setSermonForm({
      id: s.id,
      title: s.title,
      series: s.series,
      speaker: s.speaker,
      date: s.date,
      duration: s.duration,
      passage: s.passage,
      thumbnail: s.thumbnail,
      summary: s.summary,
      videoUrl: s.videoUrl || '',
      isFeatured: false
    });
    setIsEditingSermon(true);
  };

  const handleSaveSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sermonForm.title || !sermonForm.speaker) return;
    setLoading(true);

    const res = await saveSermon({
      id: sermonForm.id,
      title: sermonForm.title,
      series: sermonForm.series,
      speaker: sermonForm.speaker,
      date: sermonForm.date,
      duration: sermonForm.duration,
      passage: sermonForm.passage,
      thumbnail: sermonForm.thumbnail,
      summary: sermonForm.summary,
      video_url: sermonForm.videoUrl || null,
      is_featured: sermonForm.isFeatured
    });

    setLoading(false);
    if (res.success) {
      showNotice('Sermon successfully published to congregation!');
      setIsEditingSermon(false);
      onDataRefresh();
    } else {
      showNotice(`Error saving sermon: ${res.error}`, 'error');
    }
  };

  const handleDeleteSermon = async (id: string, title: string) => {
    if (!window.confirm(`Delete sermon "${title}" from public archive?`)) return;
    setLoading(true);
    const res = await deleteSermon(id);
    setLoading(false);
    if (res.success) {
      showNotice('Sermon removed.');
      onDataRefresh();
    } else {
      showNotice(`Failed to delete sermon: ${res.error}`, 'error');
    }
  };

  // --- Event Handlers ---
  const handleOpenAddEvent = () => {
    setEventForm({
      title: '',
      date: 'Sunday, Nov 29, 2026',
      time: '9:30 AM',
      location: 'District Headquarters, Idi-Oro',
      category: 'Community',
      description: ''
    });
    setIsEditingEvent(true);
  };

  const handleEditEvent = (evt: ChurchEvent) => {
    setEventForm({
      id: evt.id,
      title: evt.title,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      category: evt.category as 'Worship' | 'Community' | 'Outreach',
      description: evt.description
    });
    setIsEditingEvent(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) return;
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
      showNotice('Event successfully updated on calendar!');
      setIsEditingEvent(false);
      onDataRefresh();
    } else {
      showNotice(`Error saving event: ${res.error}`, 'error');
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Remove event "${title}" from calendar?`)) return;
    setLoading(true);
    const res = await deleteEvent(id);
    setLoading(false);
    if (res.success) {
      showNotice('Event removed.');
      onDataRefresh();
    } else {
      showNotice(`Failed to delete event: ${res.error}`, 'error');
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
      showNotice(`Prayer marked as ${status}`);
    } else {
      showNotice(`Could not update prayer: ${res.error}`, 'error');
    }
  };

  // Quick Action Utilities
  const getWhatsAppLink = (phone: string | null, name: string) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Peace be with you ${name}! This is the pastoral care team from Foursquare Gospel Church Mushin District Headquarters. We are so honored you connected with us!`);
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div
      className="admin-dashboard-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#F8FAFC',
        color: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Top 4-Color Church Emblem Accent Strip */}
      <div style={{ height: '3.5px', background: 'var(--fgc-gradient-4color)', width: '100%', flexShrink: 0, zIndex: 60 }} />

      {/* Notice Toast */}
      {notice && (
        <div
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.5rem',
            zIndex: 10000,
            padding: '0.85rem 1.4rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            background: notice.type === 'success' ? '#065F46' : '#991B1B',
            color: '#FFFFFF',
            boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notice.message}</span>
        </div>
      )}

      {/* LOGIN VIEW (Clean centered card if not authenticated) */}
      {!isAuthenticated ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1rem' }}>
              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
                title="Return to website"
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'var(--fgc-blue-subtle)',
                border: '1px solid var(--fgc-blue-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: 'var(--fgc-blue)'
              }}
            >
              <Shield size={32} />
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--fgc-blue)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              FGC Mushin District Headquarters
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Staff Operations Portal
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              Authorized pastoral and secretariat team access. Enter your administrative passkey to manage content and church records.
            </p>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="Enter staff passkey"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    borderRadius: '12px',
                    border: authError ? '1px solid #DC2626' : '1px solid var(--border-medium)',
                    background: '#FAF8F5',
                    fontSize: '1rem',
                    outline: 'none',
                    textAlign: 'center',
                    fontWeight: 600,
                    letterSpacing: '0.08em'
                  }}
                  autoFocus
                />
              </div>

              {authError && (
                <div style={{ color: '#DC2626', fontSize: '0.825rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={14} />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-island btn-teal"
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem', marginTop: '0.25rem' }}
              >
                <span>Authorize & Open Workspace</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                ← Return to Public Church Website
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED FULL DASHBOARD WORKSPACE */
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          
          {/* 1. LEFT SIDEBAR (Desktop Fixed, Mobile Slide-Over) */}
          <aside
            className={`admin-sidebar ${mobileSidebarOpen ? 'is-mobile-open' : ''}`}
            style={{
              width: '280px',
              background: '#0F172A',
              color: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              zIndex: 50,
              transition: 'transform 0.3s var(--ease-spring)'
            }}
          >
            {/* Church Identity Header in Sidebar */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  <img src="/logo.png" alt="Church Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    FGC MUSHIN DHQ
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Staff Operations Suite
                  </div>
                </div>
              </div>

              {/* Close button for mobile drawer */}
              <button
                className="admin-mobile-close-btn"
                onClick={() => setMobileSidebarOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  padding: '4px',
                  display: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Cloud Sync Status Beacon */}
            <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
                <span>Supabase Live Cloud</span>
              </div>
              <button
                onClick={() => { onDataRefresh(); loadSubmissions(); }}
                title="Sync database now"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38BDF8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>
            </div>

            {/* Sidebar Navigation Items */}
            <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748B', padding: '0.5rem 0.75rem' }}>
                Core Workspace
              </div>

              {[
                { id: 'overview', label: 'Dashboard Pulse', icon: BarChart3, count: null },
                { id: 'sermons', label: 'Sermons & Teaching', icon: BookOpen, count: sermons.length },
                { id: 'events', label: 'Calendar & Gatherings', icon: Calendar, count: events.length },
                { id: 'guests', label: 'First-Time Guests', icon: Users, count: guestVisits.length, highlight: guestVisits.filter(g => g.status !== 'welcomed').length > 0 },
                { id: 'prayers', label: 'Prayer & Pastoral Care', icon: Heart, count: prayerRequests.length, highlight: prayerRequests.filter(p => p.status !== 'prayed').length > 0 },
                { id: 'giving', label: 'Giving Ledger', icon: DollarSign, count: givingRecords.length },
                { id: 'settings', label: 'Announcements & Info', icon: Settings, count: null }
              ].map(item => {
                const isActive = activeTab === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabType);
                      setIsEditingSermon(false);
                      setIsEditingEvent(false);
                      setMobileSidebarOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '10px',
                      background: isActive ? '#1E293B' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      borderLeft: isActive ? '3px solid var(--accent-teal)' : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <IconComponent size={18} color={isActive ? 'var(--accent-teal)' : '#64748B'} />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== null && (
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: item.highlight ? '#DC2626' : (isActive ? '#334155' : 'rgba(255,255,255,0.06)'),
                          color: '#FFFFFF'
                        }}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Bottom Footer (Sign Out & Public View) */}
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#E2E8F0',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <ArrowLeft size={16} />
                <span>Return to Website</span>
              </button>

              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: '#94A3B8',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <LogOut size={14} />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          </aside>

          {/* Mobile backdrop for sidebar drawer */}
          {mobileSidebarOpen && (
            <div
              className="admin-mobile-backdrop"
              onClick={() => setMobileSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 45
              }}
            />
          )}

          {/* 2. MAIN CONTENT AREA */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFC' }}>
            
            {/* Top Workspace Bar */}
            <header
              style={{
                height: '64px',
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                padding: '0 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  className="admin-mobile-menu-trigger"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open portal navigation"
                  style={{
                    display: 'none',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Menu size={18} />
                </button>

                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'capitalize' }}>
                    {activeTab === 'overview' && 'Operations Dashboard Pulse'}
                    {activeTab === 'sermons' && 'Sermons & Congregation Teaching'}
                    {activeTab === 'events' && 'Church Calendar & Special Gatherings'}
                    {activeTab === 'guests' && 'First-Time Guest Connections'}
                    {activeTab === 'prayers' && 'Pastoral Prayer & Care Ministry'}
                    {activeTab === 'giving' && 'Generosity & Stewardship Ledger'}
                    {activeTab === 'settings' && 'Church Announcements & Public Contact'}
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={onClose}
                  className="btn-island btn-ghost"
                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
                >
                  <span>Close Workspace</span>
                  <X size={15} />
                </button>
              </div>
            </header>

            {/* Scrollable Tab Content Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(1rem, 3vw, 2rem)' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* TAB 0: DASHBOARD PULSE / OVERVIEW */}
                {activeTab === 'overview' && (
                  <div>
                    {/* At-a-Glance KPI Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                      
                      {/* Card 1: Guests */}
                      <div
                        onClick={() => setActiveTab('guests')}
                        style={{
                          background: '#FFFFFF',
                          padding: '1.5rem',
                          borderRadius: '16px',
                          border: '1px solid #E2E8F0',
                          borderTop: '3px solid var(--fgc-blue)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>First-Time Guests</span>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--fgc-blue-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fgc-blue)' }}>
                            <Users size={18} />
                          </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>
                          {guestVisits.length}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#059669', fontWeight: 600, marginTop: '0.35rem' }}>
                          {guestVisits.filter(g => g.status === 'welcomed').length} Welcomed • {guestVisits.filter(g => g.status !== 'welcomed').length} Pending
                        </div>
                      </div>

                      {/* Card 2: Prayers */}
                      <div
                        onClick={() => setActiveTab('prayers')}
                        style={{
                          background: '#FFFFFF',
                          padding: '1.5rem',
                          borderRadius: '16px',
                          border: '1px solid #E2E8F0',
                          borderTop: '3px solid var(--fgc-red)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Prayer Requests</span>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--fgc-red-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fgc-red)' }}>
                            <Heart size={18} />
                          </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>
                          {prayerRequests.length}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#D97706', fontWeight: 600, marginTop: '0.35rem' }}>
                          {prayerRequests.filter(p => p.status !== 'prayed').length} Intercessions Active
                        </div>
                      </div>

                      {/* Card 3: Events */}
                      <div
                        onClick={() => setActiveTab('events')}
                        style={{
                          background: '#FFFFFF',
                          padding: '1.5rem',
                          borderRadius: '16px',
                          border: '1px solid #E2E8F0',
                          borderTop: '3px solid var(--fgc-purple)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Upcoming Events</span>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--fgc-purple-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fgc-purple)' }}>
                            <Calendar size={18} />
                          </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>
                          {events.length}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#64748B', fontWeight: 600, marginTop: '0.35rem' }}>
                          Next: {events[0]?.title || 'Sunday Gathering'}
                        </div>
                      </div>

                      {/* Card 4: Sermons */}
                      <div
                        onClick={() => setActiveTab('sermons')}
                        style={{
                          background: '#FFFFFF',
                          padding: '1.5rem',
                          borderRadius: '16px',
                          border: '1px solid #E2E8F0',
                          borderTop: '3px solid var(--fgc-gold)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Published Sermons</span>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--fgc-gold-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fgc-gold-dark)' }}>
                            <BookOpen size={18} />
                          </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>
                          {sermons.length}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#64748B', fontWeight: 600, marginTop: '0.35rem' }}>
                          Latest: {sermons[0]?.title || 'Sunday Message'}
                        </div>
                      </div>
                    </div>

                    {/* Dual Action & Summary Columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                      
                      {/* Recent Guests Widget */}
                      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={18} color="var(--fgc-blue)" />
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>Recent Guest Registrations</h4>
                          </div>
                          <button
                            onClick={() => setActiveTab('guests')}
                            style={{ background: 'none', border: 'none', color: 'var(--fgc-blue)', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            View All →
                          </button>
                        </div>

                        {guestVisits.length === 0 ? (
                          <p style={{ color: '#94A3B8', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No guest registrations yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {guestVisits.slice(0, 3).map(g => (
                              <div key={g.id} style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>{g.full_name}</div>
                                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>Service: {g.service_time} • {g.phone || g.email}</div>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', background: g.status === 'welcomed' ? '#DCFCE7' : '#FEF3C7', color: g.status === 'welcomed' ? '#166534' : '#92400E' }}>
                                  {g.status === 'welcomed' ? 'Welcomed' : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recent Prayer Requests Widget */}
                      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Heart size={18} color="var(--fgc-red)" />
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>Recent Prayer Needs</h4>
                          </div>
                          <button
                            onClick={() => setActiveTab('prayers')}
                            style={{ background: 'none', border: 'none', color: 'var(--fgc-red)', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            View All →
                          </button>
                        </div>

                        {prayerRequests.length === 0 ? (
                          <p style={{ color: '#94A3B8', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No prayer requests yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {prayerRequests.slice(0, 3).map(p => (
                              <div key={p.id} style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{p.full_name}</div>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: p.is_confidential ? '#FEE2E2' : '#E0E7FF', color: p.is_confidential ? '#991B1B' : '#3730A3' }}>
                                    {p.is_confidential ? 'CONFIDENTIAL' : 'PUBLIC'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.825rem', color: '#475569', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  "{p.request}"
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 1: SERMONS */}
                {activeTab === 'sermons' && (
                  <div>
                    {!isEditingSermon ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                              Published Sermons & Media ({sermons.length})
                            </h3>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#64748B' }}>
                              Add sermon titles, series, scripture passages, and YouTube embed links
                            </p>
                          </div>
                          <button
                            onClick={handleOpenAddSermon}
                            className="btn-island btn-teal"
                            style={{ padding: '0.75rem 1.4rem', fontSize: '0.9rem' }}
                          >
                            <Plus size={16} />
                            <span>Add New Sermon</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {sermons.map((sermon) => (
                            <div
                              key={sermon.id}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '14px',
                                padding: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: 0 }}>
                                <img
                                  src={sermon.thumbnail}
                                  alt={sermon.title}
                                  style={{
                                    width: '100px',
                                    height: '65px',
                                    borderRadius: '10px',
                                    objectFit: 'cover',
                                    flexShrink: 0
                                  }}
                                />
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <span className="eyebrow-pill gold" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                                      {sermon.series}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                                      {sermon.passage}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                                    {sermon.title}
                                  </div>
                                  <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '0.2rem' }}>
                                    {sermon.speaker} • {sermon.date} • {sermon.duration}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleEditSermon(sermon)}
                                  className="btn-island btn-ghost"
                                  style={{ padding: '0.55rem 0.95rem', fontSize: '0.825rem' }}
                                >
                                  <Edit3 size={14} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteSermon(sermon.id, sermon.title)}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#DC2626',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete sermon"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* SERMON FORM WITH PINNED SAVE BAR */
                      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                            {sermonForm.id ? 'Edit Sermon Details' : 'Publish New Sermon to Website'}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setIsEditingSermon(false)}
                            className="btn-island btn-ghost"
                            style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
                          >
                            Cancel
                          </button>
                        </div>

                        <form onSubmit={handleSaveSermon} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Sermon Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={sermonForm.title}
                                onChange={(e) => setSermonForm({ ...sermonForm, title: e.target.value })}
                                placeholder="e.g. Hope In The Storm"
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Preacher / Speaker *
                              </label>
                              <input
                                type="text"
                                required
                                value={sermonForm.speaker}
                                onChange={(e) => setSermonForm({ ...sermonForm, speaker: e.target.value })}
                                placeholder="e.g. Lead Pastor Marcus Vance"
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Sermon Series
                              </label>
                              <input
                                type="text"
                                value={sermonForm.series}
                                onChange={(e) => setSermonForm({ ...sermonForm, series: e.target.value })}
                                placeholder="e.g. UNSHAKABLE or KINGDOM HEARTS"
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Scripture Reference
                              </label>
                              <input
                                type="text"
                                value={sermonForm.passage}
                                onChange={(e) => setSermonForm({ ...sermonForm, passage: e.target.value })}
                                placeholder="e.g. Hebrews 6:19–20"
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Date Preached
                              </label>
                              <input
                                type="text"
                                value={sermonForm.date}
                                onChange={(e) => setSermonForm({ ...sermonForm, date: e.target.value })}
                                placeholder="e.g. Oct 25, 2026"
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                YouTube Video URL or Embed ID
                              </label>
                              <input
                                type="text"
                                value={sermonForm.videoUrl}
                                onChange={(e) => setSermonForm({ ...sermonForm, videoUrl: e.target.value })}
                                placeholder="e.g. https://youtube.com/watch?v=..."
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                              Sermon Summary / Key Takeaways
                            </label>
                            <textarea
                              rows={4}
                              value={sermonForm.summary}
                              onChange={(e) => setSermonForm({ ...sermonForm, summary: e.target.value })}
                              placeholder="Summary of this message for seekers and online listeners..."
                              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                            />
                          </div>

                          {/* Pinned Action Buttons */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
                            <button
                              type="button"
                              onClick={() => setIsEditingSermon(false)}
                              className="btn-island btn-ghost"
                              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="btn-island btn-teal"
                              style={{ padding: '0.75rem 1.85rem', fontSize: '0.9rem' }}
                            >
                              <Check size={16} />
                              <span>{loading ? 'Saving to Database...' : 'Save & Publish Sermon'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: EVENTS */}
                {activeTab === 'events' && (
                  <div>
                    {!isEditingEvent ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                              Church Calendar & Gatherings ({events.length})
                            </h3>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#64748B' }}>
                              Manage vigils, special services, youth rallies, and community outreaches
                            </p>
                          </div>
                          <button
                            onClick={handleOpenAddEvent}
                            className="btn-island btn-teal"
                            style={{ padding: '0.75rem 1.4rem', fontSize: '0.9rem' }}
                          >
                            <Plus size={16} />
                            <span>Add New Event</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {events.map((evt) => (
                            <div
                              key={evt.id}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '14px',
                                padding: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                              }}
                            >
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                  <span className={`eyebrow-pill ${evt.category.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}>
                                    {evt.category}
                                  </span>
                                  <span style={{ fontSize: '0.825rem', color: 'var(--fgc-blue)', fontWeight: 700 }}>
                                    {evt.date} • {evt.time}
                                  </span>
                                </div>
                                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                                  {evt.title}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                                  <MapPin size={13} color="var(--accent-teal)" />
                                  <span>{evt.location}</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleEditEvent(evt)}
                                  className="btn-island btn-ghost"
                                  style={{ padding: '0.55rem 0.95rem', fontSize: '0.825rem' }}
                                >
                                  <Edit3 size={14} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(evt.id, evt.title)}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#DC2626',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete event"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* EVENT FORM WITH PINNED SAVE BAR */
                      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                            {eventForm.id ? 'Edit Event Schedule' : 'Schedule New Church Event'}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setIsEditingEvent(false)}
                            className="btn-island btn-ghost"
                            style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
                          >
                            Cancel
                          </button>
                        </div>

                        <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Event Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={eventForm.title}
                                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                placeholder="e.g. All-Church Faith Night & Worship"
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Category
                              </label>
                              <select
                                value={eventForm.category}
                                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as 'Worship' | 'Community' | 'Outreach' })}
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              >
                                <option value="Worship">Worship</option>
                                <option value="Community">Community</option>
                                <option value="Outreach">Outreach</option>
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Date String *
                              </label>
                              <input
                                type="text"
                                required
                                value={eventForm.date}
                                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                placeholder="e.g. Wednesday, Nov 4, 2026"
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Time Range *
                              </label>
                              <input
                                type="text"
                                required
                                value={eventForm.time}
                                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                                placeholder="e.g. 6:00 PM – 8:00 PM"
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Venue / Location
                              </label>
                              <input
                                type="text"
                                value={eventForm.location}
                                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                placeholder="e.g. District Headquarters, Idi-Oro"
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                              Event Details & Description
                            </label>
                            <textarea
                              rows={3}
                              value={eventForm.description}
                              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                              placeholder="Details for congregation and visitors..."
                              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
                            <button
                              type="button"
                              onClick={() => setIsEditingEvent(false)}
                              className="btn-island btn-ghost"
                              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="btn-island btn-teal"
                              style={{ padding: '0.75rem 1.85rem', fontSize: '0.9rem' }}
                            >
                              <Check size={16} />
                              <span>{loading ? 'Saving...' : 'Save & Publish Event'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: FIRST-TIME GUESTS WITH DIRECT PASTORAL ACTIONS */}
                {activeTab === 'guests' && (
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        First-Time Guest RSVPs ({guestVisits.length})
                      </h3>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#64748B' }}>
                        Congregation seekers who registered via "Plan Your Sunday Visit". Connect with them immediately using 1-click pastoral actions.
                      </p>
                    </div>

                    {guestVisits.length === 0 ? (
                      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '4rem 1.5rem', textAlign: 'center' }}>
                        <Users size={36} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>No Guest Registrations Yet</h4>
                        <p style={{ color: '#64748B', fontSize: '0.875rem', maxWidth: '380px', margin: '0.5rem auto 0' }}>
                          When visitors fill out the "Plan Your Sunday Visit" form on the website, their details appear here in real time.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {guestVisits.map((guest) => {
                          const isWelcomed = guest.status === 'welcomed';
                          const waLink = getWhatsAppLink(guest.phone, guest.full_name);
                          return (
                            <div
                              key={guest.id}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderLeft: isWelcomed ? '4px solid #10B981' : '4px solid #F59E0B',
                                borderRadius: '14px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1.25rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                    {guest.full_name}
                                  </h4>
                                  <span
                                    style={{
                                      fontSize: '0.725rem',
                                      fontWeight: 800,
                                      padding: '0.2rem 0.6rem',
                                      borderRadius: '9999px',
                                      background: isWelcomed ? '#DCFCE7' : '#FEF3C7',
                                      color: isWelcomed ? '#166534' : '#92400E',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem'
                                    }}
                                  >
                                    {isWelcomed ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                    <span>{isWelcomed ? 'Welcomed & Followed Up' : 'Pending Follow-up'}</span>
                                  </span>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.4rem' }}>
                                  <span>Service Time: <strong style={{ color: '#0F172A' }}>{guest.service_time}</strong></span>
                                  <span>Family Party: <strong style={{ color: '#0F172A' }}>{guest.adults_count ?? 1} Adults, {guest.kids_count ?? 0} Kids</strong></span>
                                  <span>Date: {guest.created_at ? new Date(guest.created_at).toLocaleDateString() : 'Recent'}</span>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.5rem' }}>
                                  {guest.phone && <span>Phone: <strong>{guest.phone}</strong></span>}
                                  {guest.email && <span>Email: <strong>{guest.email}</strong></span>}
                                </div>
                              </div>

                              {/* Direct Pastoral Action Buttons */}
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
                                {waLink && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      padding: '0.55rem 1rem',
                                      borderRadius: '10px',
                                      background: '#25D366',
                                      color: '#FFFFFF',
                                      fontSize: '0.825rem',
                                      fontWeight: 700,
                                      textDecoration: 'none'
                                    }}
                                    title="Open WhatsApp chat with prefilled pastoral greeting"
                                  >
                                    <MessageCircle size={15} />
                                    <span>WhatsApp</span>
                                  </a>
                                )}

                                {guest.phone && (
                                  <a
                                    href={`tel:${guest.phone}`}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      padding: '0.55rem 0.9rem',
                                      borderRadius: '10px',
                                      background: '#F1F5F9',
                                      border: '1px solid #CBD5E1',
                                      color: '#334155',
                                      fontSize: '0.825rem',
                                      fontWeight: 700,
                                      textDecoration: 'none'
                                    }}
                                    title="Direct call"
                                  >
                                    <Phone size={14} />
                                    <span>Call</span>
                                  </a>
                                )}

                                {guest.email && (
                                  <a
                                    href={`mailto:${guest.email}?subject=${encodeURIComponent('Welcome to FGC Mushin District Headquarters!')}`}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      padding: '0.55rem 0.9rem',
                                      borderRadius: '10px',
                                      background: '#F1F5F9',
                                      border: '1px solid #CBD5E1',
                                      color: '#334155',
                                      fontSize: '0.825rem',
                                      fontWeight: 700,
                                      textDecoration: 'none'
                                    }}
                                    title="Send welcome email"
                                  >
                                    <Mail size={14} />
                                    <span>Email</span>
                                  </a>
                                )}

                                <button
                                  onClick={() => handleUpdateGuest(guest.id, isWelcomed ? 'pending' : 'welcomed')}
                                  style={{
                                    padding: '0.55rem 1rem',
                                    borderRadius: '10px',
                                    border: isWelcomed ? '1px solid #CBD5E1' : '1px solid #059669',
                                    background: isWelcomed ? '#FFFFFF' : '#059669',
                                    color: isWelcomed ? '#475569' : '#FFFFFF',
                                    fontSize: '0.825rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isWelcomed ? 'Mark as Pending' : '✓ Mark Welcomed'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: PRAYER REQUESTS */}
                {activeTab === 'prayers' && (
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Pastoral Prayer & Intercession Ministry ({prayerRequests.length})
                      </h3>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#64748B' }}>
                        Requests submitted by members, families, and seekers for weekly pastoral intercession.
                      </p>
                    </div>

                    {prayerRequests.length === 0 ? (
                      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '4rem 1.5rem', textAlign: 'center' }}>
                        <Heart size={36} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>No Prayer Requests Submitted Yet</h4>
                        <p style={{ color: '#64748B', fontSize: '0.875rem', maxWidth: '380px', margin: '0.5rem auto 0' }}>
                          Prayer petitions submitted through the Prayer & Care modal appear here securely.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {prayerRequests.map((prayer) => {
                          const isPrayed = prayer.status === 'prayed';
                          return (
                            <div
                              key={prayer.id}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderLeft: prayer.is_confidential ? '4px solid var(--fgc-red)' : '4px solid var(--fgc-blue)',
                                borderRadius: '14px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.85rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div>
                                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                                    {prayer.full_name}
                                  </div>
                                  <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
                                    {prayer.email || 'No email provided'} • {prayer.created_at ? new Date(prayer.created_at).toLocaleDateString() : 'Recent'}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  {prayer.is_confidential && (
                                    <span style={{ fontSize: '0.725rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#FEE2E2', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                      <Lock size={12} />
                                      <span>CONFIDENTIAL (PASTORAL ONLY)</span>
                                    </span>
                                  )}

                                  <button
                                    onClick={() => handleUpdatePrayer(prayer.id, isPrayed ? 'pending' : 'prayed')}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      borderRadius: '8px',
                                      border: isPrayed ? '1px solid #CBD5E1' : '1px solid var(--accent-gold)',
                                      background: isPrayed ? '#FFFFFF' : 'var(--accent-gold)',
                                      color: isPrayed ? '#475569' : '#FFFFFF',
                                      fontSize: '0.825rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {isPrayed ? 'Re-open Prayer' : '✓ Mark Prayed Over'}
                                  </button>
                                </div>
                              </div>

                              {/* Prayer Request Body */}
                              <div
                                style={{
                                  background: '#F8FAFC',
                                  padding: '1.15rem 1.25rem',
                                  borderRadius: '10px',
                                  borderLeft: '3px solid #CBD5E1',
                                  fontSize: '0.95rem',
                                  color: '#334155',
                                  lineHeight: 1.6
                                }}
                              >
                                "{prayer.request}"
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: GIVING & TITHE LEDGER */}
                {activeTab === 'giving' && (
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Stewardship & Giving Records ({givingRecords.length})
                      </h3>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#64748B' }}>
                        Direct digital offerings, tithes, building pledges, and welfare seed gifts.
                      </p>
                    </div>

                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: 'var(--fgc-gold-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 1.25rem',
                          color: 'var(--fgc-gold-dark)'
                        }}
                      >
                        <DollarSign size={28} />
                      </div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Church Bank Accounts & Tithes Active
                      </h4>
                      <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '440px', margin: '0.5rem auto 1.5rem', lineHeight: 1.6 }}>
                        Congregation members currently sow via official bank transfers displayed on the Giving drawer. Integrated automated Paystack records will populate here in real time.
                      </p>
                      <div style={{ display: 'inline-flex', padding: '0.75rem 1.25rem', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                        Official Account: Access Bank • 0123456789 • FGC Mushin DHQ
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: SETTINGS WITH PINNED SAVE BAR */}
                {activeTab === 'settings' && (
                  <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    <div style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Live Announcement Banner & Contact Details
                      </h3>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#64748B' }}>
                        Modify the announcement ribbon text and church contact details displayed across the website.
                      </p>
                    </div>

                    <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                            Top Announcement Message
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.825rem', color: '#64748B', fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={settingsForm.announcementActive}
                              onChange={(e) => setSettingsForm({ ...settingsForm, announcementActive: e.target.checked })}
                              style={{ accentColor: 'var(--accent-teal)' }}
                            />
                            <span>Banner Active & Visible on Website</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={settingsForm.announcementText}
                          onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                          placeholder="e.g. Welcome to FGC Mushin DHQ • Sunday Services at 7:30 AM & 9:30 AM"
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                        />

                        {/* Live Banner Preview */}
                        <div style={{ marginTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Preview on Public Website:</span>
                          <div style={{ marginTop: '0.35rem', padding: '0.65rem 1rem', borderRadius: '8px', background: 'linear-gradient(90deg, #1E4E85 0%, #2866AD 50%, #A32371 100%)', color: '#FFFFFF', fontSize: '0.825rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={14} style={{ color: '#F3A645' }} />
                            <span>{settingsForm.announcementText || 'Banner text here...'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                            Secretariat Phone Number
                          </label>
                          <input
                            type="text"
                            value={settingsForm.phone}
                            onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                            placeholder="+234 1 234 5678"
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                            Official Email Address
                          </label>
                          <input
                            type="email"
                            value={settingsForm.email}
                            onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                            placeholder="info@fgcmushin.org"
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                          District Headquarters Physical Address
                        </label>
                        <input
                          type="text"
                          value={settingsForm.address}
                          onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                          placeholder="4, Obarinmola Adedoyin Street, Mushin, Idi Oro, Lagos, Nigeria"
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.95rem' }}
                        />
                      </div>

                      {/* Sticky Save Bar — Never sliced off */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', marginTop: '1rem' }}>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-island btn-teal"
                          style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}
                        >
                          <Check size={16} />
                          <span>{loading ? 'Saving Settings...' : 'Save & Publish Live Settings'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Responsive Styles for the Dashboard */}
      <style>{`
        @media (max-width: 860px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            width: 280px !important;
            transform: translateX(-100%);
            z-index: 60 !important;
          }
          .admin-sidebar.is-mobile-open {
            transform: translateX(0) !important;
          }
          .admin-mobile-close-btn {
            display: block !important;
          }
          .admin-mobile-menu-trigger {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
};
