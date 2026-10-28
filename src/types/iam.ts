export type ChurchRole = 
  | 'admin' 
  | 'district_overseer' 
  | 'resident_pastor' 
  | 'secretariat' 
  | 'head_usher';

export const ChurchRole = {
  admin: 'admin',
  district_overseer: 'district_overseer',
  resident_pastor: 'resident_pastor',
  secretariat: 'secretariat',
  head_usher: 'head_usher'
} as const;

export type ChurchPermission = 
  | 'manage_cms'             // Sermons, Events, Website Settings
  | 'manage_staff_iam'        // Staff accounts, roles, access
  | 'view_executive_pulse'    // District Overseer executive pulse & directives
  | 'manage_pastoral_care'    // First-time guest care & prayer requests
  | 'manage_secretariat'      // Events calendar, announcements, meeting book
  | 'log_attendance'          // Service headcount & sanctuary capacity
  | 'view_financials';        // Giving records & stewardship

export interface RoleDefinition {
  id: ChurchRole;
  title: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  description: string;
  primaryDesk: string;
  permissions: ChurchPermission[];
}

export const ROLE_DEFINITIONS: Record<ChurchRole, RoleDefinition> = {
  admin: {
    id: 'admin',
    title: 'Church Administrator & IT Director',
    badge: 'Administrator',
    badgeColor: '#60a5fa', // blue-400
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    description: 'Complete system governance, CMS control, staff account provisioning, and operational management.',
    primaryDesk: 'Executive Operations & CMS Suite',
    permissions: [
      'manage_cms',
      'manage_staff_iam',
      'view_executive_pulse',
      'manage_pastoral_care',
      'manage_secretariat',
      'log_attendance',
      'view_financials'
    ]
  },
  district_overseer: {
    id: 'district_overseer',
    title: 'District Overseer & Senior Pastor',
    badge: 'Senior Pastor / DO',
    badgeColor: '#fbbf24', // amber-400
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    description: 'Spiritual leadership, district governance, preaching oversight, and pastoral growth trajectory.',
    primaryDesk: "District Overseer's Executive Study",
    permissions: [
      'view_executive_pulse',
      'manage_pastoral_care',
      'view_financials',
      'log_attendance'
    ]
  },
  resident_pastor: {
    id: 'resident_pastor',
    title: 'Resident Pastor',
    badge: 'Resident Pastor',
    badgeColor: '#38bdf8', // sky-400
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    description: 'Congregational shepherding, first-time guest follow-up, pastoral counseling, and service coordination.',
    primaryDesk: "Resident Pastor's Shepherding Desk",
    permissions: [
      'manage_pastoral_care',
      'manage_cms',
      'log_attendance'
    ]
  },
  secretariat: {
    id: 'secretariat',
    title: 'Church Secretariat & Records',
    badge: 'Secretariat',
    badgeColor: '#34d399', // emerald-400
    badgeBg: 'rgba(52, 211, 153, 0.15)',
    description: 'Church records, guest registry intake, official calendar scheduling, and public announcements.',
    primaryDesk: 'Church Secretariat & Office Operations',
    permissions: [
      'manage_secretariat',
      'manage_cms',
      'log_attendance'
    ]
  },
  head_usher: {
    id: 'head_usher',
    title: 'Head Usher & Protocol Director',
    badge: 'Head Usher & Protocol',
    badgeColor: '#f87171', // red-400
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    description: 'Service headcount logging (7:30 AM & 9:30 AM), sanctuary capacity, and guest reception protocol.',
    primaryDesk: 'Ushering & Protocol Operations Desk',
    permissions: [
      'log_attendance'
    ]
  }
};
