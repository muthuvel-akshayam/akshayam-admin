// ==========================================
// PROFILE SERVICE - MODERATION & CRUD
// ==========================================

import prisma from '../../lib/admin/db';
import { logAdminAction } from '../../lib/admin/auth';
import {
  AdminProfile,
  AdminDashboardStats,
  FilterParams,
  PaginatedResponse,
  ProfileStatus,
  ChartDataPoint,
  MonthlyChartPoint,
} from '../../types/admin';



export class ProfileService {
  /**
   * Retrieves high-level analytics and statistical counts for the dashboard
   */
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const db = prisma as any;
      
      // Calculate start of today in local timezone
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Attempt to query real counts from Prisma
      const [
        totalUsers,
        pendingProfiles,
        approvedProfiles,
        rejectedProfiles,
        todaysRegistrations,
        totalMale,
        totalFemale,
        recentProfilesRaw,
      ] = await Promise.all([
        db.user?.count() ?? 0,
        db.profile?.count({ where: { status: 'PENDING' } }) ?? 0,
        db.profile?.count({ where: { status: 'APPROVED' } }) ?? 0,
        db.profile?.count({ where: { status: 'REJECTED' } }) ?? 0,
        db.user?.count({ where: { createdAt: { gte: todayStart } } }) ?? 0,
        db.profile?.count({ where: { gender: 'MALE' } }) ?? 0,
        db.profile?.count({ where: { gender: 'FEMALE' } }) ?? 0,
        db.profile?.findMany({
          take: 5,
          orderBy: { id: 'desc' },
        }) ?? [],
      ]);

      const totalProfiles = pendingProfiles + approvedProfiles + rejectedProfiles;
      const approvalRate = totalProfiles > 0 ? Math.round((approvedProfiles / totalProfiles) * 100) : 0;

      const recentProfiles: AdminProfile[] = recentProfilesRaw.map(ProfileService.formatProfile);

      const monthlyRegistrations: MonthlyChartPoint[] = [];
      const religionDistribution: ChartDataPoint[] = [];
      const casteDistribution: ChartDataPoint[] = [];

      return {
        totalUsers: typeof totalUsers === 'number' ? totalUsers : 0,
        pendingProfiles: typeof pendingProfiles === 'number' ? pendingProfiles : 0,
        approvedProfiles: typeof approvedProfiles === 'number' ? approvedProfiles : 0,
        rejectedProfiles: typeof rejectedProfiles === 'number' ? rejectedProfiles : 0,
        todaysRegistrations: typeof todaysRegistrations === 'number' ? todaysRegistrations : 0,
        totalMale: typeof totalMale === 'number' ? totalMale : 0,
        totalFemale: typeof totalFemale === 'number' ? totalFemale : 0,
        approvalRate,
        recentProfiles,
        monthlyRegistrations,
        religionDistribution,
        casteDistribution,
      };
    } catch (error) {
      console.warn('Error fetching dashboard stats from DB, serving fallback:', error);
      return {
        totalUsers: 0,
        pendingProfiles: 0,
        approvedProfiles: 0,
        rejectedProfiles: 0,
        todaysRegistrations: 0,
        totalMale: 0,
        totalFemale: 0,
        approvalRate: 0,
        recentProfiles: [],
        monthlyRegistrations: [],
        religionDistribution: [],
        casteDistribution: [],
      };
    }
  }

  /**
   * Retrieves paginated profiles with flexible sorting and filtering
   */
  static async getProfiles(
    filters: FilterParams = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<AdminProfile>> {
    try {
      const db = prisma as any;
      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (filters.status && filters.status !== 'ALL') {
        where.status = filters.status;
      }
      if (filters.gender && filters.gender !== 'ALL') {
        where.gender = filters.gender;
      }
      if (filters.maritalStatus && filters.maritalStatus !== 'ALL') {
        where.maritalStatus = filters.maritalStatus;
      }
      if (filters.religion) {
        where.religion = { contains: filters.religion, mode: 'insensitive' };
      }
      if (filters.caste) {
        where.caste = { contains: filters.caste, mode: 'insensitive' };
      }
      if (filters.nakshatras && filters.nakshatras.length > 0) {
        where.nakshatra = { in: filters.nakshatras };
      }
      if (filters.rasi) {
        where.rasi = { equals: filters.rasi };
      }
      if (filters.dosham) {
        where.dosham = { equals: filters.dosham };
      }
      if (filters.skinColour) {
        where.skinColour = { equals: filters.skinColour };
      }

      if (filters.minHeight || filters.maxHeight) {
        where.height = {};
        if (filters.minHeight) where.height.gte = filters.minHeight;
        if (filters.maxHeight) where.height.lte = filters.maxHeight;
      }

      // Age filter by dob
      if (filters.minAge || filters.maxAge) {
        const today = new Date();
        const minDate = filters.maxAge ? new Date(today.getFullYear() - filters.maxAge - 1, today.getMonth(), today.getDate()) : undefined;
        const maxDate = filters.minAge ? new Date(today.getFullYear() - filters.minAge, today.getMonth(), today.getDate()) : undefined;
        
        if (minDate || maxDate) {
          where.dob = {};
          if (minDate) where.dob.gte = minDate;
          if (maxDate) where.dob.lte = maxDate;
        }
      }

      // Relations filtering
      let hasUserFilter = false;
      const userWhere: any = {};
      const expectationsWhere: any = {};
      const familyWhere: any = {};

      if (filters.preferredCities && filters.preferredCities.length > 0) {
        expectationsWhere.preferredLocations = { hasSome: filters.preferredCities };
        hasUserFilter = true;
      }
      
      if (filters.preferredProfessions && filters.preferredProfessions.length > 0) {
        expectationsWhere.preferredSectors = { hasSome: filters.preferredProfessions };
        hasUserFilter = true;
      }

      if (filters.workLocations && filters.workLocations.length > 0) {
        // Since workingAddress is a string, we map to multiple contains using OR, but Prisma inside relation is tricky.
        // If exact match is okay or if we use string equals. Let's use OR for multiple locations.
        familyWhere.OR = filters.workLocations.map(loc => ({
          workingAddress: { contains: loc, mode: 'insensitive' }
        }));
        hasUserFilter = true;
      }

      if (Object.keys(expectationsWhere).length > 0) {
        userWhere.expectations = expectationsWhere;
      }
      if (Object.keys(familyWhere).length > 0) {
        userWhere.family = familyWhere;
      }

      if (hasUserFilter) {
        where.user = userWhere;
      }

      if (filters.query) {
        where.OR = [
          { name: { contains: filters.query, mode: 'insensitive' } },
          { city: { contains: filters.query, mode: 'insensitive' } },
          { nakshatra: { contains: filters.query, mode: 'insensitive' } },
          { caste: { contains: filters.query, mode: 'insensitive' } },
        ];
      }

      const sortField = filters.sortBy === 'name' ? 'name' : filters.sortBy === 'age' ? 'age' : 'id';
      const sortOrder = filters.sortOrder || 'desc';

      let prismaOrderBy: any;
      if (sortField === 'name') {
        prismaOrderBy = { name: sortOrder };
      } else if (sortField === 'age') {
        // older dob = higher age, so age desc = dob asc
        prismaOrderBy = { dob: sortOrder === 'desc' ? 'asc' : 'desc' };
      } else {
        // Default: Sort by latest registered
        prismaOrderBy = { user: { createdAt: sortOrder } };
      }

      if (db.profile) {
        // Handle in-memory filtering for text-based financial fields if they are requested
        const requiresMemoryFilter = !!(filters.propertyValue || filters.minPavan || filters.maxPavan);
        
        let rawProfiles = [];
        let total = 0;

        if (requiresMemoryFilter) {
          // Fetch all matching basic where clause to filter in memory
          const allMatching = await db.profile.findMany({
            where,
            orderBy: prismaOrderBy,
            include: {
              user: { include: { family: { include: { siblings: true } } } },
              educations: true,
            },
          });

          // Memory filter
          const extractNum = (str: string) => {
            if (!str) return 0;
            const match = str.match(/\d+(\.\d+)?/);
            return match ? parseFloat(match[0]) : 0;
          };

          const filtered = allMatching.filter((p: any) => {
            const family = p.user?.family;
            if (!family) return false;

            if (filters.propertyValue) {
              const val = family.totalAssetValue || '';
              // Example logic for "Below X Cr" or "X+ Cr"
              if (filters.propertyValue.includes('Below')) {
                const max = extractNum(filters.propertyValue);
                if (extractNum(val) > max) return false;
              } else if (filters.propertyValue.includes('+')) {
                const min = extractNum(filters.propertyValue);
                if (extractNum(val) < min) return false;
              } else {
                if (!val.toLowerCase().includes(filters.propertyValue.toLowerCase())) return false;
              }
            }

            if (filters.minPavan || filters.maxPavan) {
              const pavan = extractNum(family.dowryDetails);
              if (filters.minPavan && pavan < filters.minPavan) return false;
              if (filters.maxPavan && pavan > filters.maxPavan) return false;
            }

            return true;
          });

          total = filtered.length;
          rawProfiles = filtered.slice(skip, skip + limit);
        } else {
          // Standard DB pagination
          [rawProfiles, total] = await Promise.all([
            db.profile.findMany({
              where,
              skip,
              take: limit,
              orderBy: prismaOrderBy,
              include: {
                user: { include: { family: { include: { siblings: true } } } },
                educations: true,
              },
            }),
            db.profile.count({ where }),
          ]);
        }

        if (rawProfiles.length > 0 || total > 0) {
          return {
            data: rawProfiles.map(ProfileService.formatProfile),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          };
        }
      }
    } catch (error) {
      console.error('DB query failed in getProfiles, falling back to mock:', error);
    }

    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1,
    };
  }

  /**
   * Fetches a single profile by ID with all related details
   */
  static async getProfileById(id: string | number): Promise<AdminProfile | null> {
    try {
      const db = prisma as any;
      if (db.profile) {
        const raw = await db.profile.findUnique({
          where: { id: String(id) },
          include: {
            user: { include: { family: { include: { siblings: true } } } },
            educations: true,
          },
        });
        if (raw) return ProfileService.formatProfile(raw);
      }
    } catch (error) {
      console.warn('DB query failed in getProfileById:', error);
    }

    return null;
  }

  /**
   * Moderates a profile: Approve or Reject
   * Implements exact specification:
   * - Approve: status=APPROVED, isLive=true, approvedAt=now, approvedBy=adminId
   * - Reject: status=REJECTED, isLive=false, rejectedReason=reason
   */
  static async moderateProfile(
    id: string | number,
    status: ProfileStatus,
    adminId: string | number,
    rejectedReason?: string
  ): Promise<AdminProfile> {
    const isLive = status === ProfileStatus.APPROVED;
    const approvedAt = status === ProfileStatus.APPROVED ? new Date() : null;
    const approvedBy = status === ProfileStatus.APPROVED ? String(adminId) : null;
    const reason = status === ProfileStatus.REJECTED ? (rejectedReason || 'Does not meet guidelines') : null;

    try {
      const db = prisma as any;
      if (db.profile) {
        // Use Prisma transaction to ensure consistency
        const updated = await prisma.$transaction(async (tx: any) => {
          const prof = await tx.profile.update({
            where: { id: String(id) },
            data: {
              status,
              isLive,
              approvedAt,
              approvedBy,
              rejectedReason: reason,
            },
          });

          return prof;
        });

        // Async audit log
        await logAdminAction(adminId, `MODERATE_PROFILE_${status}`, id, { reason });

        return ProfileService.formatProfile(updated);
      }
    } catch (error) {
      console.warn('DB transaction failed in moderateProfile, updating mock fallback:', error);
    }

    throw new Error('Profile update failed');
  }

  /**
   * Deletes a profile permanently or marks as inactive
   */
  static async deleteProfile(id: string | number, adminId: number | string): Promise<boolean> {
    try {
      const db = prisma as any;
      if (db.profile) {
        await db.profile.delete({ where: { id: String(id) } });
        await logAdminAction(adminId, 'DELETE_PROFILE', id);
        return true;
      }
    } catch (error) {
      console.warn('DB delete failed:', error);
    }
    return true;
  }

  /**
   * Restores a deleted profile back to pending status
   */
  static async restoreProfile(id: string | number, adminId: number | string): Promise<AdminProfile> {
    return ProfileService.moderateProfile(id, ProfileStatus.PENDING, adminId);
  }

  /**
   * Creates a new profile from admin panel with comprehensive details
   */
  static async createProfile(data: any, adminId: number | string): Promise<AdminProfile> {
    try {
      const db = prisma as any;
      if (db.profile) {
        const userId = 'ADM_USR_' + Date.now() + Math.floor(Math.random() * 1000);
        const profileId = 'ADM_PRF_' + Date.now() + Math.floor(Math.random() * 1000);
        const familyId = 'ADM_FAM_' + Date.now() + Math.floor(Math.random() * 1000);
        const expId = 'ADM_EXP_' + Date.now() + Math.floor(Math.random() * 1000);

        let dob = new Date();
        if (data.dateOfBirth) {
          let cleanStr = data.dateOfBirth.replace(/\D/g, '');
          if (cleanStr.length === 8) {
            dob = new Date(`${cleanStr.slice(4, 8)}-${cleanStr.slice(2, 4)}-${cleanStr.slice(0, 2)}`);
          } else {
            const parts = data.dateOfBirth.split(/[-/]/);
            if (parts.length === 3 && parts[2].length === 4) {
              dob = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else {
              dob = new Date(data.dateOfBirth);
            }
          }
        } else if (data.age) {
          dob.setFullYear(dob.getFullYear() - Number(data.age));
        }

        // Map siblings
        const siblingsData = Array.isArray(data.siblings) ? data.siblings.map((sib: any) => ({
          id: 'ADM_SIB_' + Date.now() + Math.floor(Math.random() * 10000),
          name: sib.name || 'Unknown',
          relation: sib.relation || 'Sibling',
          status: sib.status || 'Unmarried'
        })) : [];

        // Create nested user with family, siblings, expectations
        const createdUser = await db.user.create({
          data: {
            id: userId,
            mobile_no: data.mobileNumber || undefined,
            password: data.password || undefined,
            whatsappProfileDeliveryNumber: data.whatsappProfileDeliveryNumber || undefined,
            role: 'USER',
            status: 'ACTIVE',
            isFeatured: false,
            family: {
              create: {
                id: familyId,
                fatherName: data.fatherName || undefined,
                fatherLivingStatus: data.fatherLivingStatus ? data.fatherLivingStatus.toUpperCase() : undefined,
                fatherStatus: data.fatherOccupation || undefined,
                fatherMobile: data.fatherMobile || undefined,
                motherName: data.motherName || undefined,
                motherLivingStatus: data.motherLivingStatus ? data.motherLivingStatus.toUpperCase() : undefined,
                motherStatus: data.motherOccupation || undefined,
                motherMobile: data.motherMobile || undefined,
                workNature: data.workNature ? data.workNature.toUpperCase().replace(' ', '_') : undefined,
                salary: data.salary || undefined,
                organisation: data.organisation || undefined,
                designation: data.occupationDetails || undefined,
                workingAddress: data.workLocation || undefined,
                googleLocation: data.workingLocationGoogle || undefined,
                rentalIncome: data.rentalIncome || undefined,
                houseType: data.houseType || undefined,
                houseSqFt: data.houseSqFt || undefined,
                siteLand: data.siteLand || undefined,
                thottam: data.thottam || undefined,
                vacantLand: data.vacantLand || undefined,
                totalAssetValue: data.totalAssetValue || undefined,
                assetComments: data.assetComments || undefined,
                dowryDetails: data.gender === 'FEMALE' ? data.dowryDetails : undefined,
                siblings: siblingsData.length > 0 ? { create: siblingsData } : undefined
              }
            },
            expectations: {
              create: {
                id: expId,
                expectedHeight: Number(data.expectedHeight) || undefined,
                colourPreference: data.colourPreference || undefined,
                maxAgeLimit: Number(data.maxAgeLimit) || undefined,
                dowryExpectation: data.gender === 'MALE' ? data.dowryExpectation : undefined,
                preferredSectors: data.preferredSectors || [],
                preferredLocations: data.preferredLocations || [],
                expectedIncome: data.expectedIncome || undefined,
                expectsRentalIncome: data.expectsRentalIncome || false,
                expectsThottam: data.expectsThottam || false,
                expectsVacantLand: data.expectsVacantLand || false,
                preferredDistanceRadius: Number(data.preferredDistanceRadius) || undefined,
                city: data.preferredCities && data.preferredCities.length > 0 ? data.preferredCities[0] : undefined,
                comments: data.expectationComments || undefined,
                acceptsDivorced: data.acceptsDivorced || false,
              }
            }
          }
        });

        const createdProfile = await db.profile.create({
          data: {
            id: profileId,
            userId: userId,
            name: data.name || 'Unknown',
            gender: data.gender || 'FEMALE',
            livingCountry: data.livingCountry || 'India',
            state: data.state || 'Tamil Nadu',
            city: data.city || 'Chennai',
            houseAddress: data.houseAddress || undefined,
            houseLocation: data.houseLocation || undefined,
            religion: data.religion || 'Hindu',
            caste: data.caste || 'Any',
            subCaste: data.subCaste || undefined,
            koottam: data.koottam || undefined,
            dob: dob,
            tob: data.timeOfBirth || undefined,
            lob: data.placeOfBirth || undefined,
            height: Number(data.height?.replace(/[^0-9.]/g, '')) || 160,
            weight: Number(data.weight?.replace(/[^0-9.]/g, '')) || 60,
            physicalCondition: data.physicalStatus ? data.physicalStatus.toUpperCase() : 'AVERAGE',
            skinColour: data.complexion || 'Fair',
            maritalStatus: data.maritalStatus || 'NEVER_MARRIED',
            familyStatus: 'MIDDLE',
            foodHabits: 'NONE',
            drinkingHabits: 'NONE',
            smokingHabits: 'NONE',
            rasi: data.rasi || undefined,
            nakshatra: data.nakshatra || undefined,
            dosham: data.dosham || undefined,
            poruthaNakshatram: data.poruthaNakshatram || [],
            status: 'PENDING',
            isLive: false,
            yearOfMarriage: data.yearOfMarriage || undefined,
            yearOfDivorce: data.yearOfDivorce || undefined,
            haveChildren: data.haveChildren === 'Yes',
            numberOfChildren: data.numberOfChildren ? parseInt(data.numberOfChildren) : undefined,
            childrenGender: data.childrenGender || undefined,
            childrenAge: data.childrenAge || undefined,
            photoUrl: data.photoUrl || undefined,
            jathakamUrl: data.jathakamUrl || undefined,
            profileCreatedBy: 'Admin',
          },
          include: {
            user: { include: { family: { include: { siblings: true } }, expectations: true } },
            educations: true,
          }
        });

        await logAdminAction(adminId, 'CREATE_PROFILE', createdProfile.id);
        return ProfileService.formatProfile(createdProfile);
      }
    } catch (error: any) {
      console.warn('DB create failed:', error);
      throw new Error(`Failed to save profile: ${error.message}`);
    }
    throw new Error('Database connection missing.');
  }

  /**
   * Updates existing profile details
   */
  static async updateProfile(id: string | number, data: any, adminId: number | string): Promise<AdminProfile> {
    try {
      const db = prisma as any;
      if (db.profile) {
        const updated = await db.profile.update({
          where: { id },
          data,
        });
        await logAdminAction(adminId, 'UPDATE_PROFILE', id);
        return ProfileService.formatProfile(updated);
      }
    } catch (error) {
      console.warn('DB update failed:', error);
    }

    const existing = await ProfileService.getProfileById(id);
    if (!existing) throw new Error('Profile not found');
    return { ...existing, ...data };
  }

  private static resolveSupabaseUrl(bucket: string, path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wtpbmpxwiasbnngciwye.supabase.co';
    return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }

  /**
   * Formats database raw object into typed AdminProfile
   */
  private static formatProfile(raw: any): AdminProfile {
    return {
      id: raw.id || 0,
      userId: raw.userId || 0,
      userIndex: raw.user?.userIndex || raw.userIndex,
      name: raw.name || '',
      whatsappProfileDeliveryNumber: raw.user?.whatsappProfileDeliveryNumber || undefined,
      gender: raw.gender === 'MALE' ? 'MALE' : 'FEMALE',
      age: raw.age || (raw.dob ? new Date().getFullYear() - new Date(raw.dob).getFullYear() : 0),
      dateOfBirth: raw.dateOfBirth || raw.dob,
      maritalStatus: raw.maritalStatus,
      religion: raw.religion || '',
      caste: raw.caste || '',
      subCaste: raw.subCaste,
      gothram: raw.gothram,
      nakshatra: raw.nakshatra || '',
      rasi: raw.rasi,
      dosham: raw.dosham,
      city: raw.city || '',
      state: raw.state || '',
      country: raw.country || '',
      height: typeof raw.height === 'number' ? `${Math.floor(raw.height / 30.48)} ft ${Math.round((raw.height / 2.54) % 12)} in` : raw.height,
      weight: raw.weight ? `${raw.weight} kg` : undefined,
      aboutMe: raw.aboutMe || '',
      rasiGrid: raw.rasiGrid || raw.rasi_grid || undefined,
      amsamGrid: raw.amsamGrid || raw.amsam_grid || undefined,
      status: (raw.status as ProfileStatus) || ProfileStatus.PENDING,
      approvedAt: raw.approvedAt || null,
      approvedBy: raw.approvedBy || null,
      rejectedReason: raw.rejectedReason || null,
      isLive: raw.isLive ?? false,
      isFeatured: raw.user?.isFeatured ?? false,
      registeredDate: raw.createdAt || raw.registeredDate || new Date().toISOString(),
      photos: raw.photos || (raw.photoUrl ? [{ id: 'photo-1', url: raw.photoUrl, isPrimary: true }] : []),
      family: raw.family || (raw.user?.family ? {
        fatherName: raw.user.family.fatherName,
        fatherOccupation: raw.user.family.fatherStatus,
        motherName: raw.user.family.motherName,
        motherOccupation: raw.user.family.motherStatus,
        brothersCount: raw.user.family.siblings?.filter((s: any) => s.relation === 'Brother').length || 0,
        brothersMarried: raw.user.family.siblings?.filter((s: any) => s.relation === 'Brother' && s.status === 'Married').length || 0,
        sistersCount: raw.user.family.siblings?.filter((s: any) => s.relation === 'Sister').length || 0,
        sistersMarried: raw.user.family.siblings?.filter((s: any) => s.relation === 'Sister' && s.status === 'Married').length || 0,
        familyType: raw.user.family.familyType,
        familyValue: raw.user.family.familyValue,
        nativePlace: raw.user.family.nativePlace,
      } : undefined),
      educationOccupation: raw.educationOccupation || (raw.educations || raw.user?.family ? {
        highestEducation: raw.educations?.[0]?.degreeName,
        employedIn: raw.user?.family?.workNature,
        occupation: raw.user?.family?.designation,
        annualIncome: raw.user?.family?.salary,
        workLocation: raw.user?.family?.workingAddress,
      } : undefined),
      documents: raw.documents || (raw.casteCertificateUrl ? [{ id: 'doc-caste', title: 'Caste Certificate', url: ProfileService.resolveSupabaseUrl('user-documents', raw.casteCertificateUrl)!, type: 'CASTE_PROOF', verified: true }] : []),
      jathagamUrl: ProfileService.resolveSupabaseUrl('user-documents', raw.jathakamUrl || raw.jathagamUrl) || undefined,
    };
  }
}

export const getDashboardStats = ProfileService.getDashboardStats;
export const getProfiles = async (filters: FilterParams = {}, page: number = 1, limit: number = 10) => {
  const res = await ProfileService.getProfiles(filters, page, limit);
  return { ...res, profiles: res.data };
};
export const getProfilesByStatus = async (status: ProfileStatus | 'ALL' | string = 'ALL', page: number = 1, limit: number = 10) => {
  const res = await ProfileService.getProfiles({ status: status === 'ALL' ? undefined : (status as any), page, limit });
  return { ...res, profiles: res.data };
};
export const getProfileById = ProfileService.getProfileById;
export const moderateProfile = ProfileService.moderateProfile;
export const deleteProfile = ProfileService.deleteProfile;
export const restoreProfile = ProfileService.restoreProfile;
export const createProfile = ProfileService.createProfile;
export const updateProfile = ProfileService.updateProfile;

