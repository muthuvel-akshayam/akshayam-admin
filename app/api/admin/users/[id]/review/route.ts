import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/admin/db';
import { supabaseAdmin } from '@/lib/admin/supabase';
import { addWatermarkToImage } from '@/lib/admin/watermark';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id: userId } = await params;
    const { action, reason } = await request.json();

    if (!userId || !['APPROVE', 'REJECT', 'MATCHED_REMOVED'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid review request.' }, { status: 400 });
    }
    if (action === 'REJECT' && !String(reason || '').trim()) {
      return NextResponse.json({ success: false, error: 'A rejection reason is required.' }, { status: 400 });
    }

    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user?.profile) {
      return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 });
    }

    let updateData: any = {};
    if (action === 'APPROVE') {
      updateData = { status: 'APPROVED', isLive: true, approvedAt: new Date(), approvedBy: String(session.user.id), rejectedReason: null };
      
      // Add watermark to profile photo
      if (user.profile.photoUrl) {
        try {
          const photoResponse = await fetch(user.profile.photoUrl);
          if (photoResponse.ok) {
            const arrayBuffer = await photoResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Generate watermark
            const watermarkedBuffer = await addWatermarkToImage(buffer, 'AKSHAYAM');
            
            // Extract the path from the URL
            // e.g., https://.../profile-photos/abc-123.jpg -> abc-123.jpg
            const urlParts = user.profile.photoUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            
            // Upload to same bucket under watermarked/ prefix
            const { error: uploadError } = await supabaseAdmin
              .storage
              .from('profile-photos')
              .upload(`watermarked/${filename}`, watermarkedBuffer, {
                upsert: true,
                contentType: photoResponse.headers.get('content-type') || 'image/jpeg'
              });
              
            if (uploadError) {
              console.error('Error uploading watermarked photo:', uploadError);
            }
          }
        } catch (watermarkError) {
          console.error('Error during watermarking process:', watermarkError);
        }
      }
    } else if (action === 'REJECT') {
      updateData = { status: 'REJECTED', isLive: false, approvedAt: null, approvedBy: null, rejectedReason: String(reason).trim() };
    } else if (action === 'MATCHED_REMOVED') {
      updateData = { status: 'MATCHED_REMOVED', isLive: false };
    }

    const profile = await (prisma as any).profile.update({
      where: { id: user.profile.id },
      data: updateData,
    });

    let updatedUser = user;
    if (action === 'APPROVE') {
      updatedUser = await (prisma as any).user.update({
        where: { id: userId },
        data: { status: 'ACTIVE' },
      });
    }

    return NextResponse.json({ success: true, data: { ...updatedUser, profile } });
  } catch (error: any) {
    console.error('API /admin/users/[id]/review POST Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Profile review failed.' }, { status: 500 });
  }
}