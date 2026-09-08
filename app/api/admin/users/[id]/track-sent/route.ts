import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/admin/db';
import { logAdminAction } from '@/lib/admin/auth';
import { ProfileSentStatus } from '../../../../../../generated/prisma/client/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, recipientUserId } = body; 

    if (!['SENT', 'NOT_MATCHED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    if (!recipientUserId) {
      return NextResponse.json({ success: false, error: 'Missing recipientUserId' }, { status: 400 });
    }

    const isNumeric = /^\d+$/.test(recipientUserId);
    const targetRecipient = await (prisma as any).user.findFirst({
      where: isNumeric ? {
        OR: [
          { id: recipientUserId },
          { userIndex: parseInt(recipientUserId, 10) }
        ]
      } : {
        id: recipientUserId
      }
    });

    if (!targetRecipient) {
      return NextResponse.json({ success: false, error: 'Candidate user not found.' }, { status: 404 });
    }

    const finalRecipientUserId = targetRecipient.id;

    const logEntry = await prisma.profileSentLog.upsert({
      where: {
        targetUserId_recipientUserId: {
          targetUserId: userId,
          recipientUserId: finalRecipientUserId,
        }
      },
      update: {
        status: status as ProfileSentStatus,
      },
      create: {
        targetUserId: userId,
        recipientUserId: finalRecipientUserId,
        status: status as ProfileSentStatus,
      }
    });

    await logAdminAction(session.user.id, `PROFILE_${status}`, userId, { recipientUserId });

    return NextResponse.json({ success: true, data: logEntry });
  } catch (error: any) {
    console.error('API /admin/users/[id]/track-sent POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
