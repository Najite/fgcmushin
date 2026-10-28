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
    badgeColor: '#2866AD', // FGC Healer Blue
    badgeBg: 'rgba(40, 102, 173, 0.08)',
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
    badgeColor: '#B86B0E', // FGC Gold Dark
    badgeBg: 'rgba(243, 166, 69, 0.12)',
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
    badgeColor: '#1E4E85', // FGC Blue Dark
    badgeBg: 'rgba(40, 102, 173, 0.10)',
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
    badgeColor: '#A32371', // FGC Purple Dark
    badgeBg: 'rgba(204, 70, 149, 0.10)',
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
    badgeColor: '#C9242A', // FGC Red Dark
    badgeBg: 'rgba(237, 59, 65, 0.10)',
    description: 'Service headcount logging (7:30 AM & 9:30 AM), sanctuary capacity, and guest reception protocol.',
    primaryDesk: 'Ushering & Protocol Operations Desk',
    permissions: [
      'log_attendance'
    ]
  }
};
