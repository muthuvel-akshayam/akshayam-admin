// ==========================================
// TYPESCRIPT DEFINITIONS FOR ADMIN DASHBOARD
// ==========================================

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum ProfileStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  MATCHED_REMOVED = 'MATCHED_REMOVED',
}

export interface AdminUser {
  id: string | number; // allowing string since DB uses UUID string
  userIndex?: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED' | 'PENDING';
  registeredDate: string | Date;
  profileId?: number;
  isFeatured?: boolean;
  paymentScreenshot?: string | null;
}

export interface PhotoItem {
  id: string;
  url: string;
  isPrimary?: boolean;
  caption?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  url: string;
  type: 'ID_PROOF' | 'EDUCATION_PROOF' | 'SALARY_SLIP' | 'OTHER';
  verified?: boolean;
}

export interface FamilyInformation {
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  brothersCount?: number;
  brothersMarried?: number;
  sistersCount?: number;
  sistersMarried?: number;
  familyType?: 'JOINT' | 'NUCLEAR';
  familyValue?: 'ORTHODOX' | 'TRADITIONAL' | 'MODERATE' | 'LIBERAL';
  familyStatus?: 'MIDDLE_CLASS' | 'UPPER_MIDDLE_CLASS' | 'RICH' | 'AFFLUENT';
  nativePlace?: string;
}

export interface EducationOccupation {
  highestEducation?: string;
  educationDetails?: string;
  employedIn?: 'GOVERNMENT' | 'PRIVATE' | 'BUSINESS' | 'DEFENCE' | 'SELF_EMPLOYED' | 'NOT_WORKING';
  occupation?: string;
  occupationDetails?: string;
  annualIncome?: string;
  workLocation?: string;
}

export interface PrivacySettings {
  showPhotoTo?: 'ALL' | 'REGISTERED' | 'EXPRESS_INTEREST' | 'NOBODY';
  showPhoneTo?: 'ALL' | 'REGISTERED' | 'EXPRESS_INTEREST' | 'NOBODY';
  showJathagamTo?: 'ALL' | 'REGISTERED' | 'EXPRESS_INTEREST' | 'NOBODY';
}

export interface AdminProfile {
  id: string | number; // allowing string since DB uses UUID string
  userId: string | number;
  userIndex?: number;
  name: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  dateOfBirth?: string | Date;
  maritalStatus?: 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'AWAITING_DIVORCE';
  religion: string;
  caste: string;
  subCaste?: string;
  gothram?: string;
  nakshatra: string;
  rasi?: string;
  dosham?: string;
  city: string;
  state: string;
  country: string;
  height?: string;
  weight?: string;
  complexion?: string;
  physicalStatus?: 'NORMAL' | 'PHYSICALLY_CHALLENGED';
  aboutMe?: string;
  rasiGrid?: any;
  amsamGrid?: any;
  
  // Rich details
  family?: FamilyInformation;
  educationOccupation?: EducationOccupation;
  photos?: PhotoItem[];
  jathagamUrl?: string;
  documents?: DocumentItem[];
  privacy?: PrivacySettings;

  // Moderation fields
  status: ProfileStatus;
  approvedAt?: string | Date | null;
  approvedBy?: number | null;
  rejectedReason?: string | null;
  isLive: boolean;
  isFeatured?: boolean;
  registeredDate: string | Date;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MonthlyChartPoint {
  month: string;
  registrations: number;
  approvals: number;
  rejections: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  pendingProfiles: number;
  approvedProfiles: number;
  rejectedProfiles: number;
  todaysRegistrations: number;
  totalMale: number;
  totalFemale: number;
  approvalRate: number;
  recentProfiles: AdminProfile[];
  monthlyRegistrations: MonthlyChartPoint[];
  religionDistribution: ChartDataPoint[];
  casteDistribution: ChartDataPoint[];
}

export interface CompatibilityMatrixRow {
  id: number;
  maleNakshatra: string;
  femaleNakshatra: string;
  compatibilityScore: number;
  compatibilityType: 'Uthamam' | 'Madhyamam' | 'Adhamam' | string;
  notes?: string;
}

export interface ExcelCompatibilityRow {
  MaleNakshatra?: string;
  FemaleNakshatra?: string;
  Score?: number | string;
  Type?: string;
  Notes?: string;
  [key: string]: any;
}

export interface SiteSettingsData {
  id: string;
  minMaleAge: number;
  minFemaleAge: number;
  maxPhotoSizeMb: number;
  maxDocSizeMb: number;
  featuredProfilesLimit: number;
  maintenanceMode: boolean;
  siteTitle?: string;
  contactEmail?: string;
  defaultApprovalStatus?: string;
  [key: string]: any;
}

export interface FilterParams {
  query?: string;
  status?: ProfileStatus | 'ALL' | string;
  gender?: 'MALE' | 'FEMALE' | 'ALL' | string;
  religion?: string;
  caste?: string;
  minAge?: number;
  maxAge?: number;
  maritalStatus?: string;
  nakshatras?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'registeredDate' | 'name' | 'age';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type AdminSettings = SiteSettingsData;

