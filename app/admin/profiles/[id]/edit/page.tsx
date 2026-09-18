import React from 'react';
import { notFound } from 'next/navigation';
import { getProfileById } from '../../../../../services/admin/profile.service';
import AdminEditProfileForm from '../../../../../components/admin/AdminEditProfileForm';
import prisma from '../../../../../lib/admin/db';

export const dynamic = 'force-dynamic';

export default async function AdminEditProfilePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const profileId = resolvedParams.id;
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-12 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">
          Edit Profile: {profile.name}
        </h1>
      </div>

      <AdminEditProfileForm profile={profile} />
    </div>
  );
}
