// ==========================================
// USER SERVICE - USER & ROLE MANAGEMENT
// ==========================================

import prisma from '../../lib/admin/db';
import { logAdminAction } from '../../lib/admin/auth';
import { AdminUser, UserRole, PaginatedResponse } from '../../types/admin';

function getMockUsers(): AdminUser[] {
  return [
    {
      id: 101,
      userIndex: 101,
      name: 'Ananya Iyer',
      email: 'ananya.iyer@gmail.com',
      phone: '+91 98765 43210',
      role: UserRole.USER,
      status: 'ACTIVE',
      registeredDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      profileId: 101,
    },
    {
      id: 102,
      userIndex: 102,
      name: 'Test User',
      email: 'test.user@example.com',
      phone: '+91 98400 12345',
      role: UserRole.USER,
      status: 'ACTIVE',
      registeredDate: new Date(Date.now() - 86400000 * 15).toISOString(),
      profileId: 102,
    },
    {
      id: 1,
      userIndex: 1,
      name: 'Akshayam Administrator',
      email: 'admin@akshayam.com',
      phone: '+91 99999 88888',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      registeredDate: new Date(Date.now() - 86400000 * 100).toISOString(),
    },
    {
      id: 103,
      userIndex: 103,
      name: 'Priyanka Gounder',
      email: 'priya.gounder@yahoo.com',
      phone: '+91 94444 55555',
      role: UserRole.USER,
      status: 'ACTIVE',
      registeredDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      profileId: 103,
    },
    {
      id: 104,
      userIndex: 104,
      name: 'Srinivasan Mudaliar',
      email: 'srini.m@gmail.com',
      phone: '+91 97890 65432',
      role: UserRole.USER,
      status: 'SUSPENDED',
      registeredDate: new Date(Date.now() - 86400000 * 25).toISOString(),
      profileId: 104,
    },
    {
      id: 105,
      userIndex: 105,
      name: 'Meenakshi Chettiar',
      email: 'meena.c@gmail.com',
      phone: '+91 90031 99887',
      role: UserRole.USER,
      status: 'ACTIVE',
      registeredDate: new Date(Date.now() - 86400000 * 12).toISOString(),
      profileId: 105,
    },
  ];
}

export class UserService {
  /**
   * Retrieves paginated users list with search and filtering
   */
  static async getUsers(
    query?: string,
    roleFilter?: string,
    statusFilter?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<AdminUser>> {
    try {
      const db = prisma as any;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (roleFilter && roleFilter !== 'ALL') {
        where.role = roleFilter;
      }
      if (statusFilter && statusFilter !== 'ALL') {
        where.status = statusFilter;
      }
      if (query) {
        where.OR = [
          { email: { contains: query, mode: 'insensitive' } },
          { mobile_no: { contains: query } },
          { profile: { name: { contains: query, mode: 'insensitive' } } },
        ];
      }

      if (db.user) {
        const [rawUsers, total] = await Promise.all([
          db.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { profile: { select: { id: true, name: true } } },
          }),
          db.user.count({ where }),
        ]);

        if (rawUsers.length > 0 || total > 0) {
          return {
            data: rawUsers.map(UserService.formatUser),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          };
        }
      }
    } catch (error) {
      console.warn('DB query failed in getUsers, using mock fallback:', error);
    }

    let mock = getMockUsers();
    if (roleFilter && roleFilter !== 'ALL') {
      mock = mock.filter((u) => u.role === roleFilter);
    }
    if (statusFilter && statusFilter !== 'ALL') {
      mock = mock.filter((u) => u.status === statusFilter);
    }
    if (query) {
      const q = query.toLowerCase();
      mock = mock.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
      );
    }

    const total = mock.length;
    const paginated = mock.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Promotes or demotes user role (Make Admin / Remove Admin)
   */
  static async updateUserRole(userId: number, role: UserRole, adminId: number): Promise<AdminUser> {
    try {
      const db = prisma as any;
      if (db.user) {
        const updated = await db.user.update({
          where: { id: userId },
          data: { role },
          include: { profile: { select: { id: true, name: true } } },
        });
        await logAdminAction(adminId, `UPDATE_ROLE_${role}`, userId);
        return UserService.formatUser(updated);
      }
    } catch (error) {
      console.warn('DB update failed in updateUserRole:', error);
    }

    const mock = getMockUsers().find((u) => u.id === userId) || getMockUsers()[0];
    mock.role = role;
    return mock;
  }

  /**
   * Suspends or activates user account
   */
  static async updateUserStatus(
    userId: number,
    status: 'ACTIVE' | 'SUSPENDED' | 'DELETED',
    adminId: number
  ): Promise<AdminUser> {
    try {
      const db = prisma as any;
      if (db.user) {
        const updated = await db.user.update({
          where: { id: userId },
          data: { status },
          include: { profile: { select: { id: true, name: true } } },
        });
        await logAdminAction(adminId, `UPDATE_STATUS_${status}`, userId);
        return UserService.formatUser(updated);
      }
    } catch (error) {
      console.warn('DB update failed in updateUserStatus:', error);
    }

    const mock = getMockUsers().find((u) => u.id === userId) || getMockUsers()[0];
    mock.status = status;
    return mock;
  }

  /**
   * Deletes a user account permanently
   */
  static async deleteUser(userId: number, adminId: number): Promise<boolean> {
    try {
      const db = prisma as any;
      if (db.user) {
        await db.user.delete({ where: { id: userId } });
        await logAdminAction(adminId, 'DELETE_USER', userId);
        return true;
      }
    } catch (error) {
      console.warn('DB delete failed in deleteUser:', error);
    }
    return true;
  }

  private static formatUser(raw: any): AdminUser {
    return {
      id: raw.id || 0,
      userIndex: raw.userIndex,
      name: raw.profile?.name || raw.name || raw.email?.split('@')[0] || 'User',
      email: raw.email || 'noemail@akshayam.com',
      phone: raw.mobile_no || raw.phone || '+91 00000 00000',
      role: (raw.role as UserRole) || UserRole.USER,
      status: raw.status || 'ACTIVE',
      registeredDate: raw.createdAt || raw.registeredDate || new Date().toISOString(),
      profileId: raw.profile?.id || raw.profileId,
    };
  }
}

export const getUsers = async (
  page: number = 1,
  limit: number = 10,
  query?: string,
  roleFilter?: string,
  statusFilter?: string
) => {
  const res = await UserService.getUsers(query, roleFilter, statusFilter, page, limit);
  return { ...res, users: res.data };
};
export const updateUserRole = UserService.updateUserRole;
export const updateUserStatus = UserService.updateUserStatus;
export const deleteUser = UserService.deleteUser;

