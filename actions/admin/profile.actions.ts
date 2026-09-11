'use server';

// ==========================================
// SERVER ACTIONS FOR PROFILE MODERATION & CRUD
// ==========================================

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../lib/admin/auth';
import { addWatermarkToImage } from '../../lib/admin/watermark';
import { supabaseAdmin } from '../../lib/admin/supabase';
import { ProfileService } from '../../services/admin/profile.service';
import { UserService } from '../../services/admin/user.service';
import {
  AdminProfile,
  AdminDashboardStats,
  FilterParams,
  PaginatedResponse,
  ProfileStatus,
  ServerActionResponse,
} from '../../types/admin';

/**
 * Approves a pending profile and makes it live for public search
 */
export async function approveProfileAction(
  id: number,
  newUserId?: string
): Promise<ServerActionResponse<AdminProfile>> {
  try {
    const session = await requireAdmin();
    
    // Fetch profile to get the current userId if newUserId is provided
    if (newUserId) {
      const profile = await ProfileService.getProfileById(id);
      if (profile && profile.userId && String(profile.userId) !== newUserId) {
        await UserService.updateUserId(String(profile.userId), newUserId, session.user.id);
      }
    }

    const updated = await ProfileService.moderateProfile(
      id,
      ProfileStatus.APPROVED,
      session.user.id
    );

    if (updated && updated.userId) {
      await UserService.updateUserStatus(String(updated.userId), 'ACTIVE', session.user.id);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/profiles');
    revalidatePath('/admin/profiles/pending');
    revalidatePath('/admin/profiles/approved');

    return {
      success: true,
      data: updated,
      message: `Profile ${updated.name} approved successfully. It is now live in public search.`,
    };
  } catch (error: any) {
    console.error('Error in approveProfileAction:', error);
    return { success: false, error: error.message || 'Failed to approve profile.' };
  }
}

/**
 * Rejects a profile with a specified reason
 */
export async function rejectProfileAction(
  id: number,
  reason: string
): Promise<ServerActionResponse<AdminProfile>> {
  try {
    const session = await requireAdmin();
    if (!reason || reason.trim() === '') {
      return { success: false, error: 'Rejection reason is required.' };
    }

    const updated = await ProfileService.moderateProfile(
      id,
      ProfileStatus.REJECTED,
      session.user.id,
      reason.trim()
    );

    revalidatePath('/admin');
    revalidatePath('/admin/profiles');
    revalidatePath('/admin/profiles/pending');
    revalidatePath('/admin/profiles/rejected');

    return {
      success: true,
      data: updated,
      message: `Profile ${updated.name} has been rejected.`,
    };
  } catch (error: any) {
    console.error('Error in rejectProfileAction:', error);
    return { success: false, error: error.message || 'Failed to reject profile.' };
  }
}

/**
 * Permanently deletes or deactivates a profile
 */
export async function deleteProfileAction(
  id: number
): Promise<ServerActionResponse<boolean>> {
  try {
    const session = await requireAdmin();
    await ProfileService.deleteProfile(id, session.user.id);

    revalidatePath('/admin');
    revalidatePath('/admin/profiles');

    return {
      success: true,
      data: true,
      message: 'Profile deleted successfully.',
    };
  } catch (error: any) {
    console.error('Error in deleteProfileAction:', error);
    return { success: false, error: error.message || 'Failed to delete profile.' };
  }
}

/**
 * Marks a profile as MATCHED_REMOVED
 */
export async function removeAfterMatchAction(
  id: number
): Promise<ServerActionResponse<AdminProfile>> {
  try {
    const session = await requireAdmin();
    const updated = await ProfileService.moderateProfile(
      id,
      ProfileStatus.MATCHED_REMOVED,
      session.user.id
    );

    revalidatePath('/admin');
    revalidatePath('/admin/profiles');
    revalidatePath('/admin/users');

    return {
      success: true,
      data: updated,
      message: 'Profile marked as matched and taken offline.',
    };
  } catch (error: any) {
    console.error('Error in removeAfterMatchAction:', error);
    return { success: false, error: error.message || 'Failed to remove profile after match.' };
  }
}
/**
 * Restores a rejected profile back to pending queue
 */
export async function restoreProfileAction(
  id: number
): Promise<ServerActionResponse<AdminProfile>> {
  try {
    const session = await requireAdmin();
    const updated = await ProfileService.restoreProfile(id, session.user.id);

    revalidatePath('/admin');
    revalidatePath('/admin/profiles');
    revalidatePath('/admin/profiles/rejected');
    revalidatePath('/admin/profiles/pending');

    return {
      success: true,
      data: updated,
      message: `Profile ${updated.name} restored to Pending queue.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to restore profile.' };
  }
}

/**
 * Admin creates a new profile directly
 */
export async function createProfileAction(
  formData: any
): Promise<ServerActionResponse<AdminProfile>> {
  try {
    const session = await requireAdmin();

    if (formData.photoUrl) {
      try {
        const photoResponse = await fetch(formData.photoUrl);
        if (photoResponse.ok) {
          const arrayBuffer = await photoResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const watermarkedBuffer = await addWatermarkToImage(buffer, 'AKSHAYAM');
          
          const urlParts = formData.photoUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          
          const { error: uploadError } = await supabaseAdmin
            .storage
            .from('profile-photos')
            .upload(`watermarked/${filename}`, watermarkedBuffer, {
              upsert: true,
              contentType: photoResponse.headers.get('content-type') || 'image/jpeg'
            });
            
          if (!uploadError) {
            const { data } = supabaseAdmin.storage.from('profile-photos').getPublicUrl(`watermarked/${filename}`);
            formData.photoUrl = data.publicUrl;
          }
        }
      } catch (err) {
        console.error('Failed to add watermark during profile creation:', err);
      }
    }

    const created = await ProfileService.createProfile(formData, session.user.id);

    revalidatePath('/admin');
    revalidatePath('/admin/profiles');
    revalidatePath('/admin/profiles/approved');

    return {
      success: true,
      data: created,
      message: `Profile created for ${created.name}.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create profile.' };
  }
}

/**
 * Admin updates existing profile details
 */
export async function editProfileAction(
  id: number,
  formData: any
): Promise<ServerActionResponse<AdminProfile>> {
  try {
    const session = await requireAdmin();
    const updated = await ProfileService.updateProfile(id, formData, session.user.id);

    revalidatePath('/admin');
    revalidatePath('/admin/profiles');
    revalidatePath(`/admin/profiles/${id}`);

    return {
      success: true,
      data: updated,
      message: `Profile ${updated.name} updated successfully.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update profile.' };
  }
}

/**
 * Fetches dashboard statistics
 */
export async function fetchDashboardStatsAction(): Promise<ServerActionResponse<AdminDashboardStats>> {
  try {
    await requireAdmin();
    const stats = await ProfileService.getDashboardStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch dashboard stats.' };
  }
}

/**
 * Fetches paginated and filtered profiles
 */
export async function fetchProfilesAction(
  filters: FilterParams = {},
  page: number = 1,
  limit: number = 10
): Promise<ServerActionResponse<PaginatedResponse<AdminProfile>>> {
  try {
    await requireAdmin();
    const response = await ProfileService.getProfiles(filters, page, limit);
    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch profiles.' };
  }
}

export async function getProfilesAction(
  page = 1,
  limit = 10,
  status?: string,
  gender?: string,
  search?: string,
  minAge?: number,
  maxAge?: number,
  maritalStatus?: string,
  nakshatras?: string[],
  rasi?: string,
  dosham?: string,
  minHeight?: number,
  maxHeight?: number,
  propertyValue?: string,
  minPavan?: number,
  maxPavan?: number,
  skinColour?: string,
  workLocations?: string[],
  preferredCities?: string[],
  preferredProfessions?: string[]
) {
  return fetchProfilesAction(
    {
      status: status === 'ALL' ? undefined : (status as any),
      gender: gender === 'ALL' ? undefined : (gender as any),
      query: search || undefined,
      minAge,
      maxAge,
      maritalStatus: maritalStatus === 'ALL' ? undefined : maritalStatus,
      nakshatras,
      rasi,
      dosham,
      minHeight,
      maxHeight,
      propertyValue,
      minPavan,
      maxPavan,
      skinColour,
      workLocations,
      preferredCities,
      preferredProfessions
    },
    page,
    limit
  );
}

