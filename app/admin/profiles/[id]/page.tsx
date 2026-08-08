import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProfileById } from '../../../../services/admin/profile.service';
import ProfileReviewModal from '../../../../components/admin/ProfileReviewModal';

export const dynamic = 'force-dynamic';

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const profileId = parseInt(resolvedParams.id, 10);
  const profile = await getProfileById(profileId);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 ">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 ">
          <Link href="/admin/profiles" className="hover:text-emerald-700  transition-colors">
            Profiles
          </Link>
          <span>/</span>
          <span className="text-slate-900  font-bold">{profile.name}</span>
        </div>

        <Link
          href="/admin/profiles"
          className="text-xs bg-slate-100  hover:bg-slate-200  text-slate-700  font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
        >
          ← Back to Profiles List
        </Link>
      </div>

      {/* Standalone Inspection View */}
      <ProfileReviewModal
        profile={profile}
        isOpen={true}
        isStandalonePage={true}
      />
    </div>
  );
}
