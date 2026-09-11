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
    title: 'முகப்பு',
    href: '/admin',
    iconName: 'layout-dashboard',
  },
  {
    title: 'நிலுவையில்',
    href: '/admin/profiles/pending',
    iconName: 'clock',
    badgeKey: 'pendingProfiles',
  },

  {
    title: 'நிராகரிக்கப்பட்டது',
    href: '/admin/profiles/rejected',
    iconName: 'x-circle',
  },
  {
    title: 'பொருத்தத்திற்குப் பிறகு நீக்கு',
    href: '/admin/users?status=matched_removed',
    iconName: 'users',
  },
  {
    title: 'பயனர்கள்',
    href: '/admin/users?status=all',
    iconName: 'users',
  },
  {
    title: 'நட்சத்திர பொருத்தம்',
    href: '/admin/compatibility',
    iconName: 'sparkles',
  },
  {
    title: 'பகுப்பாய்வு',
    href: '/admin/analytics',
    iconName: 'bar-chart-3',
  },
  {
    title: 'முகப்பு படங்கள்',
    href: '/admin/carousel',
    iconName: 'image',
  },
  {
    title: 'அமைப்புகள்',
    href: '/admin/settings',
    iconName: 'settings',
  }
];

export const RELIGIONS_LIST = [
  'Hindu',
  'Christian',
  'Muslim',
  'Jain',
  'Sikh',
  'Buddhist',
  'Inter-Religion (மதமாற்றத் திருமணம்)',
  'Other / Not Specified'
];

export const CASTES_LIST = [
  'Kongu Vellala Gounder',
  'Gounder (Other)',
  'Vanniyar',
  'Chettiar',
  'Mudaliar',
  'Pillai',
  'Naidu',
  'Brahmin',
  'Thevar / Mukkulathor',
  'Nadar',
  'Viswakarma / Achari',
  'Yadav / Konar',
  'Reddy',
  'Adidravidar',
  'Devendra Kula Vellalar',
  'Sourashtra',
  'Sengunthar / Kaikolar',
  'Inter-Caste',
  'Caste No Bar',
  'Other'
];

export const SUB_CASTES_MAP: Record<string, string[]> = {
  'Kongu Vellala Gounder': ['Kongu Vellalar', 'Senthalai', 'Padaithalai', 'Vettuva Gounder'],
  'Gounder (Other)': ['Kongu Vellalar', 'Senthalai', 'Padaithalai', 'Vettuva Gounder'],
  'Vanniyar': ['Vanniya Kula Kshatriyar', 'Padayachi', 'Gounder (Vanniyar)'],
  'Chettiar': ['Nattukottai Chettiar (Nagarathar)', 'Devanga Chettiar', 'Vaniyar Chettiar', 'Elur Chettiar', 'Ayira Vysya'],
  'Mudaliar': ['Thondaimandala Mudaliar', 'Arcot Mudaliar', 'Saiva Pillai', 'Karakatha Pillai', 'Seer Karunigar'],
  'Pillai': ['Thondaimandala Mudaliar', 'Arcot Mudaliar', 'Saiva Pillai', 'Karakatha Pillai', 'Seer Karunigar'],
  'Naidu': ['Kamma', 'Kapu', 'Balija', 'Gavara', 'Muthuraja'],
  'Brahmin': ['Iyer - Vadama', 'Iyer - Brahacharanam', 'Iyengar - Vadakalai', 'Iyengar - Tenkalai'],
  'Thevar / Mukkulathor': ['Kallar', 'Maravar', 'Agamudayar'],
  'Viswakarma / Achari': ['Kammalar', 'Gold Smith (Thattar)', 'Blacksmith (Kollan)', 'Carpenter (Thachchan)'],
  'Christian': ['Roman Catholic', 'CSI / Protestant', 'Pentecostal', 'Sunni', 'Shia'],
  'Muslim': ['Roman Catholic', 'CSI / Protestant', 'Pentecostal', 'Sunni', 'Shia']
};

export const KOOTTAM_LIST = [
  'Aandai', 'Aadar', 'Aadhi', 'Aadhirai', 'Aadhitreya Kumban', 'Aanthuvan', 'Aavan', 'Agini', 'Alagan', 'Anangan', 'Ariyan', 'Bharatan', 'Bramman', 'Dananjayan', 'Danavantan', 'Devendran', 'Eenjan', 'Ennai', 'Kaadan', 'Kaadai', 'Kaari', 'Kalingarayan', 'Kanavalan', 'Kanakkan', 'Kannan', 'Kannanthai', 'Keeran', 'Koorai', 'Koovendhar', 'Kuzhalayan', 'Maadar', 'Maadai', 'Maniyan', 'Mayilar', 'Medhi', 'Mulan', 'Mutthan', 'Muzhukathan', 'Neerunniyar', 'Ozukkar', 'Oothaalar', 'Pallavarayan', 'Panagkaadar', 'Panayan', 'Pandiyan', 'Pannai', 'Pathariar', 'Pathuman', 'Pavazhalar', 'Payiran', 'Periyan', 'Perunkudi', 'Pillar', 'Podiyan', 'Ponnar', 'Poochadhai', 'Poodhiyan', 'Poosan', 'Poondhai', 'Porulaanthai', 'Saakadai', 'Sariyan', 'Sathanthai', 'Sathuvaraayan', 'Sanagan', 'Sedan', 'Sellan', 'Sembonn', 'Sempoothan', 'Semvan', 'Sengannan', 'Sengunni', 'Seralan', 'Seran', 'Sevadi', 'Sevvayan', 'Sevvandhi', 'Silamban', 'Soman', 'Soolan', 'Sooriyan', 'Sothi', 'Sowriyan', 'Surapi', 'Thanakkavan', 'Thavalayan', 'Thazhinji', 'Themaan', 'Thodai', 'Thooran', 'Thorakkan', 'Thunduman', 'Uvanan', 'Uzhavan', 'Urugalan', 'Vaanan', 'Vaanavarayar', 'Vannakkan', 'Veliyan', 'Vellamban', 'Vendhai', 'Viliyan', 'Villi', 'Vilosanan', 'Viradhan', 'Viraivulan', 'Vizhiyar', 'Vennag', 'Other'
];

export const RASI_LIST = [
  'Mesham (மேஷம்)', 'Rishabam (ரிஷபம்)', 'Mithunam (மிதுனம்)', 'Kadagam (கடகம்)', 'Simmam (சிம்மம்)', 'Kanni (கன்னி)', 'Thulam (துலாம்)', 'Viruchigam (விருச்சிகம்)', 'Dhanusu (தனுசு)', 'Magaram (மகரம்)', 'Kumbam (கும்பம்)', 'Meenam (மீனம்)'
];

export const NAKSHATRAS_LIST = [
  'Aswini', 'Bharani', 'Karthigai (1st Pada)', 'Karthigai (2nd to 4th Pada)', 'Rohini', 'Mrigasheersham (1st & 2nd Pada)', 'Mrigasheersham (3rd & 4th Pada)', 'Thiruvaathirai', 'Punarpoosam (1st to 3rd Pada)', 'Punarpoosam (4th Pada)', 'Poosam', 'Ayilyam', 'Magam', 'Pooram', 'Uthiram (1st Pada)', 'Uthiram (2nd to 4th Pada)', 'Hastham (Astham)', 'Chithirai (1st & 2nd Pada)', 'Chithirai (3rd & 4th Pada)', 'Swathi', 'Visagam (1st to 3rd Pada)', 'Visagam (4th Pada)', 'Anusham', 'Kettai', 'Moolam', 'Pooradam', 'Uthiradam (1st Pada)', 'Uthiradam (2nd to 4th Pada)', 'Thiruvonam', 'Avittam (1st & 2nd Pada)', 'Avittam (3rd & 4th Pada)', 'Sathayam', 'Poorattadhi (1st to 3rd Pada)', 'Poorattadhi (4th Pada)', 'Uthirattadhi', 'Revathi'
];

export const DOSHAM_LIST = [
  'Sutham (சுத்தம்)', 'Rahu Kethu (ராகு கேது)', 'Chevvai (செவ்வாய்)', 'Rahu Kethu Chevvai (ராகு கேது செவ்வாய்)'
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
