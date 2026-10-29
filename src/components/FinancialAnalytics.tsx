import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Wallet,
  Receipt,
  Download,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import type { ChurchFinanceRow } from '../types/database';
import { logFinancialTransaction } from '../lib/supabase';

interface FinancialAnalyticsProps {
  finances: ChurchFinanceRow[];
  activeRole: string;
  onRefresh: () => Promise<void>;
  onShowNotice: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

type PeriodFilter = 'daily' | 'weekly' | 'monthly' | 'all';
type TypeFilter = 'all' | 'inflow' | 'outflow';

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  tithes: { label: 'Covenant Tithes', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  sunday_offering: { label: 'Sunday Celebration Offering', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  midweek_offering: { label: 'Midweek Offering (Prayer/Study)', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  thanksgiving: { label: 'Thanksgiving & Testimonies', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  building_fund: { label: 'Building & Capital Project', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  missions: { label: 'Missions & Evangelism', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  special_pledge: { label: 'Special Pledges & Harvest', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
  operations_power: { label: 'Diesel & Generator Power (Mushin)', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  ministry_honorarium: { label: 'Pulpit & Ministry Honorarium', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  facility_maintenance: { label: 'Sanctuary & AC Maintenance', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  welfare_benevolence: { label: 'Welfare & Community Relief', color: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
  audio_visual_tech: { label: 'Audio-Visual & Media Tech', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  district_remittance: { label: 'District Council Assessment', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

export const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({
  finances,
  activeRole,
  onRefresh,
  onShowNotice
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('monthly');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for logging transactions
  const [newTxn, setNewTxn] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: 'inflow' as 'inflow' | 'outflow',
    category: 'tithes',
    amount: '',
    payment_method: 'bank_transfer',
    donor_or_payee: '',
    reference_code: '',
    notes: ''
  });

  // Calculate current date boundaries
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter records by period
  const periodFilteredRecords = useMemo(() => {
    const now = new Date();
    return finances.filter(item => {
      const itemDate = new Date(item.transaction_date);
      if (period === 'daily') {
        // Last 7 days
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
      return true; // all
    });
  }, [finances, period]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let tithesTotal = 0;
    let sundayOfferingTotal = 0;
    let midweekOfferingTotal = 0;
    let buildingFundTotal = 0;
    let powerDieselTotal = 0;
    let welfareTotal = 0;

    periodFilteredRecords.forEach(rec => {
      const amt = Number(rec.amount) || 0;
      if (rec.transaction_type === 'inflow') {
        totalInflow += amt;
        if (rec.category === 'tithes') tithesTotal += amt;
        if (rec.category === 'sunday_offering') sundayOfferingTotal += amt;
        if (rec.category === 'midweek_offering') midweekOfferingTotal += amt;
        if (rec.category === 'building_fund') buildingFundTotal += amt;
      } else {
        totalOutflow += amt;
        if (rec.category === 'operations_power') powerDieselTotal += amt;
        if (rec.category === 'welfare_benevolence') welfareTotal += amt;
      }
    });

    const netPosition = totalInflow - totalOutflow;
    const margin = totalInflow > 0 ? Math.round((netPosition / totalInflow) * 100) : 0;
    const sundayOfferingsCount = periodFilteredRecords.filter(r => r.category === 'sunday_offering').length;
    const avgSundayOffering = sundayOfferingsCount > 0 ? Math.round(sundayOfferingTotal / sundayOfferingsCount) : 0;

    return {
      totalInflow,
      totalOutflow,
      netPosition,
      margin,
      tithesTotal,
      sundayOfferingTotal,
      midweekOfferingTotal,
      buildingFundTotal,
      powerDieselTotal,
      welfareTotal,
      avgSundayOffering,
      inflowCount: periodFilteredRecords.filter(r => r.transaction_type === 'inflow').length,
      outflowCount: periodFilteredRecords.filter(r => r.transaction_type === 'outflow').length
    };
  }, [periodFilteredRecords]);

  // Visual Chart Data: Group by time bucket based on period
  const chartData = useMemo(() => {
    const buckets: Record<string, { label: string; inflow: number; outflow: number }> = {};

    periodFilteredRecords.forEach(rec => {
      const date = new Date(rec.transaction_date);
      let key = '';
      let label = '';

      if (period === 'daily') {
        key = rec.transaction_date;
        label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      } else if (period === 'weekly') {
        // Group by Sunday week
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? 0 : 7); // nearest sunday
        const sun = new Date(date);
        sun.setDate(diff);
        key = sun.toISOString().split('T')[0];
        label = `Wk of ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else {
        // Monthly
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      if (!buckets[key]) {
        buckets[key] = { label, inflow: 0, outflow: 0 };
      }

      const amt = Number(rec.amount) || 0;
      if (rec.transaction_type === 'inflow') {
        buckets[key].inflow += amt;
      } else {
        buckets[key].outflow += amt;
      }
    });

    // Sort chronologically ascending
    const sortedKeys = Object.keys(buckets).sort();
    return sortedKeys.map(k => buckets[k]);
  }, [periodFilteredRecords, period]);

  const maxChartValue = useMemo(() => {
    let max = 1;
    chartData.forEach(d => {
      if (d.inflow > max) max = d.inflow;
      if (d.outflow > max) max = d.outflow;
    });
    return max;
  }, [chartData]);

  // Category distribution breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    periodFilteredRecords.forEach(r => {
      const amt = Number(r.amount) || 0;
      map[r.category] = (map[r.category] || 0) + amt;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [periodFilteredRecords]);

  // Filtered rows for the ledger table
  const displayedRows = useMemo(() => {
    return periodFilteredRecords.filter(rec => {
      if (typeFilter !== 'all' && rec.transaction_type !== typeFilter) return false;
      if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDonor = (rec.donor_or_payee || '').toLowerCase().includes(q);
        const matchesRef = (rec.reference_code || '').toLowerCase().includes(q);
        const matchesNotes = (rec.notes || '').toLowerCase().includes(q);
        const matchesCat = (CATEGORY_LABELS[rec.category]?.label || '').toLowerCase().includes(q);
        if (!matchesDonor && !matchesRef && !matchesNotes && !matchesCat) return false;
      }
      return true;
    });
  }, [periodFilteredRecords, typeFilter, categoryFilter, searchQuery]);

  // Handle transaction creation
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newTxn.amount);
    if (isNaN(amt) || amt <= 0) {
      onShowNotice('Please enter a valid positive amount in Naira (₦)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await logFinancialTransaction({
        transaction_date: newTxn.transaction_date,
        transaction_type: newTxn.transaction_type,
        category: newTxn.category,
        amount: amt,
        payment_method: newTxn.payment_method,
        donor_or_payee: newTxn.donor_or_payee || undefined,
        reference_code: newTxn.reference_code || undefined,
        notes: newTxn.notes || undefined,
        recorded_by: `${activeRole.replace('_', ' ').toUpperCase()} Desk`
      });

      if (res.success) {
        onShowNotice(`₦${amt.toLocaleString()} recorded successfully under ${newTxn.category}.`, 'success');
        setIsModalOpen(false);
        setNewTxn({
          transaction_date: todayStr,
          transaction_type: 'inflow',
          category: 'tithes',
          amount: '',
          payment_method: 'bank_transfer',
          donor_or_payee: '',
          reference_code: '',
          notes: ''
        });
        await onRefresh();
      } else {
        onShowNotice(`Failed to record transaction: ${res.error}`, 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onShowNotice(`Error: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (displayedRows.length === 0) {
      onShowNotice('No transaction records to export in the selected filter.', 'info');
      return;
    }
    const headers = ['Date', 'Type', 'Category', 'Amount (NGN)', 'Payment Method', 'Payer/Payee', 'Reference', 'Notes', 'Recorded By'];
    const rows = displayedRows.map(r => [
      r.transaction_date,
      r.transaction_type.toUpperCase(),
      CATEGORY_LABELS[r.category]?.label || r.category,
      r.amount,
      r.payment_method,
      `"${(r.donor_or_payee || 'Anonymous').replace(/"/g, '""')}"`,
      r.reference_code || '',
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      r.recorded_by
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FGC_Mushin_Treasury_${period}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowNotice(`Exported ${displayedRows.length} financial transactions to CSV.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              District Financial Management
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs text-slate-400 font-mono">FGC Mushin DHQ Accounts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Treasury & Financial Analytics
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Audit-grade financial telemetry across daily collections, weekly Sunday offerings, covenant tithes, and capital project reserves.
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
                    ? 'bg-emerald-600 text-white shadow-sm'
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
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Record Entry</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Inflow (Revenue)</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            ₦{metrics.totalInflow.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{metrics.inflowCount} collections recorded</span>
            <span className="text-emerald-400 font-semibold">{period.toUpperCase()}</span>
          </div>
        </div>

        {/* Total Outflow */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operational Disbursements</span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono tracking-tight">
            ₦{metrics.totalOutflow.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{metrics.outflowCount} expense vouchers</span>
            <span className="text-rose-400 font-semibold">Diesel, Honorarium, Maint.</span>
          </div>
        </div>

        {/* Net Treasury Position */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Treasury Position</span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${metrics.netPosition >= 0 ? 'text-white' : 'text-rose-400'}`}>
            ₦{metrics.netPosition.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {metrics.margin}% Net Surplus Margin
            </span>
            <span className="text-slate-400">Reserve</span>
          </div>
        </div>

        {/* Covenant Tithes Volume */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Covenant Tithes Volume</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono tracking-tight">
            ₦{metrics.tithesTotal.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>
              {metrics.totalInflow > 0 ? Math.round((metrics.tithesTotal / metrics.totalInflow) * 100) : 0}% of Total Inflow
            </span>
            <span className="text-purple-400 font-semibold">Tenths</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Inflow vs Outflow Chart + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Inflow vs Outflow Comparison Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  {period === 'daily' ? 'Daily Cashflow Stream' : period === 'weekly' ? 'Weekly Collections vs Disbursements' : 'Monthly Financial Trajectory'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparing revenue inflows (emerald) vs operational expenditures (rose)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Inflows
                </span>
                <span className="inline-flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Outflows
                </span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              {chartData.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No transaction data available for the selected {period} timeframe.
                </div>
              ) : (
                <div className="space-y-4">
                  {chartData.map((d, idx) => {
                    const inflowPct = Math.round((d.inflow / maxChartValue) * 100);
                    const outflowPct = Math.round((d.outflow / maxChartValue) * 100);

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300 font-mono text-[11px]">{d.label}</span>
                          <div className="flex items-center gap-3 text-[11px] font-mono">
                            <span className="text-emerald-400">+₦{d.inflow.toLocaleString()}</span>
                            <span className="text-rose-400">-₦{d.outflow.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Dual stacked/comparison bars */}
                        <div className="grid grid-cols-2 gap-2 h-4 bg-slate-950 rounded-lg p-0.5 border border-slate-800/80">
                          {/* Inflow bar */}
                          <div className="flex items-center h-full">
                            <div
                              style={{ width: `${Math.max(4, inflowPct)}%` }}
                              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-md transition-all duration-500"
                              title={`Inflow: ₦${d.inflow.toLocaleString()}`}
                            />
                          </div>
                          {/* Outflow bar */}
                          <div className="flex items-center h-full">
                            <div
                              style={{ width: `${Math.max(4, outflowPct)}%` }}
                              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-md transition-all duration-500"
                              title={`Outflow: ₦${d.outflow.toLocaleString()}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Average Sunday Collections: <strong className="text-white">₦{metrics.avgSundayOffering.toLocaleString()}</strong></span>
            <span>Total Ledger Volume: <strong className="text-emerald-400">{periodFilteredRecords.length} records</strong></span>
          </div>
        </div>

        {/* Category Breakdown & Funds Meter */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                Fund Distribution
              </h3>
              <span className="text-[11px] text-slate-400">{period.toUpperCase()}</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Allocation of offerings, tithes, building projects, and community relief.
            </p>

            <div className="space-y-3.5">
              {categoryBreakdown.slice(0, 6).map(([catKey, amt]) => {
                const totalBase = metrics.totalInflow + metrics.totalOutflow;
                const pct = totalBase > 0 ? Math.round((amt / totalBase) * 100) : 0;
                const meta = CATEGORY_LABELS[catKey] || { label: catKey, color: 'bg-slate-700 text-slate-300' };

                return (
                  <div key={catKey} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[180px]">{meta.label}</span>
                      <span className="font-mono font-bold text-white">₦{amt.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Building Project: <strong className="text-indigo-400">₦{metrics.buildingFundTotal.toLocaleString()}</strong></span>
            <span>Diesel/Power: <strong className="text-rose-400">₦{metrics.powerDieselTotal.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Financial Transaction Ledger</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-800 text-slate-300">
              {displayedRows.length} entries
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search payer, ref, memo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Types (In & Out)</option>
              <option value="inflow">Inflow (Collections/Tithes)</option>
              <option value="outflow">Outflow (Disbursements)</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 max-w-[160px]"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category / Fund</th>
                <th className="py-3 px-3">Payer / Beneficiary</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Reference / Slip</th>
                <th className="py-3 px-3">Narration / Memo</th>
                <th className="py-3 px-3 text-right">Amount (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                displayedRows.map(rec => {
                  const isInflow = rec.transaction_type === 'inflow';
                  const catMeta = CATEGORY_LABELS[rec.category] || { label: rec.category, color: 'bg-slate-800 text-slate-300 border-slate-700' };

                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-300 font-mono whitespace-nowrap">
                        {rec.transaction_date}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.color}`}>
                          {catMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-white font-semibold whitespace-nowrap">
                        {rec.donor_or_payee || (isInflow ? 'Anonymous Giver' : 'General Expense')}
                      </td>
                      <td className="py-3 px-3 text-slate-400 capitalize whitespace-nowrap">
                        {rec.payment_method.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {rec.reference_code || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px] max-w-xs truncate" title={rec.notes || ''}>
                        {rec.notes || '—'}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${isInflow ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isInflow ? '+' : '-'}₦{Number(rec.amount).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Financial Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Record Financial Transaction</h3>
                  <p className="text-xs text-slate-400">Post an official collection or disbursement voucher</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewTxn({ ...newTxn, transaction_type: 'inflow', category: 'tithes' })}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    newTxn.transaction_type === 'inflow'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Inflow (Collection / Tithe)
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxn({ ...newTxn, transaction_type: 'outflow', category: 'operations_power' })}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    newTxn.transaction_type === 'outflow'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  Outflow (Expense / Voucher)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={newTxn.transaction_date}
                    onChange={(e) => setNewTxn({ ...newTxn, transaction_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Category / Fund
                  </label>
                  <select
                    value={newTxn.category}
                    onChange={(e) => setNewTxn({ ...newTxn, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {newTxn.transaction_type === 'inflow' ? (
                      <>
                        <option value="tithes">Covenant Tithes</option>
                        <option value="sunday_offering">Sunday Celebration Offering</option>
                        <option value="midweek_offering">Midweek Offering (Prayer/Study)</option>
                        <option value="thanksgiving">Thanksgiving & Testimony Seed</option>
                        <option value="building_fund">Building & Capital Project</option>
                        <option value="missions">Missions & Evangelism</option>
                        <option value="special_pledge">Special Pledges & Harvest</option>
                      </>
                    ) : (
                      <>
                        <option value="operations_power">Diesel & Generator Power (Mushin)</option>
                        <option value="ministry_honorarium">Pulpit & Ministry Honorarium</option>
                        <option value="facility_maintenance">Sanctuary & AC Maintenance</option>
                        <option value="welfare_benevolence">Welfare & Community Relief</option>
                        <option value="audio_visual_tech">Audio-Visual & Media Tech</option>
                        <option value="district_remittance">District Council Assessment</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Amount (₦ Naira)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 50000"
                    value={newTxn.amount}
                    onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newTxn.payment_method}
                    onChange={(e) => setNewTxn({ ...newTxn, payment_method: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="pos">POS Sanctuary Terminal</option>
                    <option value="cash">Cash Collection</option>
                    <option value="online">Online Giving Portal</option>
                    <option value="cheque">Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    {newTxn.transaction_type === 'inflow' ? 'Donor / Member Name' : 'Payee / Beneficiary'}
                  </label>
                  <input
                    type="text"
                    placeholder={newTxn.transaction_type === 'inflow' ? 'e.g. Elder Adebayo' : 'e.g. TotalEnergies Mushin'}
                    value={newTxn.donor_or_payee}
                    onChange={(e) => setNewTxn({ ...newTxn, donor_or_payee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Reference / Slip Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GTB-TRF-9021"
                    value={newTxn.reference_code}
                    onChange={(e) => setNewTxn({ ...newTxn, reference_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Accounting Narration / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Details regarding purpose, service event, or receipt voucher..."
                  value={newTxn.notes}
                  onChange={(e) => setNewTxn({ ...newTxn, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? 'Posting...' : 'Save & Post Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
