import { NextResponse } from 'next/server';
import { prisma } from '@/lib/admin/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        userid: {
          not: null,
          notIn: ['']
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        userid: true
      }
    });

    return NextResponse.json({ success: true, lastId: user?.userid || null });
  } catch (error: any) {
    console.error('Error fetching last ID:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
