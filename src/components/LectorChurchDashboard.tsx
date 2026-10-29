import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Wallet,
  Users,
  Activity,
  Heart,
  Plus,
  Search,
  BookOpen,
  ChevronDown,
  Download,
  Sparkles,
  FileText,
  Calendar,
  Clock,
  Layers
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
  events = [],
  staffUsers: _staffUsers = [],
  auditLogs: _auditLogs = [],
  activeRole = 'admin',
  onSetActiveTab,
  onOpenRecordFinanceModal,
  onOpenLogAttendanceModal
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('MONTHLY');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [midweekFilter, setMidweekFilter] = useState<'All Midweek' | 'Hour of Power' | 'Digging Deep'>('All Midweek');
  const [showAddChoiceModal, setShowAddChoiceModal] = useState(false);

  // Role booleans
  const isHeadUsher = activeRole === 'head_usher';
  const isResidentPastor = activeRole === 'resident_pastor';
  const isSecretariat = activeRole === 'secretariat';
  const isDistrictOverseer = activeRole === 'district_overseer';
  const isAdmin = activeRole === 'admin';

  // Headcount & Attendance Aggregates
  const totalRecentHeadcount = useMemo(() => {
    if (!serviceAttendance.length) return 1250;
    const sundayRecords = serviceAttendance.filter((s) => (s.service_type || '').toLowerCase().includes('sunday') || s.service_name.toLowerCase().includes('service'));
    if (!sundayRecords.length) return 1250;
    return sundayRecords.slice(0, 2).reduce((sum, s) => sum + s.total_count, 0);
  }, [serviceAttendance]);

  const sunday1stServiceCount = useMemo(() => {
    const s = serviceAttendance.find((rec) => rec.service_name.includes('1st') || rec.service_name.includes('Early'));
    return s ? s.total_count : 470;
  }, [serviceAttendance]);

  const sunday2ndServiceCount = useMemo(() => {
    const s = serviceAttendance.find((rec) => rec.service_name.includes('2nd') || rec.service_name.includes('Celebration'));
    return s ? s.total_count : 780;
  }, [serviceAttendance]);

  const midweekHeadcount = useMemo(() => {
    if (midweekFilter === 'Hour of Power') {
      const hop = serviceAttendance.filter((s) => {
        const type = (s.service_type || '').toLowerCase();
        const name = s.service_name.toLowerCase();
        return type.includes('prayer') || name.includes('power');
      });
      if (!hop.length) return 240;
      return hop.reduce((sum, s) => sum + s.total_count, 0);
    }
    if (midweekFilter === 'Digging Deep') {
      const dd = serviceAttendance.filter((s) => {
        const type = (s.service_type || '').toLowerCase();
        const name = s.service_name.toLowerCase();
        return type.includes('bible') || name.includes('deep');
      });
      if (!dd.length) return 128;
      return dd.reduce((sum, s) => sum + s.total_count, 0);
    }
    const midweek = serviceAttendance.filter((s) => {
      const type = (s.service_type || '').toLowerCase();
      const name = s.service_name.toLowerCase();
      return type.includes('prayer') || type.includes('bible') || name.includes('hour of power') || name.includes('digging deep');
    });
    if (!midweek.length) return 368;
    return midweek.slice(0, 2).reduce((sum, s) => sum + s.total_count, 0);
  }, [serviceAttendance, midweekFilter]);

  // Financial aggregates (Only computed if user has financial oversight)
  const totalInflow = useMemo(() => {
    if (isHeadUsher || isResidentPastor || isSecretariat) return 0;
    return finances
      .filter((f) => f.transaction_type === 'inflow')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [finances, isHeadUsher, isResidentPastor, isSecretariat]);

  const totalTithes = useMemo(() => {
    if (isHeadUsher || isResidentPastor || isSecretariat) return 0;
    return finances
      .filter((f) => f.transaction_type === 'inflow' && (f.category.toLowerCase().includes('tithe') || f.notes?.toLowerCase().includes('tithe')))
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [finances, isHeadUsher, isResidentPastor, isSecretariat]);

  const totalBuildingFund = useMemo(() => {
    if (isHeadUsher || isResidentPastor || isSecretariat) return 0;
    return finances
      .filter((f) => f.category.toLowerCase().includes('building') || f.category.toLowerCase().includes('capital') || f.notes?.toLowerCase().includes('generator'))
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [finances, isHeadUsher, isResidentPastor, isSecretariat]);

  const totalMissions = useMemo(() => {
    if (isHeadUsher || isResidentPastor || isSecretariat) return 0;
    return finances
      .filter((f) => f.category.toLowerCase().includes('mission') || f.category.toLowerCase().includes('outreach') || f.category.toLowerCase().includes('evangelism'))
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [finances, isHeadUsher, isResidentPastor, isSecretariat]);

  const totalWelfareOutflow = useMemo(() => {
    if (isHeadUsher || isResidentPastor || isSecretariat) return 0;
    return finances
      .filter((f) => f.transaction_type === 'outflow' && (f.category.toLowerCase().includes('welfare') || f.category.toLowerCase().includes('benevolence')))
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [finances, isHeadUsher, isResidentPastor, isSecretariat]);

  // Demographics breakdown (Universal church fellowship distribution)
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

  // Dynamic Header & Metrics Config tailored strictly to active role and selected timeframe
  const roleConfig = useMemo(() => {
    if (isHeadUsher) {
      const primaryCount = 
        timeframe === 'DAILY' ? sunday1stServiceCount + sunday2ndServiceCount :
        timeframe === 'WEEKLY' ? sunday1stServiceCount + sunday2ndServiceCount + 285 :
        timeframe === 'MONTHLY' ? totalRecentHeadcount :
        Math.round(totalRecentHeadcount * 4.2);

      const primaryLabel =
        timeframe === 'DAILY' ? "Today's Sunday & Midweek Headcount" :
        timeframe === 'WEEKLY' ? "Weekly Sunday & Midweek Aggregate" :
        timeframe === 'MONTHLY' ? "Combined Sunday Sanctuary Headcount" :
        "Year-to-Date Sanctuary Worshippers Served";

      return {
        title: 'Sanctuary Ushering & Protocol Desk',
        subtitle: 'FGC Mushin District Headquarters · Service Headcount & Capacity Telemetry',
        curve1Label: '1st Service (7:30 AM)',
        curve2Label: '2nd Service (9:30 AM)',
        primaryMetric: `${primaryCount.toLocaleString()} Worshippers`,
        primaryMetricLabel: primaryLabel,
        secondaryMetric: '88% Capacity',
        secondaryMetricLabel: 'Sanctuary Hall Seating Utilization (1,400 Seats)',
        ctaLabel: 'Log Headcount',
        ctaIcon: <Activity size={13} />,
        ctaAction: () => {
          if (onOpenLogAttendanceModal) onOpenLogAttendanceModal();
          else onSetActiveTab('headcount_logger');
        },
        statsRow: [
          { label: '1st Service (7:30 AM)', val: `${sunday1stServiceCount} Worshippers`, icon: <Activity size={14} />, bg: 'bg-[#fdf2f7] text-[#ea1263]' },
          { label: '2nd Service (9:30 AM)', val: `${sunday2ndServiceCount} Worshippers`, icon: <Users size={14} />, bg: 'bg-[#f5f3ff] text-[#8b5cf6]' },
          { label: 'Wednesday Prayer', val: '285 Attendees', icon: <TrendingUp size={14} />, bg: 'bg-[#ecfeff] text-[#06b6d4]' },
          { label: 'Thursday Bible Study', val: '210 Attendees', icon: <Sparkles size={14} />, bg: 'bg-[#fffbeb] text-[#f59e0b]' }
        ]
      };
    }

    if (isResidentPastor) {
      const petitionCount = 
        timeframe === 'DAILY' ? Math.max(3, Math.round((prayerRequests.length || 24) * 0.15)) :
        timeframe === 'WEEKLY' ? Math.round((prayerRequests.length || 24) * 0.5) :
        timeframe === 'MONTHLY' ? (prayerRequests.length || 24) :
        (prayerRequests.length || 24) * 4;

      const primaryLabel =
        timeframe === 'DAILY' ? "Today's Pastoral Petitions" :
        timeframe === 'WEEKLY' ? "This Week's Intercessory Petitions" :
        timeframe === 'MONTHLY' ? "Active Pastoral Care & Intercessory Petitions" :
        "Annual Pastoral Care Petitions Handled";

      return {
        title: 'Congregational Shepherding & Care Desk',
        subtitle: 'FGC Mushin District Headquarters · Pastoral Counseling, Petitions & Discipleship',
        curve1Label: 'Prayer Petitions',
        curve2Label: 'Guest Follow-Up',
        primaryMetric: `${petitionCount} Active Petitions`,
        primaryMetricLabel: primaryLabel,
        secondaryMetric: `${guestVisits.length || 38} Souls in Care`,
        secondaryMetricLabel: 'First-Time Visitors in Active Assimilation',
        ctaLabel: 'Prayer Desk',
        ctaIcon: <Heart size={13} />,
        ctaAction: () => onSetActiveTab('prayers'),
        statsRow: [
          { label: 'Pastoral Counseling', val: '18 Sessions', icon: <Heart size={14} />, bg: 'bg-[#fdf2f7] text-[#ea1263]' },
          { label: 'First-Time Guests', val: `${guestVisits.length || 38} Souls`, icon: <Users size={14} />, bg: 'bg-[#f5f3ff] text-[#8b5cf6]' },
          { label: 'Sermons Cataloged', val: `${sermons.length || 12} Messages`, icon: <BookOpen size={14} />, bg: 'bg-[#ecfeff] text-[#06b6d4]' },
          { label: 'Sunday Worshippers', val: `${totalRecentHeadcount} Souls`, icon: <Sparkles size={14} />, bg: 'bg-[#fffbeb] text-[#f59e0b]' }
        ]
      };
    }

    if (isSecretariat) {
      return {
        title: 'Church Secretariat & Parish Records Desk',
        subtitle: 'FGC Mushin District Headquarters · Office Administration, Intake & Calendars',
        curve1Label: 'Parish Events',
        curve2Label: 'Visitor Registry',
        primaryMetric: `${events.length || 8} Scheduled Events`,
        primaryMetricLabel: 'Upcoming Parish & District Calendar Programs',
        secondaryMetric: `${guestVisits.length || 38} Registered Intake`,
        secondaryMetricLabel: 'First-Time Visitor Forms Digitized & Logged',
        ctaLabel: 'Parish Calendar',
        ctaIcon: <Calendar size={13} />,
        ctaAction: () => onSetActiveTab('events'),
        statsRow: [
          { label: 'Parish Programs', val: `${events.length || 8} Events`, icon: <Calendar size={14} />, bg: 'bg-[#fdf2f7] text-[#ea1263]' },
          { label: 'Visitor Intake', val: `${guestVisits.length || 38} Registrations`, icon: <Users size={14} />, bg: 'bg-[#f5f3ff] text-[#8b5cf6]' },
          { label: 'Prayer Intake', val: `${prayerRequests.length || 24} Requests`, icon: <Heart size={14} />, bg: 'bg-[#ecfeff] text-[#06b6d4]' },
          { label: 'Archived Records', val: '1,250 Service Records', icon: <FileText size={14} />, bg: 'bg-[#fffbeb] text-[#f59e0b]' }
        ]
      };
    }

    // Default & District Overseer: Financial stewardship
    const multiplier = 
      timeframe === 'DAILY' ? 0.05 :
      timeframe === 'WEEKLY' ? 0.28 :
      timeframe === 'MONTHLY' ? 1.0 : 4.8;

    const baseInflow = totalInflow || 3468960;
    const computedInflow = Math.round(baseInflow * multiplier);
    const primaryLabel =
      timeframe === 'DAILY' ? "Today's Tithes, Offerings & Inflows" :
      timeframe === 'WEEKLY' ? "Current Week Collections & District Remittances" :
      timeframe === 'MONTHLY' ? "Current Month Collections & Inflows" :
      "Year-to-Date Ministry Stewardship & Inflows";

    const attendanceMulti = 
      timeframe === 'DAILY' ? 0.08 :
      timeframe === 'WEEKLY' ? 0.45 :
      timeframe === 'MONTHLY' ? 1.0 : 4.5;
    const computedAttendance = Math.round(totalRecentHeadcount * attendanceMulti);
    const secondaryLabel =
      timeframe === 'DAILY' ? "Today's Sanctuary / Midweek Count" :
      timeframe === 'WEEKLY' ? "Weekly Sunday & Midweek Aggregate" :
      timeframe === 'MONTHLY' ? "Current Month Sanctuary Attendance" :
      "Year-to-Date Cumulative Congregation Attendance";

    if (isDistrictOverseer) {
      return {
        title: 'District Overseer Executive Study',
        subtitle: 'FGC Mushin District Headquarters · Senior Pastor Stewardship & Oversight',
        curve1Label: 'Digital Giving',
        curve2Label: 'Sanctuary Tithes',
        primaryMetric: `₦${(computedInflow / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k`,
        primaryMetricLabel: primaryLabel,
        secondaryMetric: `${computedAttendance.toLocaleString()} Worshippers`,
        secondaryMetricLabel: secondaryLabel,
        ctaLabel: 'Financial Statement',
        ctaIcon: <FileText size={13} />,
        ctaAction: () => onSetActiveTab('finances'),
        statsRow: [
          { label: 'Pastoral Welfare', val: totalWelfareOutflow ? `₦${(Math.round(totalWelfareOutflow * multiplier) / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k` : '₦456.75k', icon: <Heart size={14} />, bg: 'bg-[#fdf2f7] text-[#ea1263]' },
          { label: 'Sanctuary Project', val: totalBuildingFund ? `₦${(Math.round(totalBuildingFund * multiplier) / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k` : '₦1,689.50k', icon: <Wallet size={14} />, bg: 'bg-[#f5f3ff] text-[#8b5cf6]' },
          { label: 'Global Missions', val: totalMissions ? `₦${(Math.round(totalMissions * multiplier) / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k` : '₦285.15k', icon: <TrendingUp size={14} />, bg: 'bg-[#ecfeff] text-[#06b6d4]' },
          { label: 'General Reserve', val: `₦${(computedInflow / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k`, icon: <Sparkles size={14} />, bg: 'bg-[#fffbeb] text-[#f59e0b]' }
        ]
      };
    }

    // Administrator
    return {
      title: 'Financial & Ministry Stewardship',
      subtitle: 'FGC Mushin District Headquarters · Executive IT & Operations Desk',
      curve1Label: 'Digital Giving',
      curve2Label: 'Sanctuary Tithes',
      primaryMetric: `₦${(computedInflow / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k`,
      primaryMetricLabel: primaryLabel,
      secondaryMetric: `${computedAttendance.toLocaleString()} Worshippers`,
      secondaryMetricLabel: secondaryLabel,
      ctaLabel: 'Financial Statement',
      ctaIcon: <FileText size={13} />,
      ctaAction: () => onSetActiveTab('finances'),
      statsRow: [
        { label: 'Pastoral Welfare', val: totalWelfareOutflow ? `₦${(Math.round(totalWelfareOutflow * multiplier) / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k` : '₦456.75k', icon: <Heart size={14} />, bg: 'bg-[#fdf2f7] text-[#ea1263]' },
        { label: 'Sanctuary Project', val: totalBuildingFund ? `₦${(Math.round(totalBuildingFund * multiplier) / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k` : '₦1,689.50k', icon: <Wallet size={14} />, bg: 'bg-[#f5f3ff] text-[#8b5cf6]' },
        { label: 'Global Missions', val: totalMissions ? `₦${(Math.round(totalMissions * multiplier) / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k` : '₦285.15k', icon: <TrendingUp size={14} />, bg: 'bg-[#ecfeff] text-[#06b6d4]' },
        { label: 'General Reserve', val: `₦${(computedInflow / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k`, icon: <Sparkles size={14} />, bg: 'bg-[#fffbeb] text-[#f59e0b]' }
      ]
    };
  }, [
    isHeadUsher,
    isResidentPastor,
    isSecretariat,
    isDistrictOverseer,
    timeframe,
    totalRecentHeadcount,
    sunday1stServiceCount,
    sunday2ndServiceCount,
    prayerRequests.length,
    guestVisits.length,
    events.length,
    sermons.length,
    totalInflow,
    totalWelfareOutflow,
    totalBuildingFund,
    totalMissions,
    onOpenLogAttendanceModal,
    onSetActiveTab
  ]);

  // Ledger rows filtered strictly by active role's authority
  const roleLedger = useMemo(() => {
    const list: Array<{
      id: string;
      code: string;
      title: string;
      category: string;
      value: string;
      date: string;
      status: string;
      statusColor: string;
    }> = [];

    // HEAD USHER: Service Headcount records ONLY (Zero financial figures)
    if (isHeadUsher) {
      serviceAttendance.forEach((s, idx) => {
        list.push({
          id: `att-${s.id}`,
          code: `SRV-${20260 + idx}`,
          title: s.service_name,
          category: `Usher: ${s.head_usher_name || 'Bro. Emmanuel Kalu'}`,
          value: `${s.total_count.toLocaleString()} Worshippers`,
          date: s.service_date,
          status: 'Verified',
          statusColor: 'chip-verified'
        });
      });

      if (list.length === 0) {
        return [
          { id: '1', code: 'SRV-20261', title: '2nd Sunday Celebration Service (9:30 AM)', category: 'Usher: Bro. Emmanuel Kalu', value: '780 Worshippers', date: '2026-10-25', status: 'Verified', statusColor: 'chip-verified' },
          { id: '2', code: 'SRV-20262', title: '1st Sunday Early Manna (7:30 AM)', category: 'Usher: Sis. Ngozi Adebisi', value: '470 Worshippers', date: '2026-10-25', status: 'Verified', statusColor: 'chip-verified' },
          { id: '3', code: 'SRV-20263', title: 'Wednesday Hour of Power Intercession', category: 'Usher: Bro. Daniel Okafor', value: '285 Attendees', date: '2026-10-21', status: 'Verified', statusColor: 'chip-verified' },
          { id: '4', code: 'SRV-20264', title: 'Thursday Digging Deep Bible Study', category: 'Usher: Sis. Faith Bassey', value: '210 Attendees', date: '2026-10-15', status: 'Verified', statusColor: 'chip-verified' },
          { id: '5', code: 'SRV-20265', title: 'Sunday Youth Church (Sanctuary Overflow)', category: 'Usher: Bro. Kelechi Paul', value: '185 Worshippers', date: '2026-10-18', status: 'Verified', statusColor: 'chip-verified' }
        ];
      }
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // RESIDENT PASTOR: Pastoral Care, Guest Assimilation & Prayers (Zero financials)
    if (isResidentPastor) {
      guestVisits.forEach((g, idx) => {
        const visitDate = g.created_at ? g.created_at.split('T')[0] : '2026-10-25';
        const isCompleted = g.status === 'followed_up';
        list.push({
          id: `gst-${g.id}`,
          code: `VIS-${1040 + idx}`,
          title: g.full_name,
          category: `Service: ${g.service_time || 'Sunday 2nd Service'}`,
          value: g.phone ? `Phone: ${g.phone}` : 'Assigned: Pastoral Care Desk',
          date: visitDate,
          status: isCompleted ? 'Followed Up' : 'Active Care',
          statusColor: isCompleted ? 'chip-followed' : 'chip-care'
        });
      });

      prayerRequests.slice(0, 5).forEach((p, idx) => {
        list.push({
          id: `pry-${p.id}`,
          code: `PRY-${5020 + idx}`,
          title: `${p.full_name || 'Congregant'} (${p.category || 'General'})`,
          category: 'Intercessory Petition',
          value: p.is_confidential ? 'Confidential Intercession' : 'General Care',
          date: p.created_at ? p.created_at.split('T')[0] : '2026-10-25',
          status: p.status === 'answered' ? 'Answered' : 'Interceding',
          statusColor: p.status === 'answered' ? 'chip-followed' : 'chip-interceding'
        });
      });

      if (list.length === 0) {
        return [
          { id: '1', code: 'VIS-1041', title: 'Bro. Chijioke Nwosu (First-Time Visitor)', category: 'Service: Sunday 2nd Service', value: 'Assigned: Pastor Resident', date: '2026-10-25', status: 'Active Care', statusColor: 'chip-care' },
          { id: '2', code: 'PRY-5021', title: 'Sis. Abigail Adekunle (Healing Intercession)', category: 'Intercessory Petition', value: 'Urgent Pastoral Intercession', date: '2026-10-24', status: 'Interceding', statusColor: 'chip-interceding' },
          { id: '3', code: 'VIS-1042', title: 'Sis. Blessing Alabi (First-Time Visitor)', category: 'Service: Sunday 1st Service', value: 'Assigned: Guest Care Desk', date: '2026-10-25', status: 'Followed Up', statusColor: 'chip-followed' },
          { id: '4', code: 'PRY-5022', title: 'Bro. Emmanuel & Family (Thanksgiving Vow)', category: 'Intercessory Petition', value: 'Congregational Vow', date: '2026-10-22', status: 'Answered', statusColor: 'chip-followed' }
        ];
      }
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // SECRETARIAT: Parish Events, Guest Registry Intake & Bulletins (Zero financials)
    if (isSecretariat) {
      events.forEach((ev, idx) => {
        list.push({
          id: `ev-${ev.id}`,
          code: `EVT-${3010 + idx}`,
          title: ev.title,
          category: `Location: ${ev.location || 'Main Auditorium'}`,
          value: `Category: ${ev.category || 'Parish'}`,
          date: ev.date,
          status: 'Scheduled',
          statusColor: 'chip-scheduled'
        });
      });

      guestVisits.slice(0, 5).forEach((g, idx) => {
        const visitDate = g.created_at ? g.created_at.split('T')[0] : '2026-10-25';
        list.push({
          id: `gst-sec-${g.id}`,
          code: `REG-${4010 + idx}`,
          title: `${g.full_name} (Intake Form)`,
          category: 'Guest Reception Intake',
          value: g.phone || 'Phone on File',
          date: visitDate,
          status: 'Digitized',
          statusColor: 'chip-digitized'
        });
      });

      if (list.length === 0) {
        return [
          { id: '1', code: 'EVT-3011', title: 'Monthly District Leadership Assembly', category: 'Location: Executive Boardroom', value: 'Category: District', date: '2026-11-05', status: 'Scheduled', statusColor: 'chip-scheduled' },
          { id: '2', code: 'REG-4011', title: 'Bro. Samuel Adeleke (Reception Slip)', category: 'Guest Reception Intake', value: '+234 803 123 4567', date: '2026-10-25', status: 'Digitized', statusColor: 'chip-digitized' },
          { id: '3', code: 'EVT-3012', title: 'All-Night Miracle & Breakthrough Service', category: 'Location: Main Auditorium', value: 'Category: Parish', date: '2026-11-07', status: 'Scheduled', statusColor: 'chip-scheduled' }
        ];
      }
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // ADMIN & DISTRICT OVERSEER: Full Financials + Attendance Ledger
    finances.slice(0, 10).forEach((f, idx) => {
      const code = f.reference_code || `TXN-${84920 + idx}`;
      const isOutflow = f.transaction_type === 'outflow';
      list.push({
        id: `fin-${f.id}`,
        code,
        title: f.donor_or_payee || f.notes || f.category,
        category: isOutflow ? 'Pastoral Welfare & Operations' : f.category,
        value: `₦${Number(f.amount).toLocaleString('en-NG')}`,
        date: f.transaction_date,
        status: isOutflow ? 'Disbursed' : 'Audited',
        statusColor: isOutflow ? 'chip-disbursed' : 'chip-audited'
      });
    });

    serviceAttendance.slice(0, 5).forEach((s, idx) => {
      list.push({
        id: `att-${s.id}`,
        code: `SRV-${20260 + idx}`,
        title: s.service_name,
        category: 'Sunday Sanctuary Service',
        value: `${s.total_count.toLocaleString()} Worshippers`,
        date: s.service_date,
        status: 'Verified',
        statusColor: 'chip-verified'
      });
    });

    if (list.length === 0) {
      return [
        { id: '1', code: 'TXN-84920', title: 'Sunday Covenant Tithes & Offertory', category: 'General Treasury', value: '₦450,000', date: '2026-10-25', status: 'Audited', statusColor: 'chip-audited' },
        { id: '2', code: 'SRV-20261', title: '2nd Sunday Celebration Service (9:30 AM)', category: 'Sanctuary Ushering', value: '780 Worshippers', date: '2026-10-25', status: 'Verified', statusColor: 'chip-verified' },
        { id: '3', code: 'SRV-20262', title: '1st Sunday Early Manna (7:30 AM)', category: 'Sanctuary Ushering', value: '470 Worshippers', date: '2026-10-25', status: 'Verified', statusColor: 'chip-verified' },
        { id: '4', code: 'WLF-30192', title: 'Community Welfare & Widows Benevolence', category: 'Pastoral Benevolence', value: '₦85,000', date: '2026-10-22', status: 'Disbursed', statusColor: 'chip-disbursed' },
        { id: '5', code: 'BLD-10294', title: 'Sanctuary Acoustic Treatment Renovation', category: 'Building Fund', value: '₦200,000', date: '2026-10-20', status: 'Processing', statusColor: 'chip-processing' }
      ];
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    isHeadUsher,
    isResidentPastor,
    isSecretariat,
    serviceAttendance,
    guestVisits,
    prayerRequests,
    events,
    finances
  ]);

  const filteredLedger = useMemo(() => {
    if (!searchQuery.trim()) return roleLedger;
    const q = searchQuery.toLowerCase();
    return roleLedger.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.value.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [roleLedger, searchQuery]);

  // Pagination calculations (6 items per page)
  const pageSize = 6;
  const totalPages = Math.ceil(filteredLedger.length / pageSize) || 1;
  const paginatedLedger = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLedger.slice(start, start + pageSize);
  }, [filteredLedger, currentPage]);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Reference Code', 'Item / Record', 'Category', 'Telemetry / Value', 'Date', 'Status'];
    const rows = filteredLedger.map((r) => [r.code, `"${r.title}"`, `"${r.category}"`, `"${r.value}"`, r.date, r.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FGC_Mushin_${activeRole}_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Donut calculation constants
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const womenStroke = (demographics.womenPct / 100) * circumference;
  const menStroke = (demographics.menPct / 100) * circumference;
  const childrenStroke = (demographics.childrenPct / 100) * circumference;

  // Dynamic Bezier Wave paths, peak markers and X-ticks driven by selected timeframe
  const chartData = useMemo(() => {
    switch (timeframe) {
      case 'DAILY':
        return {
          curve1Area: 'M 30,170 C 60,150 110,80 160,110 C 210,140 260,60 320,70 C 380,80 430,130 490,165 L 490,180 L 30,180 Z',
          curve1Path: 'M 30,170 C 60,150 110,80 160,110 C 210,140 260,60 320,70 C 380,80 430,130 490,165',
          curve2Area: 'M 30,180 C 70,160 120,120 170,130 C 220,140 270,90 330,85 C 390,80 440,30 490,170 L 490,180 L 30,180 Z',
          curve2Path: 'M 30,180 C 70,160 120,120 170,130 C 220,140 270,90 330,85 C 390,80 440,30 490,170',
          peaks: [
            { cx: 160, cy: 110, r: 4.5, fill: '#f59e0b' },
            { cx: 320, cy: 70, r: 4.5, fill: '#f59e0b' },
            { cx: 440, cy: 30, r: 5, fill: '#ea1263' }
          ],
          xTicks: [
            { label: 'Mon', x: 35 },
            { label: 'Tue', x: 110 },
            { label: 'Wed', x: 185 },
            { label: 'Thu', x: 260 },
            { label: 'Fri', x: 335 },
            { label: 'Sat', x: 410 },
            { label: 'Sun', x: 470 }
          ]
        };
      case 'WEEKLY':
        return {
          curve1Area: 'M 30,175 C 90,130 150,145 230,90 C 310,40 390,110 490,160 L 490,180 L 30,180 Z',
          curve1Path: 'M 30,175 C 90,130 150,145 230,90 C 310,40 390,110 490,160',
          curve2Area: 'M 30,180 C 80,155 160,110 240,125 C 320,140 400,35 490,175 L 490,180 L 30,180 Z',
          curve2Path: 'M 30,180 C 80,155 160,110 240,125 C 320,140 400,35 490,175',
          peaks: [
            { cx: 230, cy: 90, r: 4.5, fill: '#f59e0b' },
            { cx: 400, cy: 35, r: 5, fill: '#ea1263' }
          ],
          xTicks: [
            { label: 'Wk 1', x: 45 },
            { label: 'Wk 2', x: 155 },
            { label: 'Wk 3', x: 265 },
            { label: 'Wk 4', x: 375 },
            { label: 'Current', x: 460 }
          ]
        };
      case 'YEARLY':
        return {
          curve1Area: 'M 30,180 C 80,150 140,120 210,130 C 280,140 350,70 420,60 C 455,55 475,110 490,165 L 490,180 L 30,180 Z',
          curve1Path: 'M 30,180 C 80,150 140,120 210,130 C 280,140 350,70 420,60 C 455,55 475,110 490,165',
          curve2Area: 'M 30,180 C 70,160 130,140 200,105 C 270,70 340,120 410,50 C 450,20 475,90 490,175 L 490,180 L 30,180 Z',
          curve2Path: 'M 30,180 C 70,160 130,140 200,105 C 270,70 340,120 410,50 C 450,20 475,90 490,175',
          peaks: [
            { cx: 200, cy: 105, r: 4.5, fill: '#f59e0b' },
            { cx: 420, cy: 60, r: 4.5, fill: '#f59e0b' },
            { cx: 450, cy: 20, r: 5, fill: '#ea1263' }
          ],
          xTicks: [
            { label: '2021', x: 35 },
            { label: '2022', x: 120 },
            { label: '2023', x: 210 },
            { label: '2024', x: 305 },
            { label: '2025', x: 395 },
            { label: '2026', x: 470 }
          ]
        };
      case 'MONTHLY':
      default:
        return {
          curve1Area: 'M 30,180 C 70,165 90,95 125,95 C 160,95 190,140 220,135 C 260,130 280,75 320,80 C 350,85 375,120 405,100 C 435,80 460,110 490,175 L 490,180 L 30,180 Z',
          curve1Path: 'M 30,180 C 70,165 90,95 125,95 C 160,95 190,140 220,135 C 260,130 280,75 320,80 C 350,85 375,120 405,100 C 435,80 460,110 490,175',
          curve2Area: 'M 30,180 C 60,150 95,140 135,145 C 170,150 195,160 230,145 C 270,130 295,110 330,135 C 370,160 400,25 435,40 C 460,50 475,120 490,180 L 490,180 L 30,180 Z',
          curve2Path: 'M 30,180 C 60,150 95,140 135,145 C 170,150 195,160 230,145 C 270,130 295,110 330,135 C 370,160 400,25 435,40 C 460,50 475,120 490,180',
          peaks: [
            { cx: 125, cy: 95, r: 4.5, fill: '#f59e0b' },
            { cx: 320, cy: 80, r: 4.5, fill: '#f59e0b' },
            { cx: 435, cy: 40, r: 5, fill: '#ea1263' }
          ],
          xTicks: [
            { label: 'Jan', x: 35 },
            { label: 'Feb', x: 120 },
            { label: 'Mar', x: 210 },
            { label: 'Apr', x: 305 },
            { label: 'May', x: 395 },
            { label: 'Jun', x: 470 }
          ]
        };
    }
  }, [timeframe]);

  return (
    <div className="space-y-6 -webkit-font-smoothing-antialiased">
      {/* ======================================================== */}
      {/* ROW 1: ROLE-TAILORED DUAL-WAVE CHART + DEMOGRAPHICS DONUT */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 dash-row-animate">
        {/* Left Card: Primary Telemetry & Wave Chart */}
        <div className="lg:col-span-8 bg-white rounded-[22px] p-5 lg:p-6 border border-[#f0e4f3] shadow-[0_4px_24px_rgba(235,18,119,0.04)] flex flex-col justify-between">
          <div>
            {/* Header: Title + Timeframe Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#f7f0f8]">
              <div>
                <h2 className="text-lg font-extrabold text-[#1f2430] tracking-tight text-balance">
                  {roleConfig.title}
                </h2>
                <p className="text-xs text-[#8a919e] font-medium mt-0.5">
                  {roleConfig.subtitle}
                </p>
              </div>

              {/* Timeframe Filter Tabs */}
              <div className="flex items-center gap-4 text-xs font-bold self-start sm:self-auto">
                {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as Timeframe[]).map((tab) => {
                  const isActive = timeframe === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setTimeframe(tab)}
                      className={`pb-1 transition-colors duration-150 relative cursor-pointer active:scale-[0.96] ${
                        isActive
                          ? 'text-[#ea1263] font-black'
                          : 'text-[#9da3af] hover:text-[#1f2430]'
                      }`}
                    >
                      {tab}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ea1263] rounded-full timeframe-tab-active-bar" />
                      )}
                    </button>
                  );
                })}

                <div className="hidden sm:flex items-center gap-3 pl-2 text-[11px] text-[#707786] border-l border-[#f0e6f2]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-xs" /> {roleConfig.curve1Label}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ea1263] shadow-xs" /> {roleConfig.curve2Label}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics & Wave Chart Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5 dash-card-stagger">
              {/* Left Column: Key Figures */}
              <div className="md:col-span-4 flex flex-col justify-between pr-2">
                <div>
                  <div className="hero-metric-primary">
                    {roleConfig.primaryMetric}
                  </div>
                  <div className="text-xs text-[#8a919e] font-semibold mt-0.5 text-pretty">
                    {roleConfig.primaryMetricLabel}
                  </div>

                  <div className="mt-6">
                    <div className="hero-metric-secondary">
                      {roleConfig.secondaryMetric}
                    </div>
                    <div className="text-xs text-[#8a919e] font-semibold mt-0.5 text-pretty">
                      {roleConfig.secondaryMetricLabel}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={roleConfig.ctaAction}
                  className="mt-6 px-4 py-2 rounded-full bg-[#ea1263] hover:bg-[#d80f58] active:scale-[0.96] text-white text-xs font-bold shadow-md shadow-[#ea1263]/25 transition-transform duration-150 ease-out cursor-pointer flex items-center gap-1.5 self-start"
                >
                  {roleConfig.ctaIcon}
                  <span>{roleConfig.ctaLabel}</span>
                </button>
              </div>

              {/* Right Column: High-Res SVG Dual-Curve Wave Chart */}
              <div className="md:col-span-8 h-48 sm:h-52 w-full relative">
                <svg
                  viewBox="0 0 500 200"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="pinkWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ea1263" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#ea1263" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#ea1263" stopOpacity="0.0" />
                    </linearGradient>

                    <linearGradient id="amberWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                      <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="30" y1="20" x2="490" y2="20" stroke="#f6eff7" strokeDasharray="3 3" />
                  <line x1="30" y1="60" x2="490" y2="60" stroke="#f6eff7" strokeDasharray="3 3" />
                  <line x1="30" y1="100" x2="490" y2="100" stroke="#f6eff7" strokeDasharray="3 3" />
                  <line x1="30" y1="140" x2="490" y2="140" stroke="#f6eff7" strokeDasharray="3 3" />
                  <line x1="30" y1="180" x2="490" y2="180" stroke="#f0e6f2" strokeWidth="1" />

                  {/* Y-axis Ticks */}
                  <text x="10" y="24" fill="#a4aab8" fontSize="10" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" style={{ fontVariantNumeric: 'tabular-nums' }}>35</text>
                  <text x="10" y="64" fill="#a4aab8" fontSize="10" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" style={{ fontVariantNumeric: 'tabular-nums' }}>25</text>
                  <text x="10" y="104" fill="#a4aab8" fontSize="10" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" style={{ fontVariantNumeric: 'tabular-nums' }}>15</text>
                  <text x="10" y="144" fill="#a4aab8" fontSize="10" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" style={{ fontVariantNumeric: 'tabular-nums' }}>5</text>
                  <text x="10" y="184" fill="#a4aab8" fontSize="10" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" style={{ fontVariantNumeric: 'tabular-nums' }}>0</text>

                  {/* Curve 1: Orange/Amber */}
                  <path
                    d={chartData.curve1Area}
                    fill="url(#amberWaveGrad)"
                    className="transition-all duration-300"
                  />
                  <path
                    d={chartData.curve1Path}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />

                  {/* Curve 2: Hot Pink */}
                  <path
                    d={chartData.curve2Area}
                    fill="url(#pinkWaveGrad)"
                    className="transition-all duration-300"
                  />
                  <path
                    d={chartData.curve2Path}
                    fill="none"
                    stroke="#ea1263"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />

                  {/* Peak Markers */}
                  {chartData.peaks.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.cx}
                      cy={p.cy}
                      r={p.r}
                      fill={p.fill}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Dynamic X-axis Labels */}
                  {chartData.xTicks.map((tick, idx) => (
                    <text
                      key={idx}
                      x={tick.x}
                      y="196"
                      fill="#a4aab8"
                      fontSize="10"
                      fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {tick.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom 4 Circular Icon Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#f7f0f8] mt-4">
            {roleConfig.statsRow.map((st, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${st.bg}`}>
                  {st.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-[#8a919e] font-semibold truncate">{st.label}</div>
                  <div className="text-xs font-black text-[#1b212f] tabular-nums">{st.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Fellowship Demographics Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-[22px] p-5 lg:p-6 border border-[#f0e4f3] shadow-[0_4px_24px_rgba(235,18,119,0.04)] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#1f2430] tracking-tight">
              Fellowship Demographics
            </h2>
            <p className="text-xs text-[#8a919e] font-medium mt-0.5">
              Sanctuary Fellowship Distribution
            </p>
          </div>

          {/* SVG 3-Segment Donut Chart */}
          <div className="py-3 lg:py-4 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#f5edf6"
                  strokeWidth="20"
                />

                {/* Women's Fellowship (Rose 55%) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#ea1263"
                  strokeWidth="20"
                  strokeDasharray={`${womenStroke} ${circumference}`}
                  strokeLinecap="round"
                />

                {/* Men's Fellowship / CFM (Purple 33%) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth="20"
                  strokeDasharray={`${menStroke} ${circumference}`}
                  strokeDashoffset={`-${womenStroke}`}
                  strokeLinecap="round"
                />

                {/* Youth & Children (Amber 12%) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="20"
                  strokeDasharray={`${childrenStroke} ${circumference}`}
                  strokeDashoffset={`-${womenStroke + menStroke}`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Inner Donut Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <Users size={20} className="text-[#ea1263] mb-0.5" />
                <span className="text-lg font-black text-[#1b212f] tracking-tight tabular-nums">
                  100%
                </span>
                <span className="text-[9px] text-[#8a919e] font-bold uppercase tracking-wider">
                  Sanctuary
                </span>
              </div>
            </div>
          </div>

          {/* Demographics Percentages Legend */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#f7f0f8] text-center">
            <div>
              <div className="text-base font-black text-[#1b212f] tabular-nums">{demographics.menPct}%</div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#8a919e] mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                <span>Men (CFM)</span>
              </div>
            </div>

            <div>
              <div className="text-base font-black text-[#1b212f] tabular-nums">{demographics.womenPct}%</div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#8a919e] mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#ea1263]" />
                <span>Women</span>
              </div>
            </div>

            <div>
              <div className="text-base font-black text-[#1b212f] tabular-nums">{demographics.childrenPct}%</div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#8a919e] mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <span>Children</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 2: 4 ROLE-SPECIFIC HARMONIZED GRADIENT ACTION CARDS  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 dash-card-stagger dash-row-animate" style={{ animationDelay: '80ms' }}>
        {/* Card 1: Crimson / Ruby */}
        <div className="rounded-[18px] p-5 text-white card-gradient-crimson relative overflow-hidden flex flex-col justify-between min-h-[148px] gradient-action-card">
          <div className="relative z-10 text-[11px] font-bold uppercase tracking-wider text-white/95">
            {isHeadUsher
              ? '1st Sunday Service (7:30 AM)'
              : isResidentPastor
              ? 'Pastoral Prayer Petitions'
              : isSecretariat
              ? 'Parish Calendar Events'
              : 'Sanctuary Tithes & Inflows'}
          </div>

          <div className="relative z-10 flex items-end justify-between mt-2">
            <div className="flex items-end gap-1.5 h-10 pb-1">
              <span className="w-2 h-4 bg-white/75 rounded-xs bar-chart-bar" />
              <span className="w-2 h-7 bg-white/95 rounded-xs bar-chart-bar" />
              <span className="w-2 h-3 bg-white/60 rounded-xs bar-chart-bar" />
              <span className="w-2 h-9 bg-white rounded-xs bar-chart-bar" />
              <span className="w-2 h-6 bg-white/80 rounded-xs bar-chart-bar" />
            </div>

            <div className="text-right">
              <div className="card-value-metric">
                {isHeadUsher
                  ? `${sunday1stServiceCount} Souls`
                  : isResidentPastor
                  ? `${prayerRequests.length || 24} Petitions`
                  : isSecretariat
                  ? `${events.length || 8} Programs`
                  : totalTithes
                  ? `₦${(totalTithes / 1000).toLocaleString('en-NG', { maximumFractionDigits: 1 })}k`
                  : '₦1,432.00k'}
              </div>
              <div className="text-[10px] font-medium text-white/85 mt-0.5">
                {isHeadUsher
                  ? 'Early Manna Service'
                  : isResidentPastor
                  ? 'Active in Care Desk'
                  : isSecretariat
                  ? 'Upcoming Programs'
                  : 'Current Ministry Month'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Deep Indigo / Violet */}
        <div className="rounded-[18px] p-5 text-white card-gradient-indigo relative overflow-hidden flex flex-col justify-between min-h-[148px] gradient-action-card">
          <div className="relative z-10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/95">
              {isHeadUsher
                ? '2nd Sunday Service (9:30 AM)'
                : isResidentPastor
                ? 'First-Time Guests Follow-Up'
                : isSecretariat
                ? 'Guest Registry & Intake'
                : 'Sunday Sanctuary Headcount'}
            </div>
            <div className="card-value-metric mt-1.5">
              {isHeadUsher
                ? `${sunday2ndServiceCount} Souls`
                : isResidentPastor || isSecretariat
                ? `${guestVisits.length || 38} Souls in Care`
                : `${totalRecentHeadcount.toLocaleString()} Worshippers`}
            </div>
            <div className="text-[10px] font-medium text-white/85 mt-0.5">
              {isHeadUsher
                ? 'Main Celebration Service'
                : isResidentPastor
                ? 'Pastoral Assimilation Active'
                : isSecretariat
                ? 'Intake Forms Digitized'
                : '1st & 2nd Services Combined'}
            </div>
          </div>

          <div className="absolute -bottom-1 left-0 right-0 h-11 pointer-events-none z-0">
            <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-full">
              <path d="M 0,35 Q 50,15 100,28 T 200,18 L 200,60 L 0,60 Z" fill="rgba(255, 255, 255, 0.15)" />
            </svg>
          </div>
        </div>

        {/* Card 3: Ocean Teal / Cyan */}
        <div className="rounded-[18px] p-5 text-white card-gradient-teal relative overflow-hidden flex flex-col justify-between min-h-[148px] gradient-action-card">
          <div className="relative z-10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/95">
              {isHeadUsher
                ? 'Midweek Discipleship & Prayer'
                : isResidentPastor
                ? 'Sunday Congregation Shepherded'
                : isSecretariat
                ? 'Congregational Records Archived'
                : 'Midweek Discipleship & Prayer'}
            </div>
            <div className="card-value-metric mt-1.5">
              {isResidentPastor || isSecretariat
                ? `${totalRecentHeadcount} Souls`
                : `${midweekHeadcount} Attendees`}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between mt-2">
            <button
              type="button"
              onClick={() => {
                if (midweekFilter === 'All Midweek') setMidweekFilter('Hour of Power');
                else if (midweekFilter === 'Hour of Power') setMidweekFilter('Digging Deep');
                else setMidweekFilter('All Midweek');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 active:scale-[0.96] backdrop-blur text-[10px] font-bold flex items-center gap-1 transition-colors duration-150 cursor-pointer text-white"
            >
              <span>{midweekFilter}</span>
              <ChevronDown size={12} />
            </button>

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

        {/* Card 4: Burnt Amber / Gold */}
        <div className="rounded-[18px] p-5 text-white card-gradient-amber relative overflow-hidden flex flex-col justify-between min-h-[148px] gradient-action-card">
          <div className="relative z-10 text-[11px] font-bold uppercase tracking-wider text-white/95">
            {isHeadUsher
              ? 'Sanctuary Seating Capacity'
              : isResidentPastor
              ? 'Pulpit Sermons Cataloged'
              : isSecretariat
              ? 'Official Church Bulletins'
              : 'First-Time Visitors (Souls)'}
          </div>

          <div className="relative z-10 flex items-end justify-between mt-2">
            <div className="flex items-end gap-1.5 h-10 pb-1">
              <span className="w-2 h-8 bg-white rounded-xs bar-chart-bar" />
              <span className="w-2 h-4 bg-white/70 rounded-xs bar-chart-bar" />
              <span className="w-2 h-9 bg-white/95 rounded-xs bar-chart-bar" />
              <span className="w-2 h-5 bg-white/80 rounded-xs bar-chart-bar" />
              <span className="w-2 h-7 bg-white/85 rounded-xs bar-chart-bar" />
            </div>

            <div className="text-right">
              <div className="card-value-metric">
                {isHeadUsher
                  ? '88% Capacity'
                  : isResidentPastor
                  ? `${sermons.length || 12} Series`
                  : isSecretariat
                  ? '5 Active Bulletins'
                  : `${guestVisits.length || 38} Souls`}
              </div>
              <div className="text-[10px] font-medium text-white/85 mt-0.5">
                {isHeadUsher
                  ? '1,400 Total Hall Seats'
                  : isResidentPastor
                  ? 'Current Teaching Series'
                  : isSecretariat
                  ? 'Published on Website'
                  : 'Assimilation Active'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 3: ROLE-SPECIFIC ACTIVITIES + AUDITED RECORD TABLE   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 dash-row-animate" style={{ animationDelay: '160ms' }}>
        {/* Left Card: Role Activities */}
        <div className="lg:col-span-4 bg-white rounded-[22px] p-6 border border-[#f0e4f3] shadow-[0_4px_24px_rgba(235,18,119,0.04)] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#1f2430] tracking-tight">
              {isHeadUsher
                ? 'Recent Protocol & Headcount Logs'
                : isResidentPastor
                ? 'Recent Pastoral & Care Activities'
                : isSecretariat
                ? 'Recent Secretariat & Office Logs'
                : 'Recent Ministry Activities'}
            </h2>
            <p className="text-xs text-[#8a919e] font-medium mt-0.5 mb-5">
              Live desk updates for {roleConfig.title}
            </p>

            <div className="activity-timeline space-y-0">
              {isHeadUsher ? (
                <>
                  <div className="activity-timeline-item flex items-start justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">42 Mins Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#ea1263] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#ea1263]/30">
                        <Activity size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">2nd Service Headcount Logged</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Bro. Emmanuel Kalu logged 780 worshippers</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">2 Hours Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#8b5cf6]/30">
                        <Users size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">1st Service Headcount Logged</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Sis. Ngozi verified 470 worshippers in Early Manna</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">1 Day Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#06b6d4] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#06b6d4]/30">
                        <Layers size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">Sanctuary Overflow Deployed</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Gallery B opened for 150 overflow worshippers</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">2 Days Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#f59e0b]/30">
                        <Clock size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">Hour of Power Attendance</div>
                        <div className="text-[11px] text-[#8b919e] truncate">285 worshippers recorded during Wednesday prayer</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : isResidentPastor ? (
                <>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">25 Mins Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#ea1263] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#ea1263]/30">
                        <Heart size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">Urgent Prayer Intercession</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Pastoral desk received 3 urgent intercessions</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">2 Hours Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#8b5cf6]/30">
                        <Users size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">First-Time Guest Phone Care</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Guest Care team completed follow-up with 14 visitors</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">5 Hours Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#06b6d4] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#06b6d4]/30">
                        <BookOpen size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">Pulpit Sermon Published</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Resident Pastor uploaded "Supernatural Fruitfulness"</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : isSecretariat ? (
                <>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">30 Mins Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#ea1263] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#ea1263]/30">
                        <Calendar size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">District Assembly Scheduled</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Secretariat finalized program date for November 5</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">3 Hours Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#8b5cf6]/30">
                        <Users size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">Visitor Intake Forms Digitized</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Sis. Chioma recorded 18 Sunday visitor forms</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Admin & District Overseer
                <>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">42 Mins Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#ea1263] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#ea1263]/30">
                        <Activity size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">Service Headcount Logged</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Bro. Emmanuel Kalu logged 780 attendees for 2nd Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">2 Hours Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#8b5cf6]/30">
                        <Heart size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">Pastoral Prayer Petitions</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Secretariat logged 3 urgent intercessory requests</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">5 Hours Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#06b6d4] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#06b6d4]/30">
                        <BookOpen size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">Pulpit Message Cataloged</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Resident Pastor published "Walking in Fruitfulness"</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#8b919e] w-20 shrink-0 tabular-nums">1 Day Ago</span>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#f59e0b]/30">
                        <Wallet size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1f2430] truncate">Treasury Reconciled</div>
                        <div className="text-[11px] text-[#8b919e] truncate">Deaconess Adebayo reconciled Sunday tithes & vouchers</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#f7f0f8] mt-4 flex items-center justify-between text-xs font-bold text-[#ea1263]">
            <button
              type="button"
              onClick={() => {
                if (isHeadUsher) onSetActiveTab('attendance');
                else if (isResidentPastor) onSetActiveTab('prayers');
                else if (isSecretariat) onSetActiveTab('events');
                else onSetActiveTab('audit_logs');
              }}
              className="hover:underline cursor-pointer flex items-center gap-1 active:scale-[0.96] transition-transform duration-150"
            >
              <span>View Comprehensive Desk Records</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Right Card: Role Audited Table */}
        <div className="lg:col-span-8 bg-white rounded-[22px] p-6 border border-[#f0e4f3] shadow-[0_4px_24px_rgba(235,18,119,0.04)] flex flex-col justify-between">
          <div>
            {/* Header & Subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#1f2430] tracking-tight">
                  {isHeadUsher
                    ? 'Sanctuary Service Attendance Registry'
                    : isResidentPastor
                    ? 'Pastoral Care & Guest Assimilation Registry'
                    : isSecretariat
                    ? 'Parish Registry & Event Schedule Ledger'
                    : 'Ministry Operations & Treasury Ledger'}
                </h2>
                <p className="text-xs text-[#8a919e] font-medium mt-0.5">
                  {isHeadUsher
                    ? 'Audited headcount telemetry across Sunday & midweek services'
                    : isResidentPastor
                    ? 'Live tracking of visitor follow-up and pastoral counseling'
                    : isSecretariat
                    ? 'Official church events, visitor intake, and notices'
                    : 'Audited financial inflows and sanctuary attendance records'}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAddChoiceModal(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#ea1263] hover:bg-[#d80f58] active:scale-[0.96] text-white text-xs font-bold shadow-sm shadow-[#ea1263]/30 transition-transform duration-150 ease-out flex items-center gap-1.5 cursor-pointer"
                  aria-label="Add new record"
                >
                  <Plus size={13} strokeWidth={3} />
                  <span>
                    {isHeadUsher
                      ? 'Log Headcount'
                      : isResidentPastor
                      ? 'Add Care Note'
                      : isSecretariat
                      ? 'Add Entry'
                      : 'Record Entry'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  title="Export CSV"
                  aria-label="Export CSV"
                  className="w-7 h-7 rounded-lg border border-[#e8dfec] text-[#6b7280] hover:text-[#1f2430] hover:bg-[#faf4fc] active:scale-[0.96] flex items-center justify-center transition-colors duration-150 cursor-pointer"
                >
                  <Download size={13} />
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
                    placeholder="Search records..."
                    aria-label="Search records"
                    className="w-32 sm:w-40 pl-7 pr-2.5 py-1 text-xs rounded-lg bg-[#f7f2f9] border border-transparent focus:border-[#ea1263] focus:bg-white outline-none text-[#1b212f] placeholder-[#6b7280] transition-colors duration-150"
                  />
                  <Search size={12} className="absolute left-2.5 top-2 text-[#6b7280]" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl">
              <table className="w-full text-left text-xs border-collapse table-fixed">
                <thead>
                  <tr className="admin-table-head text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-2.5 w-[15%] rounded-l-lg">REF CODE</th>
                    <th className="py-2.5 px-2.5 w-[27%]">
                      {isHeadUsher ? 'SERVICE NAME' : isResidentPastor ? 'NAME / CONGREGANT' : isSecretariat ? 'PROGRAM / INTAKE' : 'CONTRIBUTOR / SOURCE'}
                    </th>
                    <th className="py-2.5 px-2.5 w-[23%]">
                      {isHeadUsher ? 'PROTOCOL OFFICER' : isResidentPastor ? 'SERVICE ATTENDED' : isSecretariat ? 'LOCATION / DETAILS' : 'MINISTRY CATEGORY'}
                    </th>
                    <th className="py-2.5 px-2.5 w-[18%]">
                      {isHeadUsher ? 'HEADCOUNT' : isResidentPastor ? 'CARE ASSIGNMENT' : isSecretariat ? 'CATEGORY' : 'AMOUNT / COUNT'}
                    </th>
                    <th className="py-2.5 px-2.5 text-right w-[17%] rounded-r-lg">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5eef7] text-[#2b2f38]">
                  {paginatedLedger.length > 0 ? (
                    paginatedLedger.map((row) => (
                      <tr key={row.id} className="ledger-table-row">
                        <td className="py-2.5 px-2.5 font-semibold text-[#4b5262] truncate tabular-nums" title={row.code}>
                          {row.code}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-[#1f2430] truncate" title={row.title}>
                          {row.title}
                        </td>
                        <td className="py-2.5 px-2.5 text-[#4b5262] truncate" title={row.category}>
                          {row.category}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-[#1f2430] truncate tabular-nums" title={row.value}>
                          {row.value}
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          <span className={`status-chip ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-[#8a919e]">
                        No matching desk records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer & Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#f4edf7] mt-3 text-[11px] text-[#6b7280] font-semibold">
            <div className="tabular-nums">
              Showing {filteredLedger.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredLedger.length)} of {filteredLedger.length} entries
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous Page"
                className="w-6 h-6 flex items-center justify-center rounded text-[#6b7280] hover:text-[#1f2430] disabled:opacity-40 cursor-pointer active:scale-[0.96] transition-transform duration-150"
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
                    aria-label={`Go to page ${pg}`}
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold cursor-pointer active:scale-[0.96] transition-colors duration-150 tabular-nums ${
                      isActive
                        ? 'bg-[#ea1263] text-white shadow-xs'
                        : 'text-[#6b7280] hover:bg-[#f7eff8] hover:text-[#1f2430]'
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
                aria-label="Next Page"
                className="w-6 h-6 flex items-center justify-center rounded text-[#6b7280] hover:text-[#1f2430] disabled:opacity-40 cursor-pointer active:scale-[0.96] transition-transform duration-150"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK RECORD ENTRY CHOICE MODAL                          */}
      {/* ======================================================== */}
      {showAddChoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-[#f0e4f3] relative">
            <h3 className="text-lg font-black text-[#1b212f] tracking-tight">
              {isHeadUsher
                ? 'Log Service Headcount'
                : isResidentPastor
                ? 'Add Pastoral Care Record'
                : isSecretariat
                ? 'Add Secretariat Record'
                : 'Record New Ministry Entry'}
            </h3>
            <p className="text-xs text-[#8a919e] font-medium mt-1">
              Select an action permitted for your assigned {roleConfig.title}:
            </p>

            <div className="mt-5 space-y-3">
              {/* Option: Headcount Logging (Available to Head Usher, Secretariat, Admin) */}
              {(isHeadUsher || isSecretariat || isAdmin || isDistrictOverseer) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddChoiceModal(false);
                    if (onOpenLogAttendanceModal) onOpenLogAttendanceModal();
                    else onSetActiveTab('headcount_logger');
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-[#f0e6f2] hover:border-[#6366f1] hover:bg-[#f5f3ff] active:scale-[0.98] transition-colors duration-150 flex items-center gap-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] text-[#6366f1] group-hover:bg-[#6366f1] group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-150">
                    <Activity size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#1f2430] group-hover:text-[#6366f1]">
                      Log Service Attendance
                    </div>
                    <div className="text-[11px] text-[#8a919e]">
                      Record Sunday headcount (7:30 AM / 9:30 AM) or midweek meeting
                    </div>
                  </div>
                </button>
              )}

              {/* Option: Guest Registration (Available to Resident Pastor, Secretariat, Admin) */}
              {(isResidentPastor || isSecretariat || isAdmin || isDistrictOverseer) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddChoiceModal(false);
                    onSetActiveTab('guests');
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-[#f0e6f2] hover:border-[#f59e0b] hover:bg-[#fffbeb] active:scale-[0.98] transition-colors duration-150 flex items-center gap-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#fffbeb] text-[#f59e0b] group-hover:bg-[#f59e0b] group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-150">
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#1f2430] group-hover:text-[#f59e0b]">
                      Register First-Time Guest
                    </div>
                    <div className="text-[11px] text-[#8a919e]">
                      Capture visitor details for pastoral welcome & assimilation
                    </div>
                  </div>
                </button>
              )}

              {/* Option: Prayer Request (Resident Pastor, Secretariat, Admin) */}
              {(isResidentPastor || isSecretariat || isAdmin || isDistrictOverseer) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddChoiceModal(false);
                    onSetActiveTab('prayers');
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-[#f0e6f2] hover:border-[#ea1263] hover:bg-[#fdf2f7] active:scale-[0.98] transition-colors duration-150 flex items-center gap-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#fdf2f7] text-[#ea1263] group-hover:bg-[#ea1263] group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-150">
                    <Heart size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#1f2430] group-hover:text-[#ea1263]">
                      Log Pastoral Prayer Petition
                    </div>
                    <div className="text-[11px] text-[#8a919e]">
                      Record intercessory requests into the Pastoral Care Desk
                    </div>
                  </div>
                </button>
              )}

              {/* Option: Financial Logging (ONLY for Admin & District Overseer) */}
              {(isAdmin || isDistrictOverseer) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddChoiceModal(false);
                    if (onOpenRecordFinanceModal) onOpenRecordFinanceModal();
                    else onSetActiveTab('finances');
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-[#f0e6f2] hover:border-[#10b981] hover:bg-[#ecfdf5] active:scale-[0.98] transition-colors duration-150 flex items-center gap-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] text-[#10b981] group-hover:bg-[#10b981] group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-150">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#1f2430] group-hover:text-[#10b981]">
                      Record Financial Transaction
                    </div>
                    <div className="text-[11px] text-[#8a919e]">
                      Record covenant tithe, offering, welfare disbursement or pledge
                    </div>
                  </div>
                </button>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddChoiceModal(false)}
                className="px-4 py-2 rounded-xl border border-[#e5dce7] text-xs font-bold text-[#6b7280] hover:text-[#1f2430] hover:bg-[#faf4fb] active:scale-[0.96] transition-colors duration-150 cursor-pointer"
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
