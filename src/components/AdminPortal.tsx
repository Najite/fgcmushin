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
  AlertCircle
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

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  sermons,
  events,
  churchSettings,
  onDataRefresh
}) => {
  // Passkey authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  type TabType = 'sermons' | 'events' | 'guests' | 'prayers' | 'giving' | 'settings';
  const [activeTab, setActiveTab] = useState<TabType>('sermons');

  // Loading & notification states
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Submissions Data
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
    series: '',
    speaker: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    duration: '35 min',
    passage: '',
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
    date: '',
    time: '6:00 PM',
    location: 'District Headquarters, Idi-Oro',
    category: 'Community',
    description: ''
  });

  // Announcement & Church Settings Form
  const [settingsForm, setSettingsForm] = useState({
    announcementText: churchSettings?.announcement_text || 'Welcome to FGC Mushin DHQ • Sunday Celebration Services at 7:30 AM & 9:30 AM',
    announcementActive: churchSettings?.announcement_active ?? true,
    phone: churchSettings?.phone || '+234 1 234 5678',
    email: churchSettings?.email || 'info@fgcmushin.org',
    address: churchSettings?.address || '4, Obarinmola Adedoyin Street, Mushin, Idi Oro, Lagos, Nigeria'
  });

  // Sync settings when prop updates
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

  // Load submissions when tab opens
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
  }, [isAuthenticated, isOpen, activeTab]);

  if (!isOpen) return null;

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default passkey for church administration
    if (passkeyInput === 'fgcmushin2026' || passkeyInput === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect church admin passkey. Please check with the Secretariat.');
    }
  };

  // --- Sermon Handlers ---
  const handleOpenAddSermon = () => {
    setSermonForm({
      title: '',
      series: 'SUNDAY CELEBRATION',
      speaker: 'Lead Pastor',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: '40 min',
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
      showNotice('Sermon successfully saved and published!');
      setIsEditingSermon(false);
      onDataRefresh();
    } else {
      showNotice(`Error saving sermon: ${res.error}`, 'error');
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
      category: evt.category,
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
    if (!window.confirm(`Are you sure you want to remove event "${title}"?`)) return;
    setLoading(true);
    const res = await deleteEvent(id);
    setLoading(false);
    if (res.success) {
      showNotice('Event removed from calendar.');
      onDataRefresh();
    } else {
      showNotice(`Failed to delete event: ${res.error}`, 'error');
    }
  };

  // --- Settings Handlers ---
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
      showNotice('Church settings updated successfully!');
      onDataRefresh();
    } else {
      showNotice(`Error updating settings: ${res.error}`, 'error');
    }
  };

  // --- Status Update Handlers ---
  const handleUpdatePrayer = async (id: string, status: string) => {
    const res = await updatePrayerStatus(id, status);
    if (res.success) {
      showNotice(`Prayer marked as "${status}"`);
      loadSubmissions();
    }
  };

  const handleUpdateGuest = async (id: string, status: string) => {
    const res = await updateGuestVisitStatus(id, status);
    if (res.success) {
      showNotice(`Guest marked as "${status}"`);
      loadSubmissions();
    }
  };

  return (
    <div
      className="modal-backdrop-animate"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'rgba(21, 26, 33, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        className="double-bezel modal-dialog-animate"
        style={{
          maxWidth: '1050px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="double-bezel-inner" style={{ padding: '2rem 2.5rem', background: '#FFFFFF', position: 'relative' }}>
          {/* Top 4-Color Church Emblem Gradient Ribbon */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--fgc-gradient-4color)' }} />

          {/* Top Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--fgc-blue-subtle)',
                  border: '1px solid var(--fgc-blue-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--fgc-blue)'
                }}
              >
                <Settings size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    FGC Mushin CMS & Content Backend
                  </h3>
                  <span className="eyebrow-pill blue" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                    Supabase Live
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Manage sermons, events, live announcements, and view visitor & prayer requests
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#F3EFEA',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Notice Toast */}
          {notice && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                background: notice.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: notice.type === 'success' ? '#065F46' : '#991B1B',
                border: `1px solid ${notice.type === 'success' ? '#A7F3D0' : '#FECACA'}`
              }}
            >
              {notice.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{notice.message}</span>
            </div>
          )}

          {/* Authentication View */}
          {!isAuthenticated ? (
            <div style={{ maxWidth: '440px', margin: '3rem auto', textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--fgc-blue-subtle)',
                  border: '2px solid var(--fgc-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: 'var(--fgc-blue)'
                }}
              >
                <Lock size={26} />
              </div>

              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Church Staff Access
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Enter the church administration passkey to access live content management.
              </p>

              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="password"
                  placeholder="Enter staff passkey (e.g. fgcmushin2026)"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-medium)',
                    background: '#FAF8F5',
                    fontSize: '1rem',
                    outline: 'none',
                    textAlign: 'center',
                    letterSpacing: '0.05em'
                  }}
                  autoFocus
                />

                {authError && (
                  <p style={{ color: '#DC2626', fontSize: '0.825rem', margin: 0, fontWeight: 600 }}>
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-island btn-teal"
                  style={{ justifyContent: 'center', padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}
                >
                  <span>Authorize & Open CMS</span>
                  <Shield size={16} />
                </button>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Default passkey: <code style={{ background: '#F3EFEA', padding: '2px 6px', borderRadius: '4px' }}>fgcmushin2026</code>
                </p>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Dashboard */
            <div>
              {/* Navigation Tabs */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  background: '#FAF8F5',
                  padding: '6px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.75rem'
                }}
              >
                <button
                  onClick={() => { setActiveTab('sermons'); setIsEditingSermon(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: activeTab === 'sermons' ? 'var(--fgc-blue)' : 'transparent',
                    color: activeTab === 'sermons' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <BookOpen size={15} />
                  <span>Sermons ({sermons.length})</span>
                </button>

                <button
                  onClick={() => { setActiveTab('events'); setIsEditingEvent(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: activeTab === 'events' ? 'var(--fgc-blue)' : 'transparent',
                    color: activeTab === 'events' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <Calendar size={15} />
                  <span>Events ({events.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('guests')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: activeTab === 'guests' ? 'var(--fgc-blue)' : 'transparent',
                    color: activeTab === 'guests' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <Users size={15} />
                  <span>First-Time Guests ({guestVisits.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('prayers')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: activeTab === 'prayers' ? 'var(--fgc-blue)' : 'transparent',
                    color: activeTab === 'prayers' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <Heart size={15} />
                  <span>Prayer Requests ({prayerRequests.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('giving')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: activeTab === 'giving' ? 'var(--fgc-blue)' : 'transparent',
                    color: activeTab === 'giving' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <DollarSign size={15} />
                  <span>Giving Records ({givingRecords.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: activeTab === 'settings' ? 'var(--fgc-blue)' : 'transparent',
                    color: activeTab === 'settings' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <Settings size={15} />
                  <span>Church Settings</span>
                </button>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={() => { onDataRefresh(); loadSubmissions(); }}
                    title="Refresh data from Supabase"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 0.85rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: SERMONS */}
              {activeTab === 'sermons' && (
                <div>
                  {!isEditingSermon ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                            Published Sermons & Teaching
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Add sermon titles, scripture references, video embeds, and summaries
                          </p>
                        </div>
                        <button
                          onClick={handleOpenAddSermon}
                          className="btn-island btn-teal"
                          style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                        >
                          <Plus size={16} />
                          <span>Add New Sermon</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {sermons.map((s) => (
                          <div
                            key={s.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '1rem 1.25rem',
                              borderRadius: '12px',
                              background: '#FAF8F5',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                              <img
                                src={s.thumbnail}
                                alt={s.title}
                                style={{ width: '65px', height: '45px', objectFit: 'cover', borderRadius: '8px' }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.725rem', color: 'var(--accent-teal)', fontWeight: 700, textTransform: 'uppercase' }}>
                                  {s.series} • {s.passage}
                                </div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {s.title}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {s.speaker} • {s.date}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <button
                                onClick={() => handleEditSermon(s)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.5rem 0.85rem',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-subtle)',
                                  background: '#FFFFFF',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: 'var(--text-primary)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Edit3 size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteSermon(s.id, s.title)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '0.5rem',
                                  borderRadius: '8px',
                                  border: '1px solid #FECACA',
                                  background: '#FEF2F2',
                                  color: '#DC2626',
                                  cursor: 'pointer'
                                }}
                                title="Delete sermon"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Add / Edit Sermon Form */
                    <form onSubmit={handleSaveSermon} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {sermonForm.id ? 'Edit Sermon Message' : 'Create New Sermon'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsEditingSermon(false)}
                          style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Sermon Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={sermonForm.title}
                            onChange={(e) => setSermonForm({ ...sermonForm, title: e.target.value })}
                            placeholder="e.g. Walking In Divine Favor"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Series Name
                          </label>
                          <input
                            type="text"
                            value={sermonForm.series}
                            onChange={(e) => setSermonForm({ ...sermonForm, series: e.target.value })}
                            placeholder="e.g. UNSHAKABLE"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Preacher / Speaker *
                          </label>
                          <input
                            type="text"
                            required
                            value={sermonForm.speaker}
                            onChange={(e) => setSermonForm({ ...sermonForm, speaker: e.target.value })}
                            placeholder="e.g. District Overseer / Pastor"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Date Preached
                          </label>
                          <input
                            type="text"
                            value={sermonForm.date}
                            onChange={(e) => setSermonForm({ ...sermonForm, date: e.target.value })}
                            placeholder="e.g. Oct 25, 2026"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Scripture Passage
                          </label>
                          <input
                            type="text"
                            value={sermonForm.passage}
                            onChange={(e) => setSermonForm({ ...sermonForm, passage: e.target.value })}
                            placeholder="e.g. Hebrews 13:8"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Video URL (YouTube or Vimeo embed)
                          </label>
                          <input
                            type="text"
                            value={sermonForm.videoUrl}
                            onChange={(e) => setSermonForm({ ...sermonForm, videoUrl: e.target.value })}
                            placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                          Sermon Summary & Key Takeaways
                        </label>
                        <textarea
                          rows={3}
                          value={sermonForm.summary}
                          onChange={(e) => setSermonForm({ ...sermonForm, summary: e.target.value })}
                          placeholder="Brief message summary for congregation and online visitors..."
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setIsEditingSermon(false)}
                          className="btn-island btn-ghost"
                          style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-island btn-teal"
                          style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}
                        >
                          <Check size={16} />
                          <span>Save & Publish Sermon</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: EVENTS */}
              {activeTab === 'events' && (
                <div>
                  {!isEditingEvent ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                            Church Calendar & Gatherings
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Manage upcoming prayer vigils, outreaches, youth programs, and celebrations
                          </p>
                        </div>
                        <button
                          onClick={handleOpenAddEvent}
                          className="btn-island btn-teal"
                          style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                        >
                          <Plus size={16} />
                          <span>Add New Event</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {events.map((evt) => (
                          <div
                            key={evt.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '1rem 1.25rem',
                              borderRadius: '12px',
                              background: '#FAF8F5',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                <span className={`eyebrow-pill ${evt.category.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                                  {evt.category}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--fgc-blue)', fontWeight: 600 }}>
                                  {evt.date} • {evt.time}
                                </span>
                              </div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {evt.title}
                              </div>
                              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                                {evt.location}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <button
                                onClick={() => handleEditEvent(evt)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.5rem 0.85rem',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-subtle)',
                                  background: '#FFFFFF',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: 'var(--text-primary)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Edit3 size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(evt.id, evt.title)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '0.5rem',
                                  borderRadius: '8px',
                                  border: '1px solid #FECACA',
                                  background: '#FEF2F2',
                                  color: '#DC2626',
                                  cursor: 'pointer'
                                }}
                                title="Delete event"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Add / Edit Event Form */
                    <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {eventForm.id ? 'Edit Event Details' : 'Create New Event'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsEditingEvent(false)}
                          style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Event Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={eventForm.title}
                            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                            placeholder="e.g. Night of Prophetic Praise"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Category *
                          </label>
                          <select
                            value={eventForm.category}
                            onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as ChurchEvent['category'] })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          >
                            <option value="Worship">Worship Service</option>
                            <option value="Community">Community Gathering</option>
                            <option value="Outreach">Outreach & Welfare</option>
                            <option value="NextGen">NextGen & Youth</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Date *
                          </label>
                          <input
                            type="text"
                            required
                            value={eventForm.date}
                            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                            placeholder="e.g. Friday, Nov 27, 2026"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Time *
                          </label>
                          <input
                            type="text"
                            required
                            value={eventForm.time}
                            onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                            placeholder="e.g. 6:00 PM – 8:30 PM"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                            Location
                          </label>
                          <input
                            type="text"
                            value={eventForm.location}
                            onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                            placeholder="e.g. 4, Obarinmola Adedoyin Street, Mushin, Idi-Oro"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={eventForm.description}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                          placeholder="Event description and details for attendees..."
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setIsEditingEvent(false)}
                          className="btn-island btn-ghost"
                          style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-island btn-teal"
                          style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}
                        >
                          <Check size={16} />
                          <span>Save & Publish Event</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: FIRST-TIME GUESTS */}
              {activeTab === 'guests' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        First-Time Guest RSVPs ({guestVisits.length})
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Visitors who filled out "Plan Your Sunday Visit"
                      </p>
                    </div>
                  </div>

                  {guestVisits.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#FAF8F5', borderRadius: '16px', color: 'var(--text-muted)' }}>
                      <Users size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>No guest reservations submitted yet.</p>
                      <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem' }}>When visitors RSVP via the website, their details appear here in real time.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {guestVisits.map((g) => (
                        <div
                          key={g.id}
                          style={{
                            padding: '1.25rem',
                            borderRadius: '12px',
                            background: '#FAF8F5',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {g.full_name}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                              <span>Email: <strong>{g.email}</strong></span>
                              {g.phone && <span>Phone: <strong>{g.phone}</strong></span>}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', gap: '1rem' }}>
                              <span>Service: <strong>{g.service_time}</strong></span>
                              <span>Party: <strong>{g.adults_count ?? 1} Adults, {g.kids_count ?? 0} Kids</strong></span>
                              <span>Date: {g.created_at ? new Date(g.created_at).toLocaleDateString() : 'Recent'}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: g.status === 'welcomed' ? '#059669' : '#D97706' }}>
                              Status: {g.status || 'Pending'}
                            </span>
                            <button
                              onClick={() => handleUpdateGuest(g.id, g.status === 'welcomed' ? 'pending' : 'welcomed')}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-medium)',
                                background: '#FFFFFF',
                                fontSize: '0.785rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {g.status === 'welcomed' ? 'Mark Pending' : 'Mark Welcomed'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PRAYER REQUESTS */}
              {activeTab === 'prayers' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Pastoral Prayer Requests ({prayerRequests.length})
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Requests received from members and seekers for intercessory prayer
                      </p>
                    </div>
                  </div>

                  {prayerRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#FAF8F5', borderRadius: '16px', color: 'var(--text-muted)' }}>
                      <Heart size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>No prayer requests submitted yet.</p>
                      <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem' }}>Requests submitted through the prayer modal will be securely listed here.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {prayerRequests.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            padding: '1.25rem',
                            borderRadius: '12px',
                            background: '#FAF8F5',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {p.full_name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {p.email || 'No email provided'} • {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {p.is_confidential && (
                                <span className="eyebrow-pill red" style={{ fontSize: '0.685rem', padding: '0.15rem 0.5rem' }}>
                                  <Shield size={12} /> Confidential
                                </span>
                              )}
                              <button
                                onClick={() => handleUpdatePrayer(p.id, p.status === 'prayed' ? 'received' : 'prayed')}
                                style={{
                                  padding: '0.45rem 0.85rem',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-medium)',
                                  background: p.status === 'prayed' ? '#ECFDF5' : '#FFFFFF',
                                  color: p.status === 'prayed' ? '#065F46' : 'var(--text-primary)',
                                  fontSize: '0.785rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                {p.status === 'prayed' ? '✓ Prayed Over' : 'Mark Prayed Over'}
                              </button>
                            </div>
                          </div>

                          <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                            "{p.request}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: GIVING RECORDS */}
              {activeTab === 'giving' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Stewardship & Giving Records ({givingRecords.length})
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Online transactions and designated offerings
                      </p>
                    </div>
                  </div>

                  {givingRecords.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#FAF8F5', borderRadius: '16px', color: 'var(--text-muted)' }}>
                      <DollarSign size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>No online giving records yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {givingRecords.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            background: '#FAF8F5',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--fgc-blue)' }}>
                              ${r.amount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>({r.frequency})</span>
                            </div>
                            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                              Fund: <strong>{r.fund}</strong> • {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                            </div>
                          </div>
                          <span className="eyebrow-pill gold" style={{ fontSize: '0.725rem' }}>
                            Confirmed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Live Announcement Banner & Contact Details
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Modify the top announcement ribbon and church contact information displayed to the congregation.
                    </p>
                  </div>

                  {/* Announcement Banner Text */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Top Banner Message
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={settingsForm.announcementActive}
                          onChange={(e) => setSettingsForm({ ...settingsForm, announcementActive: e.target.checked })}
                          style={{ accentColor: 'var(--fgc-blue)' }}
                        />
                        <span>Banner Active / Visible</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.announcementText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                      placeholder="Welcome to FGC Mushin DHQ • Sunday Celebration Services at 7:30 AM & 9:30 AM"
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                    />
                  </div>

                  {/* Contact Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Secretariat Phone Number
                      </label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Official Email Address
                      </label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        District Headquarters Physical Address
                      </label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: '#FAF8F5' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                    <button
                      type="submit"
                      className="btn-island btn-teal"
                      style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
                    >
                      <Check size={16} />
                      <span>Update Church Settings</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
