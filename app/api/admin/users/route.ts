import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/admin/db';
import { ProfileStatus } from '@/types/admin';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const statusTab = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search')?.trim();
    const skip = (page - 1) * limit;

    let where: any = {};

    switch (statusTab.toLowerCase()) {
      case 'pending':
        where = { profile: { is: { status: 'PENDING' } } };
        break;
      case 'approved':
        where = { profile: { is: { status: 'APPROVED' } } };
        break;
      case 'denied':
        where = { profile: { is: { status: 'REJECTED' } } };
        break;
      case 'matched_removed':
        where = { profile: { is: { status: 'MATCHED_REMOVED' } } };
        break;
      case 'all':
      default:
        // No additional filter for 'all' users
        break;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { mobile_no: { contains: search } },
        { profile: { is: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [users, total] = await Promise.all([
      (prisma as any).user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: {
          profile: {
            select: {
              id: true,
              name: true,
              gender: true,
              status: true,
              city: true,
              state: true,
              religion: true,
              caste: true,
              nakshatra: true,
            }
          }
        },
      }),
      (prisma as any).user.count({ where }),
    ]);

    // Format response to ensure no strict masking if needed, though this is just list view
    const formattedUsers = users.map((u: any) => ({
      id: u.id,
      name: u.profile?.name || u.email?.split('@')[0] || 'User',
      email: u.email,
      phone: u.mobile_no || u.phone,
      role: u.role,
      // The moderation tabs filter by profile status; show the same state here.
      status: u.profile?.status || u.status,
      registeredDate: u.createdAt,
      profileId: u.profile?.id,
      isFeatured: u.isFeatured || false,
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error: any) {
    console.error('API /admin/users GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
