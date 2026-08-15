import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/admin/db';
import { updateUserId } from '@/services/admin/user.service';

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

    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            educations: true,
          },
        },
        family: {
          include: {
            siblings: true,
          }
        },
        expectations: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Return the unmasked complete data to the admin
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('API /admin/users/[id] GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const body = await request.json();
    const newUserId = String(body.newUserId || '').trim();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
    }
    if (!newUserId) {
      return NextResponse.json({ success: false, error: 'New user ID is required.' }, { status: 400 });
    }
    if (newUserId === userId) {
      return NextResponse.json({ success: false, error: 'The new ID must be different from the current ID.' }, { status: 400 });
    }

    const updated = await updateUserId(userId, newUserId, session.user.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('API /admin/users/[id] PATCH Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update user ID.' }, { status: 500 });
  }
}
