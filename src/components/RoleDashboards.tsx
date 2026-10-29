import {
  Activity,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Heart,
  MessageCircle,
  Phone,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users
} from 'lucide-react';
import type { Sermon, ChurchEvent } from '../types';
import type {
  GuestVisitRow,
  PrayerRequestRow,
  ServiceAttendanceRow,
  StaffUserRow,
  AuditLogRow
} from '../types/database';
import { ROLE_DEFINITIONS } from '../types/iam';

// ============================================================================
// 1. ADMINISTRATOR: IT SYSTEMS & CMS EXECUTIVE DASHBOARD
// ============================================================================
export interface AdminDashboardProps {
  totalRecentSundayHeadcount: number;
  staffUsers: StaffUserRow[];
  sermons: Sermon[];
  events: ChurchEvent[];
  auditLogs: AuditLogRow[];
  onSetActiveTab: (tab: string) => void;
  onOpenSermonModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  totalRecentSundayHeadcount,
  staffUsers,
  sermons,
  events,
  auditLogs,
  onSetActiveTab,
  onOpenSermonModal
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
            <Shield className="w-3 h-3 text-amber-400" />
            IT Systems &amp; Church Administration Desk
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Administrative &amp; IT Systems Executive Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full CMS control, RBAC staff credentials, Supabase database synchronization, and system audit trail.
          </p>
        </div>
        <button
          onClick={onOpenSermonModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Publish New Sermon
        </button>
      </div>

      {/* 4 Admin KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sunday Headcount</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalRecentSundayHeadcount || '1,220'}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">Combined 1st &amp; 2nd services</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Staff IAM Accounts</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{staffUsers.filter(u => u.is_active).length} / 5</div>
          <div className="text-[11px] text-blue-400 mt-1 font-medium">RBAC profiles active</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">CMS Content</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{sermons.length + events.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">{sermons.length} sermons • {events.length} events</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">System &amp; Cloud</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">Live</div>
          <div className="text-[11px] text-slate-400 mt-1">Supabase DB connected</div>
        </div>
      </div>

      {/* Administrator Quick Dispatch Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-amber-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Administrator Quick Dispatch
          </div>
          <h3 className="text-lg font-bold text-white">Full CMS &amp; Operations Governance Active</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage system security credentials, update website sermons &amp; events, and inspect the operational audit trail.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSetActiveTab('iam_staff')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            Manage Staff IAM
          </button>
          <button
            onClick={() => onSetActiveTab('sermons')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            Sermons CMS
          </button>
          <button
            onClick={() => onSetActiveTab('events')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            Calendar Events
          </button>
          <button
            onClick={() => onSetActiveTab('audit_logs')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4 text-purple-400" />
            Audit Trail
          </button>
        </div>
      </div>

      {/* Admin 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Col 1: Staff Accounts & IAM Roster */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Staff Role IAM Directory</h3>
            </div>
            <button
              onClick={() => onSetActiveTab('iam_staff')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Manage Credentials →
            </button>
          </div>
          <div className="space-y-2">
            {staffUsers.map((u) => (
              <div key={u.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-[11px]">
                    {u.avatar_initials}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {u.name}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        {(ROLE_DEFINITIONS[u.role] || ROLE_DEFINITIONS.admin).badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">Key: {u.passkey}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {u.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: System Audit Trail & Recent Events */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">System Audit Trail</h3>
            </div>
            <button
              onClick={() => onSetActiveTab('audit_logs')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Full Audit Logs →
            </button>
          </div>
          {auditLogs.length > 0 ? (
            <div className="space-y-2.5">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{log.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{log.details}</p>
                  <div className="text-[10px] text-slate-500">By: {log.staff_name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">No audit records logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. DISTRICT OVERSEER: APOSTOLIC & GOVERNANCE EXECUTIVE STUDY DASHBOARD
// ============================================================================
export interface DistrictOverseerDashboardProps {
  totalRecentSundayHeadcount: number;
  serviceAttendance: ServiceAttendanceRow[];
  prayerRequests: PrayerRequestRow[];
  sermons: Sermon[];
  staffUsers: StaffUserRow[];
  onSetActiveTab: (tab: string) => void;
}

export const DistrictOverseerDashboard: React.FC<DistrictOverseerDashboardProps> = ({
  totalRecentSundayHeadcount,
  serviceAttendance,
  prayerRequests,
  sermons,
  staffUsers,
  onSetActiveTab
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* DO Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Executive Study • District Governance &amp; Pulpit Ministry
              </span>
              <h1 className="text-2xl font-black text-white">Rev. Dr. O. A. Babalola</h1>
              <p className="text-xs text-slate-300 mt-0.5">District Overseer, FGC Mushin District Headquarters</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSetActiveTab('sermons')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <BookOpen className="w-4 h-4" />
              Preaching Roster
            </button>
            <button
              onClick={() => onSetActiveTab('overseer_directives')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              Ministerial Directives
            </button>
          </div>
        </div>
      </div>

      {/* 4 Overseer Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sunday Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">{totalRecentSundayHeadcount || '1,220'}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">1st (7:30 AM) &amp; 2nd (9:30 AM) Combined</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pastoral Intercessions</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">{prayerRequests.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Requiring pastoral attention</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Preaching Series</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{sermons.length}</div>
          <div className="text-[11px] text-sky-400 mt-1 font-medium">Recorded sermon studies</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pastoral Team</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{staffUsers.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Department officers active</div>
        </div>
      </div>

      {/* Overseer Dispatch Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            Apostolic Oversight Active
          </div>
          <h3 className="text-lg font-bold text-white">District Pastoral Shepherding &amp; Pulpit Ministry</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Review confidential prayer care requests, inspect Sunday service attendance, and issue directives to department heads.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSetActiveTab('prayers')}
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            Pastoral Prayers ({prayerRequests.length})
          </button>
          <button
            onClick={() => onSetActiveTab('attendance')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Attendance Pulse
          </button>
          <button
            onClick={() => onSetActiveTab('overseer_directives')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            Pastoral Cabinet
          </button>
        </div>
      </div>

      {/* 2-Column Overseer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Col 1: Sunday Service Headcount Breakdown Table */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Sunday Attendance Breakdown</h3>
            </div>
            <button
              onClick={() => onSetActiveTab('attendance')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              All Logs →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-2">Service</th>
                  <th className="py-2 px-2 text-right">Men</th>
                  <th className="py-2 px-2 text-right">Women</th>
                  <th className="py-2 px-2 text-right">Kids</th>
                  <th className="py-2 px-2 text-right font-bold text-white">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {serviceAttendance.slice(0, 3).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-2">
                      <div className="font-semibold text-white">{rec.service_name}</div>
                      <div className="text-[10px] text-slate-400">{rec.service_date}</div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-300">{rec.men_count}</td>
                    <td className="py-2.5 px-2 text-right text-slate-300">{rec.women_count}</td>
                    <td className="py-2.5 px-2 text-right text-slate-300">{rec.children_count}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-emerald-400">{rec.total_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Col 2: High-Priority Pastoral Intercessions */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Confidential Pastoral Intercessions</h3>
            </div>
            <button
              onClick={() => onSetActiveTab('prayers')}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              Open Prayer Desk ({prayerRequests.length}) →
            </button>
          </div>
          {prayerRequests.length > 0 ? (
            <div className="space-y-2.5">
              {prayerRequests.slice(0, 3).map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{p.full_name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2">"{p.request}"</p>
                  {p.phone && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {p.phone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">No active prayer petitions logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. RESIDENT PASTOR: SHEPHERDING & CONGREGATIONAL CARE DASHBOARD
// ============================================================================
export interface ResidentPastorDashboardProps {
  totalRecentSundayHeadcount: number;
  prayerRequests: PrayerRequestRow[];
  guestVisits: GuestVisitRow[];
  sermons: Sermon[];
  onSetActiveTab: (tab: string) => void;
  onOpenGuestNotes: (guest: GuestVisitRow) => void;
}

export const ResidentPastorDashboard: React.FC<ResidentPastorDashboardProps> = ({
  totalRecentSundayHeadcount,
  prayerRequests,
  guestVisits,
  sermons,
  onSetActiveTab,
  onOpenGuestNotes
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-1">
            <Heart className="w-3 h-3 text-sky-400" />
            Resident Shepherding &amp; Care Desk
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Resident Shepherding &amp; Congregational Care Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Flock oversight, first-time convert assimilation, counseling desks, and prayer intercessions.
          </p>
        </div>
        <button
          onClick={() => onSetActiveTab('prayers')}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Heart className="w-4 h-4" />
          Pastoral Counseling Desk
        </button>
      </div>

      {/* 4 Resident Pastor KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Prayer Petitions</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">{prayerRequests.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting pastoral care</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">First-Time Visitors</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{guestVisits.length}</div>
          <div className="text-[11px] text-sky-400 mt-1 font-medium">To assimilate into church</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sunday Congregation</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalRecentSundayHeadcount || '1,220'}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">Combined attendance</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sermon Recordings</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{sermons.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Discipleship resources</div>
        </div>
      </div>

      {/* Resident Pastor Dispatch Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-2">
            <Heart className="w-3.5 h-3.5" />
            Congregational Pastoral Shepherding
          </div>
          <h3 className="text-lg font-bold text-white">Flock Assimilation &amp; Pastoral Counseling</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Follow up with first-time worshipers, log pastoral counseling notes, and pray for congregant petitions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSetActiveTab('guests')}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            First-Time Guest Care ({guestVisits.length})
          </button>
          <button
            onClick={() => onSetActiveTab('prayers')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            Pastoral Counseling
          </button>
          <button
            onClick={() => onSetActiveTab('attendance')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Attendance Logs
          </button>
        </div>
      </div>

      {/* 2-Column Pastor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Col 1: First-Time Visitors Awaiting Pastoral Assimilation */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">First-Time Visitors Awaiting Follow-Up</h3>
            </div>
            <button
              onClick={() => onSetActiveTab('guests')}
              className="text-xs text-sky-400 hover:underline font-semibold"
            >
              Guest Dossier ({guestVisits.length}) →
            </button>
          </div>
          {guestVisits.length > 0 ? (
            <div className="space-y-2.5">
              {guestVisits.slice(0, 3).map((g) => (
                <div key={g.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{g.full_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold">
                      {g.service_time || 'Sunday Service'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Party: {(g.adults_count || 1) + (g.kids_count || 0)} • {g.created_at ? new Date(g.created_at).toLocaleDateString() : 'Recent'}</span>
                    {g.phone && (
                      <a href={`tel:${g.phone}`} className="text-emerald-400 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {g.phone}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => onOpenGuestNotes(g)}
                    className="w-full mt-1 py-1.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/40 border border-sky-500/20 text-sky-300 font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Log Pastoral Care Note
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">No visitor registrations recorded yet.</div>
          )}
        </div>

        {/* Col 2: Congregational Prayer Petitions */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Prayer &amp; Counseling Petitions</h3>
            </div>
            <button
              onClick={() => onSetActiveTab('prayers')}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              All Prayers ({prayerRequests.length}) →
            </button>
          </div>
          {prayerRequests.length > 0 ? (
            <div className="space-y-2.5">
              {prayerRequests.slice(0, 3).map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{p.full_name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2">"{p.request}"</p>
                  <div className="text-[10px] text-slate-500">
                    {p.is_confidential ? '🔒 Confidential Pastoral Matter' : 'General Intercession'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">No prayer requests in queue.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. HEAD USHER: SANCTUARY PROTOCOL & ATTENDANCE OPERATIONS DASHBOARD
// ============================================================================
export interface HeadUsherDashboardProps {
  totalRecentSundayHeadcount: number;
  latestSundayAttendance: ServiceAttendanceRow[];
  serviceAttendance: ServiceAttendanceRow[];
  guestVisits: GuestVisitRow[];
  onSetActiveTab: (tab: string) => void;
}

export const HeadUsherDashboard: React.FC<HeadUsherDashboardProps> = ({
  totalRecentSundayHeadcount,
  latestSundayAttendance,
  serviceAttendance,
  guestVisits,
  onSetActiveTab
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-1">
            <Activity className="w-3 h-3 text-rose-400" />
            Ushering &amp; Sanctuary Protocol Desk
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Sanctuary Protocol &amp; Attendance Operations Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sanctuary logistics, service headcounts, seating distribution, ushering protocol, and visitor arrival orderliness.
          </p>
        </div>
        <button
          onClick={() => onSetActiveTab('headcount_logger')}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log Service Headcount
        </button>
      </div>

      {/* 4 Head Usher KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sunday Headcount</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalRecentSundayHeadcount || '1,220'}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">1st &amp; 2nd Services Combined</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">1st Service (7:30 AM)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">{latestSundayAttendance[1]?.total_count || 510}</div>
          <div className="text-[11px] text-slate-400 mt-1">M: 185 | W: 230 | K: 95</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">2nd Service (9:30 AM)</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-400">{latestSundayAttendance[0]?.total_count || 710}</div>
          <div className="text-[11px] text-slate-400 mt-1">M: 240 | W: 310 | K: 160</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Guests Welcomed</span>
            <UserCheck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">{guestVisits.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Arrived &amp; seated</div>
        </div>
      </div>

      {/* Head Usher Dispatch Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5" />
            Live Sanctuary Headcount &amp; Protocol
          </div>
          <h3 className="text-lg font-bold text-white">Sunday Attendance Recording &amp; Sanctuary Logistics</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Record exact attendance counts for men, women, and children across services, and maintain usher protocol orderliness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSetActiveTab('headcount_logger')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            Log Headcount Now
          </button>
          <button
            onClick={() => onSetActiveTab('attendance')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-amber-400" />
            Attendance History
          </button>
          <button
            onClick={() => onSetActiveTab('guests')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-sky-400" />
            Guest Arrivals ({guestVisits.length})
          </button>
        </div>
      </div>

      {/* 2-Column Usher Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Col 1: Recent Attendance Logs Table */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Recent Attendance Logs</h3>
            </div>
            <button
              onClick={() => onSetActiveTab('headcount_logger')}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              + Log New →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-2">Service</th>
                  <th className="py-2 px-2 text-right">Men</th>
                  <th className="py-2 px-2 text-right">Women</th>
                  <th className="py-2 px-2 text-right">Kids</th>
                  <th className="py-2 px-2 text-right font-bold text-white">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {serviceAttendance.slice(0, 4).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-2">
                      <div className="font-semibold text-white">{rec.service_name}</div>
                      <div className="text-[10px] text-slate-400">{rec.service_date}</div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-300">{rec.men_count}</td>
                    <td className="py-2.5 px-2 text-right text-slate-300">{rec.women_count}</td>
                    <td className="py-2.5 px-2 text-right text-slate-300">{rec.children_count}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-emerald-400">{rec.total_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Col 2: Sanctuary Protocol Checklist */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Sanctuary Protocol &amp; Orderliness Guidelines</h3>
          </div>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Main Sanctuary Seating Logistics</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Ensure Ground floor (capacity: 850) is filled front-to-back before directing congregation to Gallery (capacity: 400).
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Offering Security &amp; Marshals</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Two designated ushers must witness and escort all tithe &amp; offering baskets directly to the counting room.
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">First-Time Visitor Welcome Packets</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Provide welcoming slips and FGC Mushin pens to all standing first-time visitors during acknowledgment.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. SECRETARIAT: CHURCH SECRETARIAT & REGISTRY OPERATIONS DASHBOARD
// ============================================================================
export interface SecretariatDashboardProps {
  totalRecentSundayHeadcount: number;
  guestVisits: GuestVisitRow[];
  events: ChurchEvent[];
  onSetActiveTab: (tab: string) => void;
  onOpenEventModal: () => void;
}

export const SecretariatDashboard: React.FC<SecretariatDashboardProps> = ({
  totalRecentSundayHeadcount,
  guestVisits,
  events,
  onSetActiveTab,
  onOpenEventModal
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
            <ClipboardList className="w-3 h-3 text-emerald-400" />
            Church Secretariat &amp; Registry Desk
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Church Secretariat &amp; Registry Operations Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Official church registry, first-time visitor intakes, event calendar scheduling, and public announcements.
          </p>
        </div>
        <button
          onClick={onOpenEventModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Calendar Event
        </button>
      </div>

      {/* 4 Secretariat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Guests</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{guestVisits.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">Recorded in registry</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Events</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{events.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Calendar gatherings</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Public Announcements</span>
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">1 Active</div>
          <div className="text-[11px] text-slate-400 mt-1">Broadcast on site banner</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Attendance</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalRecentSundayHeadcount || '1,220'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Archived in records</div>
        </div>
      </div>

      {/* Secretariat Dispatch Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            Secretariat &amp; Records Administration
          </div>
          <h3 className="text-lg font-bold text-white">Registry, Visitor Intake &amp; Public Announcements</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Process first-time guest intake forms, coordinate district calendar programs, and broadcast official announcements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSetActiveTab('guests')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            Guest Intake Registry
          </button>
          <button
            onClick={() => onSetActiveTab('events')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            Calendar &amp; Events
          </button>
          <button
            onClick={() => onSetActiveTab('settings')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            Public Announcements
          </button>
        </div>
      </div>

      {/* 2-Column Secretariat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Col 1: Guest Intake Registry Dossier */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recent Guest Intake Registry</h3>
            </div>
            <button
              onClick={() => onSetActiveTab('guests')}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              All Registrations ({guestVisits.length}) →
            </button>
          </div>
          {guestVisits.length > 0 ? (
            <div className="space-y-2.5">
              {guestVisits.slice(0, 3).map((g) => (
                <div key={g.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{g.full_name}</div>
                    <div className="text-[11px] text-slate-400">{g.phone || 'No phone'} • Party: {(g.adults_count || 1) + (g.kids_count || 0)}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                      {g.created_at ? new Date(g.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">No visitor records logged yet.</div>
          )}
        </div>

        {/* Col 2: Upcoming Church Calendar Events */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Upcoming Gatherings &amp; Events</h3>
            </div>
            <button
              onClick={() => onSetActiveTab('events')}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Calendar ({events.length}) →
            </button>
          </div>
          {events.length > 0 ? (
            <div className="space-y-2.5">
              {events.slice(0, 3).map((ev) => (
                <div key={ev.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{ev.title}</div>
                    <div className="text-[11px] text-slate-400">{ev.time} • {ev.location}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400">
                      {ev.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">No upcoming events scheduled.</div>
          )}
        </div>
      </div>
    </div>
  );
};
