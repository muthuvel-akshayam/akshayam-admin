'use server';

// ==========================================
// SERVER ACTIONS FOR USER MANAGEMENT
// ==========================================

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../lib/admin/auth';
import { UserService } from '../../services/admin/user.service';
import { AdminUser, UserRole, PaginatedResponse, ServerActionResponse } from '../../types/admin';

/**
 * Fetches paginated user list with filtering
 */
export async function fetchUsersAction(
  query?: string,
  roleFilter?: string,
  statusFilter?: string,
  page: number = 1,
  limit: number = 10
): Promise<ServerActionResponse<PaginatedResponse<AdminUser>>> {
  try {
    await requireAdmin();
    const data = await UserService.getUsers(query, roleFilter, statusFilter, page, limit);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch users.' };
  }
}

/**
 * Promotes a standard user to ADMIN role
 */
export async function makeAdminAction(
  userId: number
): Promise<ServerActionResponse<AdminUser>> {
  try {
    const session = await requireAdmin();
    if (session.user.id === userId) {
      return { success: false, error: 'You cannot modify your own administrative privileges.' };
    }

    const updated = await UserService.updateUserRole(userId, UserRole.ADMIN, session.user.id);
    revalidatePath('/admin/users');

    return {
      success: true,
      data: updated,
      message: `User ${updated.name} has been promoted to Admin.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to make admin.' };
  }
}

/**
 * Removes ADMIN role and downgrades to standard USER
 */
export async function removeAdminAction(
  userId: number
): Promise<ServerActionResponse<AdminUser>> {
  try {
    const session = await requireAdmin();
    if (session.user.id === userId) {
      return { success: false, error: 'You cannot remove your own administrative role.' };
    }

    const updated = await UserService.updateUserRole(userId, UserRole.USER, session.user.id);
    revalidatePath('/admin/users');

    return {
      success: true,
      data: updated,
      message: `Admin privileges removed for ${updated.name}.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove admin.' };
  }
}

/**
 * Suspends user account, preventing login and hiding profile
 */
export async function suspendUserAction(
  userId: number
): Promise<ServerActionResponse<AdminUser>> {
  try {
    const session = await requireAdmin();
    if (session.user.id === userId) {
      return { success: false, error: 'You cannot suspend your own account.' };
    }

    const updated = await UserService.updateUserStatus(userId, 'SUSPENDED', session.user.id);
    revalidatePath('/admin/users');
    revalidatePath('/admin/profiles');

    return {
      success: true,
      data: updated,
      message: `Account suspended for ${updated.name}.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to suspend user.' };
  }
}

/**
 * Activates a suspended user account
 */
export async function activateUserAction(
  userId: number
): Promise<ServerActionResponse<AdminUser>> {
  try {
    const session = await requireAdmin();
    const updated = await UserService.updateUserStatus(userId, 'ACTIVE', session.user.id);
    revalidatePath('/admin/users');

    return {
      success: true,
      data: updated,
      message: `Account activated for ${updated.name}.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to activate user.' };
  }
}

/**
 * Permanently deletes a user and associated data
 */
export async function deleteUserAction(
  userId: number
): Promise<ServerActionResponse<boolean>> {
  try {
    const session = await requireAdmin();
    if (session.user.id === userId) {
      return { success: false, error: 'You cannot delete your own admin account.' };
    }

    await UserService.deleteUser(userId, session.user.id);
    revalidatePath('/admin/users');

    return {
      success: true,
      data: true,
      message: 'User account deleted successfully.',
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete user.' };
  }
}

export async function getUsersAction(
  page = 1,
  limit = 10,
  roleFilter?: string,
  statusFilter?: string,
  query?: string
) {
  return fetchUsersAction(query, roleFilter, statusFilter, page, limit);
}

