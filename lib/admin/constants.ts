// ==========================================
// CONSTANTS FOR ADMIN DASHBOARD
// ==========================================

import { ProfileStatus, SiteSettingsData } from '../../types/admin';

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badgeKey?: 'pendingProfiles';
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    iconName: 'layout-dashboard',
  },
  {
    title: 'Pending',
    href: '/admin/users?status=pending',
    iconName: 'clock',
    badgeKey: 'pendingProfiles',
  },

  {
    title: 'Denied',
    href: '/admin/users?status=denied',
    iconName: 'x-circle',
  },
  {
    title: 'Remove After Match',
    href: '/admin/users?status=matched_removed',
    iconName: 'users',
  },
  {
    title: 'Users',
    href: '/admin/users?status=all',
    iconName: 'users',
  },
  {
    title: 'Nakshatra Compatibility',
    href: '/admin/compatibility',
    iconName: 'sparkles',
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    iconName: 'bar-chart-3',
  },
  {
    title: 'Carousel',
    href: '/admin/carousel',
    iconName: 'sparkles',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    iconName: 'settings',
  },
];

export const NAKSHATRAS_LIST = [
  'Ashwini',
  'Bharani',
  'Krittika (Karthigai)',
  'Rohini',
  'Mrigashira (Mrigashirsham)',
  'Ardra (Thiruvathirai)',
  'Punarvasu (Punarpoosam)',
  'Pushya (Poosam)',
  'Ashlesha (Ayilyam)',
  'Magha (Makam)',
  'Purva Phalguni (Pooram)',
  'Uttara Phalguni (Uthiram)',
  'Hasta (Hastham)',
  'Chitra (Chithirai)',
  'Swati (Swathi)',
  'Vishakha (Visakam)',
  'Anuradha (Anusham)',
  'Jyeshtha (Kettai)',
  'Mula (Moolam)',
  'Purva Ashadha (Pooradam)',
  'Uttara Ashadha (Uthiradam)',
  'Shravana (Thiruvonam)',
  'Dhanishta (Avittam)',
  'Shatabhisha (Sathayam)',
  'Purva Bhadrapada (Poorattathi)',
  'Uttara Bhadrapada (Uthirattathi)',
  'Revati',
];

export const RELIGIONS_LIST = [
  'Hindu',
  'Christian',
  'Muslim',
  'Jain',
  'Sikh',
  'Buddhist',
  'Parsi',
  'Inter-Religion',
  'Other',
];

export const CASTES_LIST = [
  'Brahmin - Iyer',
  'Brahmin - Iyengar',
  'Chettiar',
  'Gounder',
  'Mudaliar',
  'Nadar',
  'Naidu',
  'Pillai',
  'Thevar',
  'Vanniyar',
  'Viswakarma',
  'Yadav',
  'Inter-Caste',
  'Other',
];

export const STATUS_STYLES = {
  [ProfileStatus.PENDING]: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200   ',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  [ProfileStatus.APPROVED]: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200   ',
    dot: 'bg-emerald-500',
    label: 'Approved',
  },
  [ProfileStatus.REJECTED]: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200   ',
    dot: 'bg-rose-500',
    label: 'Rejected',
  },
  ACTIVE: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200   ',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  SUSPENDED: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200   ',
    dot: 'bg-amber-500',
    label: 'Suspended',
  },
  DELETED: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200   ',
    dot: 'bg-slate-500',
    label: 'Deleted',
  },
};

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  id: 'default_settings',
  minMaleAge: 21,
  minFemaleAge: 18,
  maxPhotoSizeMb: 5,
  maxDocSizeMb: 10,
  featuredProfilesLimit: 12,
  maintenanceMode: false,
  siteTitle: 'Akshayam Matrimony',
  contactEmail: 'admin@akshayam.com',
  defaultApprovalStatus: 'PENDING',
};
