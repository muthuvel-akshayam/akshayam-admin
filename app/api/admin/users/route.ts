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
    
    // The 12 advanced filters
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const maritalStatus = searchParams.get('maritalStatus');
    const nakshatras = searchParams.get('nakshatras');
    const rasi = searchParams.get('rasi');
    const dosham = searchParams.get('dosham');
    const propertyValue = searchParams.get('propertyValue');
    const minPavan = searchParams.get('minPavan');
    const maxPavan = searchParams.get('maxPavan');
    const skinColour = searchParams.get('skinColour');
    const minHeight = searchParams.get('minHeight');
    const maxHeight = searchParams.get('maxHeight');
    const workLocations = searchParams.get('workLocations');
    const preferredCities = searchParams.get('preferredCities');
    const preferredProfessions = searchParams.get('preferredProfessions');
    
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

    if (nakshatras) profileFilter.nakshatra = { in: nakshatras.split(',') };
    if (rasi) profileFilter.rasi = { contains: rasi, mode: 'insensitive' };
    if (dosham) profileFilter.dosham = { contains: dosham, mode: 'insensitive' };
    if (maritalStatus && maritalStatus !== 'ALL') profileFilter.maritalStatus = maritalStatus;
    if (propertyValue) profileFilter.propertyValue = { contains: propertyValue, mode: 'insensitive' };
    if (skinColour) profileFilter.skinColour = { contains: skinColour, mode: 'insensitive' };
    
    if (minHeight || maxHeight) {
      profileFilter.height = {};
      if (minHeight) profileFilter.height.gte = Number(minHeight);
      if (maxHeight) profileFilter.height.lte = Number(maxHeight);
    }
    
    if (minPavan || maxPavan) {
      // NOTE: We might need to check if expectPavan exists on Profile or Expectations.
      // Usually Pavan is on Profile, e.g., pavanOffered. Assuming it's `pavanOffered` or `pavan`.
      // The exact field name depends on schema. We will assume `pavanOffered`.
      profileFilter.pavanOffered = {};
      if (minPavan) profileFilter.pavanOffered.gte = Number(minPavan);
      if (maxPavan) profileFilter.pavanOffered.lte = Number(maxPavan);
    }

    if (workLocations) {
      profileFilter.state = { in: workLocations.split(',') };
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
      userid: u.userid,
      userIndex: u.userIndex,
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
