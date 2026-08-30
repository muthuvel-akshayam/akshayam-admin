'use server';

import prisma from '../../lib/admin/db';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function getPasswordResetRequests() {
  try {
    const requests = await prisma.passwordResetRequest.findMany({
      include: {
        user: {
          select: {
            mobile_no: true,
            email: true,
            profile: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' }
      ]
    });
    return { success: true, data: requests };
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    return { success: false, error: 'Failed to fetch requests' };
  }
}

export async function getUnreadPasswordResetRequestsCount() {
  try {
    const count = await prisma.passwordResetRequest.count({
      where: {
        status: 'PENDING',
        isRead: false
      }
    });
    return { success: true, count };
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return { success: false, count: 0 };
  }
}

export async function markAllPasswordResetRequestsRead() {
  try {
    await prisma.passwordResetRequest.updateMany({
      where: { status: 'PENDING', isRead: false },
      data: { isRead: true }
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    return { success: false, error: 'Failed to mark as read' };
  }
}

export async function resolvePasswordResetRequest(requestId: string, userId: string, newPasswordPlain: string) {
  if (!newPasswordPlain) {
    return { success: false, error: 'New password cannot be empty' };
  }

  try {
    const hashedPassword = hashPassword(newPasswordPlain);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: { status: 'RESOLVED', isRead: true }
      })
    ]);

    return { success: true, message: 'Password reset successfully and request resolved.' };
  } catch (error: any) {
    console.error('Error resolving request:', error);
    return { success: false, error: 'Failed to reset password' };
  }
}
