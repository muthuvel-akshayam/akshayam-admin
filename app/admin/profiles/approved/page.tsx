import React from 'react';
import { getProfilesByStatus } from '../../../../services/admin/profile.service';
import ProfilesPageClient from '../ProfilesPageClient';
import { ProfileStatus } from '../../../../types/admin';

export const dynamic = 'force-dynamic';

export default async function ApprovedProfilesPage() {
  const data = await getProfilesByStatus('APPROVED', 1, 10);

  return (
    <ProfilesPageClient
      title="Approved Live Profiles"
      description="Active verified profiles currently visible on the live public matrimonial search engine."
      initialProfiles={data.profiles}
      initialTotal={data.total}
      fixedStatus={ProfileStatus.APPROVED}
    />
  );
}
