import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/admin/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, recipientUserId, status, notes } = body;

    if (!targetUserId || !recipientUserId) {
      return NextResponse.json({ success: false, error: 'targetUserId and recipientUserId are required' }, { status: 400 });
    }

    const log = await prisma.profileSentLog.upsert({
      where: {
        targetUserId_recipientUserId: {
          targetUserId,
          recipientUserId,
        }
      },
      update: {
        status: status || 'SENT',
      },
      create: {
        targetUserId,
        recipientUserId,
        status: status || 'SENT',
      }
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    console.error('API /webhooks/n8n/track-sent POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
