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
