import React, { useState, useMemo } from 'react';
import {
  Users,
  Activity,
  Plus,
  Search,
  BookOpen,
  Flame,
  Award,
  Download,
  Check,
  X,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import type { ServiceAttendanceRow } from '../types/database';
import { logServiceAttendance } from '../lib/supabase';

interface AttendanceAnalyticsProps {
  attendanceList: ServiceAttendanceRow[];
  activeRole: string;
  onRefresh: () => Promise<void>;
  onShowNotice: (msg: string, type?: 'info' | 'success' | 'error') => void;
  onOpenHeadcountModal?: () => void;
}

type ServiceCategoryFilter = 'all' | 'sunday_service' | 'prayer_meeting' | 'bible_study';
type PeriodFilter = 'daily' | 'weekly' | 'monthly' | 'all';

const SERVICE_TYPE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  sunday_service: { label: 'Sunday Celebration', icon: Users, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  prayer_meeting: { label: 'Prayer Meeting', icon: Flame, color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  bible_study: { label: 'Bible Study', icon: BookOpen, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  special_program: { label: 'Special Program / Vigil', icon: Award, color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

// Preset services by category
const SERVICE_PRESETS: Record<string, string[]> = {
  sunday_service: [
    '1st Service (7:30 AM)',
    '2nd Service (9:30 AM)',
    'Combined Sunday Thanksgiving Service (9:00 AM)'
  ],
  prayer_meeting: [
    'Wednesday Hour of Power (6:00 PM)',
    'Early Morning Prayer Cry (6:00 AM)',
    'Monthly Holy Ghost Night Vigil (10:00 PM)'
  ],
  bible_study: [
    'Thursday Digging Deep Bible Study (6:00 PM)',
    'Sunday School & Believers Discipleship Class'
  ],
  special_program: [
    'District Annual Convocation',
    'Easter / Christmas Cantata Celebration',
    'Cross-Over Night Service'
  ]
};

const SANCTUARY_CAPACITY = 1250; // Ground floor 850 + Gallery 400

export const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({
  attendanceList,
  activeRole: _activeRole,
  onRefresh,
  onShowNotice
}) => {
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategoryFilter>('all');
  const [period, setPeriod] = useState<PeriodFilter>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [newEntry, setNewEntry] = useState({
    service_date: new Date().toISOString().split('T')[0],
    service_type: 'sunday_service' as 'sunday_service' | 'prayer_meeting' | 'bible_study' | 'special_program',
    service_name: '1st Service (7:30 AM)',
    men_count: 0,
    women_count: 0,
    children_count: 0,
    head_usher_name: 'Bro. Emmanuel Kalu',
    notes: ''
  });

  // Today string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter records by period
  const periodFiltered = useMemo(() => {
    const now = new Date();
    return attendanceList.filter(item => {
      const itemDate = new Date(item.service_date);
      if (period === 'daily') {
        // Today or recent 7 days
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 7;
      } else if (period === 'weekly') {
        // Last 4 weeks (28 days)
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 28;
      } else if (period === 'monthly') {
        // Last 3 months (90 days)
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 90;
      }
      return true;
    });
  }, [attendanceList, period]);

  // Aggregate telemetry
  const telemetry = useMemo<{
    totalWorshippers: number;
    totalMen: number;
    totalWomen: number;
    totalChildren: number;
    menPct: number;
    womenPct: number;
    kidsPct: number;
    avgSunday: number;
    avgPrayer: number;
    avgBibleStudy: number;
    peakRecord: ServiceAttendanceRow | null;
    servicesCount: number;
  }>(() => {
    let totalWorshippers = 0;
    let totalMen = 0;
    let totalWomen = 0;
    let totalChildren = 0;

    let sundayTotal = 0;
    let sundayServicesCount = 0;

    let prayerTotal = 0;
    let prayerServicesCount = 0;

    let bibleStudyTotal = 0;
    let bibleStudyServicesCount = 0;

    let peakRecord: ServiceAttendanceRow | null = null;

    periodFiltered.forEach(rec => {
      const men = Number(rec.men_count) || 0;
      const women = Number(rec.women_count) || 0;
      const kids = Number(rec.children_count) || 0;
      const total = rec.total_count || (men + women + kids);

      totalWorshippers += total;
      totalMen += men;
      totalWomen += women;
      totalChildren += kids;

      if (!peakRecord || total > (peakRecord.total_count || 0)) {
        peakRecord = rec;
      }

      const st = (rec.service_type || 'sunday_service').toLowerCase();
      if (st.includes('sunday')) {
        sundayTotal += total;
        sundayServicesCount++;
      } else if (st.includes('prayer')) {
        prayerTotal += total;
        prayerServicesCount++;
      } else if (st.includes('bible') || st.includes('study')) {
        bibleStudyTotal += total;
        bibleStudyServicesCount++;
      }
    });

    const avgSunday = sundayServicesCount > 0 ? Math.round(sundayTotal / sundayServicesCount) : 0;
    const avgPrayer = prayerServicesCount > 0 ? Math.round(prayerTotal / prayerServicesCount) : 0;
    const avgBibleStudy = bibleStudyServicesCount > 0 ? Math.round(bibleStudyTotal / bibleStudyServicesCount) : 0;

    const menPct = totalWorshippers > 0 ? Math.round((totalMen / totalWorshippers) * 100) : 0;
    const womenPct = totalWorshippers > 0 ? Math.round((totalWomen / totalWorshippers) * 100) : 0;
    const kidsPct = totalWorshippers > 0 ? Math.round((totalChildren / totalWorshippers) * 100) : 0;

    return {
      totalWorshippers,
      totalMen,
      totalWomen,
      totalChildren,
      menPct,
      womenPct,
      kidsPct,
      avgSunday,
      avgPrayer,
      avgBibleStudy,
      peakRecord,
      servicesCount: periodFiltered.length
    };
  }, [periodFiltered]);

  // Displayed rows based on category filter & search
  const displayedRows = useMemo(() => {
    return periodFiltered.filter(rec => {
      const st = rec.service_type || 'sunday_service';
      if (categoryFilter !== 'all' && st !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (rec.service_name || '').toLowerCase().includes(q);
        const matchesDate = (rec.service_date || '').toLowerCase().includes(q);
        const matchesUsher = (rec.head_usher_name || '').toLowerCase().includes(q);
        const matchesNotes = (rec.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDate && !matchesUsher && !matchesNotes) return false;
      }

      return true;
    });
  }, [periodFiltered, categoryFilter, searchQuery]);

  // Handle service type change in modal to update preset service name
  const handleTypeChangeInModal = (type: 'sunday_service' | 'prayer_meeting' | 'bible_study' | 'special_program') => {
    const presets = SERVICE_PRESETS[type] || [];
    setNewEntry({
      ...newEntry,
      service_type: type,
      service_name: presets[0] || 'Church Gathering'
    });
  };

  // Quick increment/decrement helpers
  const adjustCounter = (field: 'men_count' | 'women_count' | 'children_count', delta: number) => {
    setNewEntry(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta)
    }));
  };

  // Submit attendance log
  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.men_count < 0 || newEntry.women_count < 0 || newEntry.children_count < 0) {
      onShowNotice('Attendance counts cannot be negative numbers.', 'error');
      return;
    }

    const total = newEntry.men_count + newEntry.women_count + newEntry.children_count;
    if (total === 0) {
      onShowNotice('Please enter at least one headcount number before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await logServiceAttendance({
        service_date: newEntry.service_date,
        service_name: newEntry.service_name,
        service_type: newEntry.service_type,
        men_count: Number(newEntry.men_count),
        women_count: Number(newEntry.women_count),
        children_count: Number(newEntry.children_count),
        head_usher_name: newEntry.head_usher_name || 'Bro. Emmanuel Kalu',
        notes: newEntry.notes || undefined
      });

      if (res.success) {
        onShowNotice(`Attendance for ${newEntry.service_name} (${total} total) logged successfully.`, 'success');
        setIsLogModalOpen(false);
        setNewEntry({
          service_date: todayStr,
          service_type: 'sunday_service',
          service_name: '1st Service (7:30 AM)',
          men_count: 0,
          women_count: 0,
          children_count: 0,
          head_usher_name: 'Bro. Emmanuel Kalu',
          notes: ''
        });
        await onRefresh();
      } else {
        onShowNotice(`Failed to log attendance: ${res.error}`, 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onShowNotice(`Error: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (displayedRows.length === 0) {
      onShowNotice('No attendance records to export in the selected filter.', 'info');
      return;
    }
    const headers = ['Date', 'Category', 'Service Name', 'Men', 'Women', 'Children', 'Total', 'Usher in Charge', 'Notes'];
    const rows = displayedRows.map(r => [
      r.service_date,
      SERVICE_TYPE_CONFIG[r.service_type || 'sunday_service']?.label || r.service_type,
      `"${r.service_name.replace(/"/g, '""')}"`,
      r.men_count,
      r.women_count,
      r.children_count,
      r.total_count,
      `"${(r.head_usher_name || 'Bro. Emmanuel Kalu').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FGC_Mushin_Attendance_${categoryFilter}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowNotice(`Exported ${displayedRows.length} service attendance records to CSV.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Protocol & Sanctuary Operations
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs text-slate-400 font-mono">Verified Headcount System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Service Attendance & Congregation Analytics
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live headcount records, demographic distributions, and trend analysis across Sunday Services, Midweek Prayer Meetings, and Bible Studies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
            {(['daily', 'weekly', 'monthly', 'all'] as PeriodFilter[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  period === p
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === 'all' ? 'All-Time' : p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-900/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Log Headcount</span>
          </button>
        </div>
      </div>

      {/* Service Type Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            categoryFilter === 'all'
              ? 'bg-slate-800 text-white shadow border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          All Services ({periodFiltered.length})
        </button>

        <button
          onClick={() => setCategoryFilter('sunday_service')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            categoryFilter === 'sunday_service'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          Sunday Services (1st & 2nd)
        </button>

        <button
          onClick={() => setCategoryFilter('prayer_meeting')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            categoryFilter === 'prayer_meeting'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-sky-400" />
          Prayer Meetings (Wed Hour of Power / Vigils)
        </button>

        <button
          onClick={() => setCategoryFilter('bible_study')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            categoryFilter === 'bible_study'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          Bible Studies (Thu Digging Deep / Classes)
        </button>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Congregational Headcount */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Worshippers Headcount</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
            {telemetry.totalWorshippers.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Across {telemetry.servicesCount} verified services</span>
            <span className="text-amber-400 font-semibold">{period.toUpperCase()}</span>
          </div>
        </div>

        {/* Average Sunday Service Attendance */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sunday Service Average</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {telemetry.avgSunday > 0 ? telemetry.avgSunday.toLocaleString() : '—'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>1st (7:30 AM) & 2nd (9:30 AM)</span>
            <span className="text-emerald-400 font-semibold">
              {Math.round((telemetry.avgSunday / SANCTUARY_CAPACITY) * 100)}% Capacity
            </span>
          </div>
        </div>

        {/* Average Prayer Meeting Attendance */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Prayer Meetings Attendance</span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-sky-400 font-mono tracking-tight">
            {telemetry.avgPrayer > 0 ? telemetry.avgPrayer.toLocaleString() : '—'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Wed Hour of Power & Vigils</span>
            <span className="text-sky-400 font-semibold">Intercession</span>
          </div>
        </div>

        {/* Bible Study Average */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bible Study Attendance</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono tracking-tight">
            {telemetry.avgBibleStudy > 0 ? telemetry.avgBibleStudy.toLocaleString() : '—'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Thu Digging Deep & Classes</span>
            <span className="text-purple-400 font-semibold">Discipleship</span>
          </div>
        </div>
      </div>

      {/* Demographic Breakdown & Visual Capacity Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demographics Bar Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                Congregation Demographics Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of adult men, adult women, and children across attended gatherings
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {telemetry.totalWorshippers.toLocaleString()} Total
            </span>
          </div>

          {/* Tri-color composite progress bar */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-950 rounded-xl overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${telemetry.menPct}%` }}
                className="bg-sky-500 hover:bg-sky-400 transition-all"
                title={`Men: ${telemetry.totalMen} (${telemetry.menPct}%)`}
              />
              <div
                style={{ width: `${telemetry.womenPct}%` }}
                className="bg-purple-500 hover:bg-purple-400 transition-all"
                title={`Women: ${telemetry.totalWomen} (${telemetry.womenPct}%)`}
              />
              <div
                style={{ width: `${telemetry.kidsPct}%` }}
                className="bg-amber-500 hover:bg-amber-400 transition-all"
                title={`Children: ${telemetry.totalChildren} (${telemetry.kidsPct}%)`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {/* Men */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Men
                </div>
                <div className="text-lg font-black text-white font-mono mt-1">
                  {telemetry.totalMen.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">{telemetry.menPct}% of congregation</div>
              </div>

              {/* Women */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Women
                </div>
                <div className="text-lg font-black text-white font-mono mt-1">
                  {telemetry.totalWomen.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">{telemetry.womenPct}% of congregation</div>
              </div>

              {/* Children */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Children
                </div>
                <div className="text-lg font-black text-white font-mono mt-1">
                  {telemetry.totalChildren.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">{telemetry.kidsPct}% of congregation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sanctuary Capacity Gauge Card */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Sanctuary Capacity Gauge
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">1,250 Max Seats</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Ground floor (850 seats) + Overflow balcony gallery (400 seats).
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Peak Single Service</span>
                  <span className="text-white font-mono font-bold">
                    {telemetry.peakRecord ? `${telemetry.peakRecord.total_count} worshippers` : '—'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${Math.min(100, Math.round(((telemetry.peakRecord?.total_count || 0) / SANCTUARY_CAPACITY) * 100))}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {telemetry.peakRecord?.service_name || 'Sunday Service'} ({telemetry.peakRecord?.service_date || '—'})
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Protocol Guidelines
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Usher marshals open the upper gallery once ground floor reaches 750 (approx. 88% density).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Ushering Desk: <strong>Bro. Emmanuel Kalu</strong></span>
            <span className="text-emerald-400 font-semibold">Active Telemetry</span>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">Verified Service Attendance Log</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-800 text-slate-300">
              {displayedRows.length} services
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search service name or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Service Name</th>
                <th className="py-3 px-3 text-right">Men</th>
                <th className="py-3 px-3 text-right">Women</th>
                <th className="py-3 px-3 text-right">Children</th>
                <th className="py-3 px-3 text-right font-bold text-white">Total</th>
                <th className="py-3 px-3">Capacity Density</th>
                <th className="py-3 px-3">Head Usher</th>
                <th className="py-3 px-3">Notes & Highlights</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No service attendance records found in the current filter.
                  </td>
                </tr>
              ) : (
                displayedRows.map(rec => {
                  const cfg = SERVICE_TYPE_CONFIG[rec.service_type || 'sunday_service'] || {
                    label: 'Service',
                    icon: Users,
                    color: 'bg-slate-800 text-slate-300 border-slate-700'
                  };
                  const Icon = cfg.icon;
                  const total = rec.total_count || (rec.men_count + rec.women_count + rec.children_count);
                  const densityPct = Math.round((total / SANCTUARY_CAPACITY) * 100);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-300 font-mono whitespace-nowrap">
                        {rec.service_date}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-white font-semibold whitespace-nowrap">
                        {rec.service_name}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 font-mono">
                        {rec.men_count}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 font-mono">
                        {rec.women_count}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 font-mono">
                        {rec.children_count}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm whitespace-nowrap">
                        {total}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              style={{ width: `${Math.min(100, densityPct)}%` }}
                              className={`h-full ${densityPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{densityPct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {rec.head_usher_name || 'Bro. Emmanuel Kalu'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate" title={rec.notes || ''}>
                        {rec.notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Headcount Logging Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Log Service Attendance</h3>
                  <p className="text-xs text-slate-400">Record Sunday, Prayer Meeting, or Bible Study headcount</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAttendance} className="space-y-4 text-xs">
              {/* Category selector */}
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                  Service Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChangeInModal('sunday_service')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      newEntry.service_type === 'sunday_service'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    Sunday Service
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChangeInModal('prayer_meeting')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      newEntry.service_type === 'prayer_meeting'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Flame className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                    Prayer Meeting
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChangeInModal('bible_study')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      newEntry.service_type === 'bible_study'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    Bible Study
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Service Date
                  </label>
                  <input
                    type="date"
                    value={newEntry.service_date}
                    onChange={(e) => setNewEntry({ ...newEntry, service_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-rose-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Service Name / Gathering
                  </label>
                  <select
                    value={newEntry.service_name}
                    onChange={(e) => setNewEntry({ ...newEntry, service_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-rose-500 focus:outline-none"
                  >
                    {(SERVICE_PRESETS[newEntry.service_type] || []).map(preset => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                {/* Men */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="block text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1">
                    Men
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={newEntry.men_count}
                    onChange={(e) => setNewEntry({ ...newEntry, men_count: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full text-center text-lg font-black font-mono text-white bg-transparent focus:outline-none"
                  />
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <button
                      type="button"
                      onClick={() => adjustCounter('men_count', -5)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-[10px]"
                    >-5</button>
                    <button
                      type="button"
                      onClick={() => adjustCounter('men_count', 5)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-[10px]"
                    >+5</button>
                  </div>
                </div>

                {/* Women */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1">
                    Women
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={newEntry.women_count}
                    onChange={(e) => setNewEntry({ ...newEntry, women_count: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full text-center text-lg font-black font-mono text-white bg-transparent focus:outline-none"
                  />
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <button
                      type="button"
                      onClick={() => adjustCounter('women_count', -5)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-[10px]"
                    >-5</button>
                    <button
                      type="button"
                      onClick={() => adjustCounter('women_count', 5)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-[10px]"
                    >+5</button>
                  </div>
                </div>

                {/* Children */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Children
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={newEntry.children_count}
                    onChange={(e) => setNewEntry({ ...newEntry, children_count: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full text-center text-lg font-black font-mono text-white bg-transparent focus:outline-none"
                  />
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <button
                      type="button"
                      onClick={() => adjustCounter('children_count', -5)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-[10px]"
                    >-5</button>
                    <button
                      type="button"
                      onClick={() => adjustCounter('children_count', 5)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-[10px]"
                    >+5</button>
                  </div>
                </div>
              </div>

              {/* Total Headcount summary badge */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Computed Service Total</span>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {newEntry.men_count + newEntry.women_count + newEntry.children_count} worshippers
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Sanctuary Density</span>
                  <div className="text-sm font-bold text-white font-mono">
                    {Math.round(((newEntry.men_count + newEntry.women_count + newEntry.children_count) / SANCTUARY_CAPACITY) * 100)}%
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Ushering & Protocol Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Seating order, communion notes, overflow observations..."
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? 'Logging...' : 'Save & Publish Headcount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
