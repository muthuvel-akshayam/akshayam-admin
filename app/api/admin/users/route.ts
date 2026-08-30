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
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const nakshatras = searchParams.get('nakshatras');
    const dosham = searchParams.get('dosham');
    const skip = (page - 1) * limit;

    let where: any = {};
    let profileFilter: any = {};

    switch (statusTab.toLowerCase()) {
      case 'pending':
        profileFilter.status = 'PENDING';
        break;
      case 'approved':
        profileFilter.status = 'APPROVED';
        break;
      case 'denied':
        profileFilter.status = 'REJECTED';
        break;
      case 'matched_removed':
        profileFilter.status = 'MATCHED_REMOVED';
        break;
    }

    if (minAge || maxAge) {
      const today = new Date();
      const minDate = maxAge ? new Date(today.getFullYear() - Number(maxAge) - 1, today.getMonth(), today.getDate()) : undefined;
      const maxDate = minAge ? new Date(today.getFullYear() - Number(minAge), today.getMonth(), today.getDate()) : undefined;
      
      if (minDate || maxDate) {
        profileFilter.dob = {};
        if (minDate) profileFilter.dob.gte = minDate;
        if (maxDate) profileFilter.dob.lte = maxDate;
      }
    }

    if (nakshatras) {
      profileFilter.nakshatra = { in: nakshatras.split(',') };
    }

    if (dosham) {
      profileFilter.dosham = { contains: dosham, mode: 'insensitive' };
    }

    if (Object.keys(profileFilter).length > 0) {
      where.profile = { is: profileFilter };
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { mobile_no: { contains: search } },
        { profile: { is: { ...profileFilter, name: { contains: search, mode: 'insensitive' } } } },
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
      paymentScreenshot: u.paymentScreenshot,
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
