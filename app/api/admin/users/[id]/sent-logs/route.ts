import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/admin/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
    }

    const logs = await prisma.profileSentLog.findMany({
      where: { targetUserId: userId },
      include: {
        targetUser: {
          select: {
            mobile_no: true,
          }
        },
        recipientUser: {
          select: {
            id: true,
            userIndex: true,
            email: true,
            mobile_no: true,
            profile: {
              select: {
                name: true,
                photoUrl: true,
                rasi: true,
                nakshatra: true,
                // highestEducation: true,
                // designation: true,
                jathakamUrl: true,
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('API /admin/users/[id]/sent-logs GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
