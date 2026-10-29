import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Wallet,
  Users,
  Activity,
  Heart,
  Plus,
  Search,
  Info,
  Lock,
  BookOpen,
  Flame,
  CheckCircle2,
  ChevronDown,
  Download,
  Crown
} from 'lucide-react';
import type { Sermon, ChurchEvent } from '../types';
import type {
  GuestVisitRow,
  PrayerRequestRow,
  ServiceAttendanceRow,
  StaffUserRow,
  AuditLogRow,
  ChurchFinanceRow
} from '../types/database';
import type { ChurchRole } from '../types/iam';

export interface LectorChurchDashboardProps {
  finances: ChurchFinanceRow[];
  serviceAttendance: ServiceAttendanceRow[];
  guestVisits: GuestVisitRow[];
  prayerRequests: PrayerRequestRow[];
  sermons: Sermon[];
  events: ChurchEvent[];
  staffUsers: StaffUserRow[];
  auditLogs: AuditLogRow[];
  activeRole: ChurchRole;
  onSetActiveTab: (tab: string) => void;
  onOpenRecordFinanceModal?: () => void;
  onOpenLogAttendanceModal?: () => void;
}

type Timeframe = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export const LectorChurchDashboard: React.FC<LectorChurchDashboardProps> = ({
  finances = [],
  serviceAttendance = [],
  guestVisits = [],
  prayerRequests = [],
  sermons = [],
  events: _events = [],
  staffUsers: _staffUsers = [],
  auditLogs: _auditLogs = [],
  activeRole: _activeRole,
  onSetActiveTab,
  onOpenRecordFinanceModal,
  onOpenLogAttendanceModal
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('MONTHLY');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bouncePeriod, setBouncePeriod] = useState<'Monthly' | 'Weekly'>('Monthly');
  const [showAddChoiceModal, setShowAddChoiceModal] = useState(false);

  // Financial aggregates
  const totalInflow = useMemo(() => {
    return finances
      .filter((f) => f.transaction_type === 'inflow')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [finances]);

  const totalTithes = useMemo(() => {
    return finances
      .filter((f) => f.transaction_type === 'inflow' && (f.category.toLowerCase().includes('tithe') || f.notes?.toLowerCase().includes('tithe')))
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [finances]);

  const totalBuildingFund = useMemo(() => {
    return finances
      .filter((f) => f.category.toLowerCase().includes('building') || f.category.toLowerCase().includes('capital') || f.notes?.toLowerCase().includes('generator'))
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [finances]);

  const totalMissions = useMemo(() => {
    return finances
      .filter((f) => f.category.toLowerCase().includes('mission') || f.category.toLowerCase().includes('outreach') || f.category.toLowerCase().includes('evangelism'))
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [finances]);

  const totalWelfareOutflow = useMemo(() => {
    return finances
      .filter((f) => f.transaction_type === 'outflow' && (f.category.toLowerCase().includes('welfare') || f.category.toLowerCase().includes('benevolence')))
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [finances]);

  // Attendance aggregates
  const totalRecentHeadcount = useMemo(() => {
    if (!serviceAttendance.length) return 1250;
    const sundayRecords = serviceAttendance.filter((s) => (s.service_type || '').toLowerCase().includes('sunday') || s.service_name.toLowerCase().includes('service'));
    if (!sundayRecords.length) return 1250;
    return sundayRecords.slice(0, 2).reduce((sum, s) => sum + s.total_count, 0);
  }, [serviceAttendance]);

  const midweekHeadcount = useMemo(() => {
    const midweek = serviceAttendance.filter((s) => {
      const type = (s.service_type || '').toLowerCase();
      const name = s.service_name.toLowerCase();
      return type.includes('prayer') || type.includes('bible') || name.includes('hour of power') || name.includes('digging deep');
    });
    if (!midweek.length) return 485;
    return midweek.slice(0, 2).reduce((sum, s) => sum + s.total_count, 0);
  }, [serviceAttendance]);

  // Demographics breakdown (Men, Women, Children)
  const demographics = useMemo(() => {
    let men = 0, women = 0, children = 0;
    serviceAttendance.forEach((s) => {
      men += s.men_count || 0;
      women += s.women_count || 0;
      children += s.children_count || 0;
    });
    const total = men + women + children;
    if (total === 0) {
      return { menPct: 33, womenPct: 55, childrenPct: 12 };
    }
    const menPct = Math.round((men / total) * 100);
    const womenPct = Math.round((women / total) * 100);
    const childrenPct = 100 - menPct - womenPct;
    return { menPct, womenPct, childrenPct };
  }, [serviceAttendance]);

  // Dynamic timeframe values for main card
  const mainMetric = useMemo(() => {
    switch (timeframe) {
      case 'DAILY':
        return {
          amount: '₦432,500',
          amountLabel: 'Current Daily Collections',
          count: '285',
          countLabel: 'Daily Prayer Worshippers'
        };
      case 'WEEKLY':
        return {
          amount: '₦1,845,000',
          amountLabel: 'Current Weekly Collections',
          count: '1,220',
          countLabel: 'Weekly Combined Congregation'
        };
      case 'YEARLY':
        return {
          amount: '₦42,850,000',
          amountLabel: 'Current Annual Treasury Reserves',
          count: '14,800',
          countLabel: 'Total Annual Worshippers'
        };
      case 'MONTHLY':
      default:
        return {
          amount: totalInflow ? `₦${(totalInflow / 1000).toLocaleString('en-NG', { maximumFractionDigits: 2 })}k` : '₦3,468.96k',
          amountLabel: 'Current Month Collections',
          count: totalRecentHeadcount ? totalRecentHeadcount.toLocaleString() : '1,250',
          countLabel: 'Current Sanctuary Worshippers'
        };
    }
  }, [timeframe, totalInflow, totalRecentHeadcount]);

  // Ledger rows combining recent service attendance and financial transactions
  const combinedLedger = useMemo(() => {
    const list: Array<{
      id: string;
      code: string;
      title: string;
      category: string;
      value: string;
      rawAmount: number;
      date: string;
      status: 'Process' | 'Open' | 'On Hold' | 'Verified' | 'Completed';
      statusColor: string;
    }> = [];

    // Financial records
    finances.slice(0, 10).forEach((f, idx) => {
      const code = f.reference_code || `TXN-${12380 + idx}`;
      const isOutflow = f.transaction_type === 'outflow';
      list.push({
        id: `fin-${f.id}`,
        code,
        title: f.donor_or_payee || f.notes || f.category,
        category: isOutflow ? 'Facility Outflow' : f.category,
        value: `₦${Number(f.amount).toLocaleString('en-NG')}`,
        rawAmount: Number(f.amount),
        date: f.transaction_date,
        status: isOutflow ? 'Process' : 'Open',
        statusColor: isOutflow ? 'bg-[#ea1263] text-white' : 'bg-[#8b5cf6] text-white'
      });
    });

    // Attendance records
    serviceAttendance.slice(0, 8).forEach((s, idx) => {
      const code = `SRV-${12390 + idx}`;
      const isPrayer = (s.service_type || '').includes('prayer') || s.service_name.toLowerCase().includes('prayer');
      const isBible = (s.service_type || '').includes('bible') || s.service_name.toLowerCase().includes('bible');
      const status = isPrayer ? 'On Hold' : isBible ? 'Completed' : 'Process';
      const statusColor = isPrayer
        ? 'bg-[#3b82f6] text-white'
        : isBible
        ? 'bg-[#10b981] text-white'
        : 'bg-[#ea1263] text-white';

      list.push({
        id: `att-${s.id}`,
        code,
        title: s.service_name,
        category: isPrayer ? 'Prayer Meeting' : isBible ? 'Bible Study' : 'Sanctuary Attendance',
        value: `${s.total_count.toLocaleString()} Worshippers`,
        rawAmount: s.total_count,
        date: s.service_date,
        status,
        statusColor
      });
    });

    // Fallback seed rows if database is empty
    if (list.length === 0) {
      return [
        { id: '1', code: '12386', title: '1st Sunday Service (7:30 AM)', category: 'Sanctuary Attendance', value: '680 Worshippers', rawAmount: 680, date: '2026-10-25', status: 'Process', statusColor: 'bg-[#ea1263] text-white' },
        { id: '2', code: '12385', title: 'Bro. David Okafor (Tithe)', category: 'Covenant Tithes', value: '₦250,000', rawAmount: 250000, date: '2026-10-25', status: 'Open', statusColor: 'bg-[#8b5cf6] text-white' },
        { id: '3', code: '12384', title: 'Wednesday Hour of Power', category: 'Prayer Meeting', value: '285 Worshippers', rawAmount: 285, date: '2026-10-21', status: 'On Hold', statusColor: 'bg-[#3b82f6] text-white' },
        { id: '4', code: '12383', title: 'Mushin Diesel & Generator Ops', category: 'Facility Outflow', value: '₦185,000', rawAmount: 185000, date: '2026-10-20', status: 'Process', statusColor: 'bg-[#f59e0b] text-white' },
        { id: '5', code: '12382', title: 'Thursday Digging Deep', category: 'Bible Study', value: '210 Worshippers', rawAmount: 210, date: '2026-10-15', status: 'Completed', statusColor: 'bg-[#10b981] text-white' }
      ];
    }

    // Sort by date desc
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [finances, serviceAttendance]);

  const filteredLedger = useMemo(() => {
    if (!searchQuery.trim()) return combinedLedger;
    const q = searchQuery.toLowerCase();
    return combinedLedger.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.value.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [combinedLedger, searchQuery]);

  const pageSize = 5;
  const paginatedLedger = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLedger.slice(start, start + pageSize);
  }, [filteredLedger, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLedger.length / pageSize));

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Invoice / Ref', 'Title / Customer', 'Category', 'Amount / Worshippers', 'Date', 'Status'];
    const rows = filteredLedger.map((r) => [r.code, `"${r.title}"`, `"${r.category}"`, `"${r.value}"`, r.date, r.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FGC_Mushin_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Donut chart calculations
  const circumference = 2 * Math.PI * 65; // ~408.4
  const womenStroke = (demographics.womenPct / 100) * circumference;
  const menStroke = (demographics.menPct / 100) * circumference;
  const childrenStroke = (demographics.childrenPct / 100) * circumference;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto text-[#2b2f38]">
      {/* ======================================================== */}
      {/* ROW 1: MAIN METRIC & WAVE CHART + TRAFFIC DONUT CHART    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Chart Card (approx 68% / 8 columns) */}
        <div className="lg:col-span-8 bg-white rounded-[22px] p-6 border border-[#f0e4f3] shadow-[0_4px_24px_rgba(235,18,119,0.04)] flex flex-col justify-between">
          <div>
            {/* Header with Title and Timeframe Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#1f2430] tracking-tight">Dashboard</h2>
                <p className="text-[11px] text-[#9096a2] font-medium mt-0.5">Overview of Latest Month</p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Timeframe Tabs */}
                <div className="flex items-center gap-4 text-[11px] font-bold text-[#8a919e] uppercase tracking-wider">
                  {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as Timeframe[]).map((tab) => {
                    const isActive = timeframe === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setTimeframe(tab)}
                        className={`pb-1 transition-all relative cursor-pointer ${
                          isActive ? 'text-[#ea1263] font-black' : 'hover:text-[#4b5262]'
                        }`}
                      >
                        {tab}
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ea1263] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend Dots */}
                <div className="flex items-center gap-3 text-[11px] font-semibold text-[#7c8392]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#06b6d4]"></span>
                    <span>Online / Tithes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                    <span>Store / Offerings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Metric Header Numbers */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 pb-3">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#1b212f] tracking-tight">
                  {mainMetric.amount}
                </div>
                <div className="text-[11px] font-semibold text-[#8b92a0] mt-0.5">
                  {mainMetric.amountLabel}
                </div>

                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black text-[#1b212f] tracking-tight">
                    {mainMetric.count}
                  </div>
                  <div className="text-[11px] font-semibold text-[#8b92a0] mt-0.5">
                    {mainMetric.countLabel}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSetActiveTab('finances')}
                  className="mt-4 px-4 py-2 rounded-full bg-[#ea1263] hover:bg-[#d80f58] text-white text-xs font-bold shadow-md shadow-[#ea1263]/25 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Last Month Summary</span>
                </button>
              </div>

              {/* Interactive Multi-Wave Curved SVG Area Chart */}
              <div className="flex-1 min-w-[280px] max-w-[560px] h-[190px] relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 540 180" preserveAspectRatio="none">
                  <defs>
                    {/* Pink/Magenta Wave Gradient */}
                    <linearGradient id="wavePinkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ea1263" stopOpacity="0.45" />
                      <stop offset="70%" stopColor="#ea1263" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#ea1263" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Orange/Amber Wave Gradient */}
                    <linearGradient id="waveOrangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                      <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Y-Axis Grid Lines & Numbers */}
                  {[
                    { y: 20, label: '35' },
                    { y: 50, label: '30' },
                    { y: 80, label: '20' },
                    { y: 110, label: '15' },
                    { y: 140, label: '10' },
                    { y: 170, label: '0' }
                  ].map((grid, idx) => (
                    <g key={idx}>
                      <text x="5" y={grid.y + 3} fill="#b2b8c2" fontSize="9" fontWeight="600" textAnchor="start">
                        {grid.label}
                      </text>
                      <line x1="28" y1={grid.y} x2="540" y2={grid.y} stroke="#f3edf6" strokeDasharray="3 3" strokeWidth="1" />
                    </g>
                  ))}

                  {/* Wave 2: Orange/Amber Area Fill & Smooth Curve */}
                  <path
                    d="M 30,170 
                       C 80,140 100,105 140,105 
                       C 180,105 200,130 240,130 
                       C 280,130 310,95 350,95 
                       C 400,95 430,125 470,125 
                       C 500,125 520,75 540,85 
                       L 540,170 Z"
                    fill="url(#waveOrangeGradient)"
                  />
                  <path
                    d="M 30,170 
                       C 80,140 100,105 140,105 
                       C 180,105 200,130 240,130 
                       C 280,130 310,95 350,95 
                       C 400,95 430,125 470,125 
                       C 500,125 520,75 540,85"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Dot on Orange Curve at peak */}
                  <circle cx="350" cy="95" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />

                  {/* Wave 1: Pink/Magenta Area Fill & Smooth Curve */}
                  <path
                    d="M 30,170 
                       C 80,165 110,160 150,160 
                       C 190,160 210,150 250,150 
                       C 290,150 320,130 350,130 
                       C 390,130 420,120 460,120 
                       C 480,120 500,30 520,40 
                       C 530,45 535,120 540,140 
                       L 540,170 Z"
                    fill="url(#wavePinkGradient)"
                  />
                  <path
                    d="M 30,170 
                       C 80,165 110,160 150,160 
                       C 190,160 210,150 250,150 
                       C 290,150 320,130 350,130 
                       C 390,130 420,120 460,120 
                       C 480,120 500,30 520,40 
                       C 530,45 535,120 540,140"
                    fill="none"
                    stroke="#ea1263"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Dot on Pink Curve at peak */}
                  <circle cx="520" cy="40" r="4.5" fill="#ea1263" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* X-Axis Month Labels */}
                <div className="flex justify-between pl-7 pr-1 text-[10px] font-bold text-[#a0a6b4] mt-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row of 4 Circular Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#f4edf7] mt-3">
            {/* Stat 1: Wallet Balance / Tithes */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#ea1263] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#ea1263]/30">
                <Crown size={15} />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#8a919e] uppercase">Wallet Balance</div>
                <div className="text-xs font-black text-[#1b212f]">
                  {totalTithes ? `₦${(totalTithes / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k` : '₦4,567.53k'}
                </div>
              </div>
            </div>

            {/* Stat 2: Pastoral Welfare */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#8b5cf6]/30">
                <Heart size={15} />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#8a919e] uppercase">Pastoral Welfare</div>
                <div className="text-xs font-black text-[#1b212f]">
                  {totalWelfareOutflow ? `₦${(totalWelfareOutflow / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k` : '₦1,689.53k'}
                </div>
              </div>
            </div>

            {/* Stat 3: Building Fund */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#06b6d4] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#06b6d4]/30">
                <TrendingUp size={15} />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#8a919e] uppercase">Building Fund</div>
                <div className="text-xs font-black text-[#1b212f]">
                  {totalBuildingFund ? `₦${(totalBuildingFund / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k` : '₦2,851.53k'}
                </div>
              </div>
            </div>

            {/* Stat 4: Missions & Outreach */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#f59e0b]/30">
                <Flame size={15} />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#8a919e] uppercase">Global Missions</div>
                <div className="text-xs font-black text-[#1b212f]">
                  {totalMissions ? `₦${(totalMissions / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k` : '₦52,567.53k'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Traffic / Congregational Demographics Donut (approx 32% / 4 columns) */}
        <div className="lg:col-span-4 bg-white rounded-[22px] p-6 border border-[#f0e4f3] shadow-[0_4px_24px_rgba(235,18,119,0.04)] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#1f2430] tracking-tight">Traffic</h2>
            <p className="text-[11px] text-[#9096a2] font-medium mt-0.5">Sanctuary Fellowship Demographics</p>
          </div>

          {/* SVG Donut Chart */}
          <div className="my-6 flex items-center justify-center relative">
            <svg width="190" height="190" viewBox="0 0 190 190" className="transform -rotate-90">
              {/* Background circle track */}
              <circle
                cx="95"
                cy="95"
                r="65"
                fill="none"
                stroke="#f7f2f9"
                strokeWidth="24"
              />

              {/* Segment 1: Women Fellowship (Pink) */}
              <circle
                cx="95"
                cy="95"
                r="65"
                fill="none"
                stroke="#ea1263"
                strokeWidth="24"
                strokeDasharray={`${womenStroke} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />

              {/* Segment 2: Men Fellowship (Purple) */}
              <circle
                cx="95"
                cy="95"
                r="65"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="24"
                strokeDasharray={`${menStroke} ${circumference}`}
                strokeDashoffset={`-${womenStroke}`}
                strokeLinecap="round"
              />

              {/* Segment 3: Children / Youth (Yellow/Gold) */}
              <circle
                cx="95"
                cy="95"
                r="65"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="24"
                strokeDasharray={`${childrenStroke} ${circumference}`}
                strokeDashoffset={`-${womenStroke + menStroke}`}
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Donut Chart Legend Percentages */}
          <div className="grid grid-cols-3 text-center pt-2 border-t border-[#f4edf7]">
            <div>
              <div className="text-base font-black text-[#1b212f]">{demographics.menPct}%</div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#8a919e] mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
                <span>Men</span>
              </div>
            </div>

            <div>
              <div className="text-base font-black text-[#ea1263]">{demographics.womenPct}%</div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#8a919e] mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#ea1263]"></span>
                <span>Women</span>
              </div>
            </div>

            <div>
              <div className="text-base font-black text-[#1b212f]">{demographics.childrenPct}%</div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#8a919e] mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                <span>Children</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 2: 4 VIBRANT GRADIENT CARDS WITH SPARKLINES          */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pink Gradient - Revenue Status */}
        <div className="rounded-[20px] p-5 text-white shadow-lg shadow-[#ea1263]/20 relative overflow-hidden bg-gradient-to-r from-[#e1147a] to-[#f43f5e] flex flex-col justify-between h-[135px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/90">
            Revenue Status
          </div>

          <div className="flex items-end justify-between">
            {/* 5-bar vertical sparkline */}
            <div className="flex items-end gap-1.5 h-10 pb-1">
              <span className="w-2 h-4 bg-white/75 rounded-sm"></span>
              <span className="w-2 h-7 bg-white/95 rounded-sm"></span>
              <span className="w-2 h-3 bg-white/60 rounded-sm"></span>
              <span className="w-2 h-9 bg-white rounded-sm"></span>
              <span className="w-2 h-6 bg-white/80 rounded-sm"></span>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black tracking-tight text-white">$ 432</div>
              <div className="text-[10px] font-medium text-white/80 mt-0.5">Jan 01 - Jan 10</div>
            </div>
          </div>
        </div>

        {/* Card 2: Deep Purple/Indigo Gradient - Page View / Sanctuary Headcount */}
        <div className="rounded-[20px] p-5 text-white shadow-lg shadow-[#6366f1]/20 relative overflow-hidden bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] flex flex-col justify-between h-[135px]">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/90">
              Page View
            </div>
            <div className="text-2xl font-black tracking-tight text-white mt-1">
              {totalRecentHeadcount ? totalRecentHeadcount.toLocaleString() : '$ 432'}
            </div>
          </div>

          {/* Smooth SVG Mountain Fill at bottom */}
          <div className="absolute -bottom-1 left-0 right-0 h-14 pointer-events-none">
            <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-full opacity-35">
              <path
                d="M 0,40 Q 50,10 100,30 T 200,20 L 200,60 L 0,60 Z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Cyan/Sky Blue Gradient - Bounce Rate / Midweek Telemetry */}
        <div className="rounded-[20px] p-5 text-white shadow-lg shadow-[#06b6d4]/20 relative overflow-hidden bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] flex flex-col justify-between h-[135px]">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/90">
              Bounce Rate
            </div>
            <div className="text-2xl font-black tracking-tight text-white mt-1">
              {midweekHeadcount ? midweekHeadcount.toLocaleString() : '$ 432'}
            </div>
          </div>

          <div className="flex items-center justify-between z-10">
            {/* Dropdown pill */}
            <button
              type="button"
              onClick={() => setBouncePeriod(bouncePeriod === 'Monthly' ? 'Weekly' : 'Monthly')}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{bouncePeriod}</span>
              <ChevronDown size={12} />
            </button>

            {/* Line Sparkline with Dots */}
            <svg width="85" height="26" viewBox="0 0 85 26" className="overflow-visible">
              <path
                d="M 2,18 Q 18,2 35,16 T 70,8 L 83,16"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="2" cy="18" r="2.5" fill="#ffffff" />
              <circle cx="35" cy="16" r="2.5" fill="#ffffff" />
              <circle cx="70" cy="8" r="2.5" fill="#ffffff" />
              <circle cx="83" cy="16" r="2.5" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* Card 4: Warm Amber/Orange Gradient - Revenue Status / First Timers */}
        <div className="rounded-[20px] p-5 text-white shadow-lg shadow-[#f59e0b]/20 relative overflow-hidden bg-gradient-to-r from-[#f59e0b] to-[#ea580c] flex flex-col justify-between h-[135px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/90">
            Revenue Status
          </div>

          <div className="flex items-end justify-between">
            {/* 5-bar vertical sparkline */}
            <div className="flex items-end gap-1.5 h-10 pb-1">
              <span className="w-2 h-8 bg-white rounded-sm"></span>
              <span className="w-2 h-4 bg-white/70 rounded-sm"></span>
              <span className="w-2 h-9 bg-white/95 rounded-sm"></span>
              <span className="w-2 h-5 bg-white/80 rounded-sm"></span>
              <span className="w-2 h-7 bg-white/85 rounded-sm"></span>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black tracking-tight text-white">
                {guestVisits.length ? `${guestVisits.length} Souls` : '$ 432'}
              </div>
              <div className="text-[10px] font-medium text-white/80 mt-0.5">Jan 01 - Jan 10</div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 3: RECENT ACTIVITIES + ORDER STATUS LEDGER TABLE    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Recent Activities (approx 35% / 4-5 columns) */}
        <div className="lg:col-span-5 bg-white rounded-[22px] p-6 border border-[#f0e4f3] shadow-[0_4px_24px_rgba(235,18,119,0.04)]">
          <h2 className="text-base font-extrabold text-[#1f2430] tracking-tight mb-5">
            Recent Activities
          </h2>

          <div className="space-y-4">
            {/* Activity 1: Pink */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-[11px] font-semibold text-[#8b919e] w-18 shrink-0">42 Mins Ago</span>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#ea1263] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#ea1263]/30">
                  <Activity size={14} />
                </div>
                <div className="truncate">
                  <div className="font-bold text-[#1f2430] truncate">Task Updated</div>
                  <div className="text-[11px] text-[#8b919e] truncate">Bro. Emmanuel Kalu Logged Service Headcount</div>
                </div>
              </div>
            </div>

            {/* Activity 2: Purple */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-[11px] font-semibold text-[#8b919e] w-18 shrink-0">1 day Ago</span>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#8b5cf6]/30">
                  <Heart size={14} />
                </div>
                <div className="truncate">
                  <div className="font-bold text-[#1f2430] truncate">Deal Added</div>
                  <div className="text-[11px] text-[#8b919e] truncate">
                    {prayerRequests.length ? `${prayerRequests.length} Prayer Petitions in Care Desk` : 'Purohi Updated a Task'}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity 3: Cyan */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-[11px] font-semibold text-[#8b919e] w-18 shrink-0">42 Mins Ago</span>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#06b6d4] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#06b6d4]/30">
                  <BookOpen size={14} />
                </div>
                <div className="truncate">
                  <div className="font-bold text-[#1f2430] truncate">Published Article</div>
                  <div className="text-[11px] text-[#8b919e] truncate">
                    {sermons.length ? `${sermons.length} Sermons Cataloged in Series` : 'Raasi Published a Article'}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity 4: Amber */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-[11px] font-semibold text-[#8b919e] w-18 shrink-0">1 day Ago</span>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#f59e0b]/30">
                  <Wallet size={14} />
                </div>
                <div className="truncate">
                  <div className="font-bold text-[#1f2430] truncate">Dock Updated</div>
                  <div className="text-[11px] text-[#8b919e] truncate">Reshmi Updated a Dock</div>
                </div>
              </div>
            </div>

            {/* Activity 5: Green */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-[11px] font-semibold text-[#8b919e] w-18 shrink-0">1 day Ago</span>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#10b981]/30">
                  <CheckCircle2 size={14} />
                </div>
                <div className="truncate">
                  <div className="font-bold text-[#1f2430] truncate">Replied Comment</div>
                  <div className="text-[11px] text-[#8b919e] truncate">Jenathon Added a Comment</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Order Status / Church Operations Ledger Table (approx 65% / 7 columns) */}
        <div className="lg:col-span-7 bg-white rounded-[22px] p-6 border border-[#f0e4f3] shadow-[0_4px_24px_rgba(235,18,119,0.04)] flex flex-col justify-between">
          <div>
            {/* Header & Subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#1f2430] tracking-tight">Order Status</h2>
                <p className="text-[11px] text-[#9096a2] font-medium mt-0.5">Overview of Latest Month</p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAddChoiceModal(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#ea1263] hover:bg-[#d80f58] text-white text-xs font-bold shadow-sm shadow-[#ea1263]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} strokeWidth={3} />
                  <span>Add</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSetActiveTab('audit_logs')}
                  title="View Audit Trail"
                  className="w-7 h-7 rounded-lg border border-[#e8dfec] text-[#8b919e] hover:text-[#1f2430] hover:bg-[#faf4fc] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Info size={13} />
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  title="Export CSV"
                  className="w-7 h-7 rounded-lg border border-[#e8dfec] text-[#8b919e] hover:text-[#1f2430] hover:bg-[#faf4fc] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Download size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => onSetActiveTab('iam_staff')}
                  title="Security Lock"
                  className="w-7 h-7 rounded-lg border border-[#e8dfec] text-[#8b919e] hover:text-[#1f2430] hover:bg-[#faf4fc] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Lock size={13} />
                </button>

                {/* Search Input Box */}
                <div className="relative ml-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    className="w-28 sm:w-36 pl-7 pr-2.5 py-1 text-xs rounded-lg bg-[#f7f2f9] border border-transparent focus:border-[#ea1263] focus:bg-white outline-none text-[#1b212f] placeholder-[#a6acb8] transition-all"
                  />
                  <Search size={12} className="absolute left-2.5 top-2 text-[#9da3af]" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1b2234] text-white text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-lg">INVOICE</th>
                    <th className="py-2.5 px-3">CUSTOMERS</th>
                    <th className="py-2.5 px-3">FROM</th>
                    <th className="py-2.5 px-3">PRICE</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5eef7] text-[#2b2f38]">
                  {paginatedLedger.length > 0 ? (
                    paginatedLedger.map((row) => (
                      <tr key={row.id} className="hover:bg-[#fbf7fc] transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#666d7c] whitespace-nowrap">
                          {row.code}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#1f2430] max-w-[180px] truncate">
                          {row.title}
                        </td>
                        <td className="py-3 px-3 text-[#666d7c] whitespace-nowrap">
                          {row.category}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#1f2430] whitespace-nowrap">
                          {row.value}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold capitalize ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-[#9aa0ae]">
                        No matching ledger records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer & Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#f4edf7] mt-3 text-[11px] text-[#8a919e] font-semibold">
            <div>
              Showing {filteredLedger.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredLedger.length)} of {filteredLedger.length} entries
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-6 h-6 flex items-center justify-center rounded text-[#8b919e] hover:text-[#1f2430] disabled:opacity-40 cursor-pointer"
              >
                &lt;
              </button>

              {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map((pg) => {
                const isActive = pg === currentPage;
                return (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#ea1263] text-white shadow-sm shadow-[#ea1263]/40'
                        : 'text-[#8b919e] hover:text-[#1f2430]'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-6 h-6 flex items-center justify-center rounded text-[#8b919e] hover:text-[#1f2430] disabled:opacity-40 cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK CHOICE MODAL: RECORD FINANCIAL OR LOG ATTENDANCE    */}
      {/* ======================================================== */}
      {showAddChoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#f0e4f3] shadow-2xl text-[#1f2430] animate-fade-in">
            <h3 className="text-base font-extrabold mb-1">Select Action to Record</h3>
            <p className="text-xs text-[#8a919e] mb-4">
              Post a verified entry into the FGC Mushin database.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowAddChoiceModal(false);
                  if (onOpenRecordFinanceModal) onOpenRecordFinanceModal();
                  else onSetActiveTab('finances');
                }}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-[#ea1263] to-[#f43f5e] text-white font-bold text-xs flex items-center gap-3 shadow-md shadow-[#ea1263]/25 cursor-pointer"
              >
                <Wallet size={16} />
                <div className="text-left">
                  <div>Record Financial Transaction</div>
                  <div className="text-[10px] text-white/80 font-normal">Tithe, Offering, Welfare, Outflow</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddChoiceModal(false);
                  if (onOpenLogAttendanceModal) onOpenLogAttendanceModal();
                  else onSetActiveTab('attendance');
                }}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white font-bold text-xs flex items-center gap-3 shadow-md shadow-[#8b5cf6]/25 cursor-pointer"
              >
                <Users size={16} />
                <div className="text-left">
                  <div>Log Service Headcount</div>
                  <div className="text-[10px] text-white/80 font-normal">Sunday Services, Prayer Meetings, Bible Studies</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowAddChoiceModal(false)}
                className="w-full py-2 text-center text-xs font-bold text-[#8a919e] hover:text-[#1f2430] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
