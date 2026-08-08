import React from 'react';
import { getProfilesByStatus } from '../../../../services/admin/profile.service';
import ProfilesPageClient from '../ProfilesPageClient';
import { ProfileStatus } from '../../../../types/admin';

export const dynamic = 'force-dynamic';

export default async function PendingProfilesPage() {
  const data = await getProfilesByStatus('PENDING', 1, 10);

  return (
    <ProfilesPageClient
      title="Pending Moderation Queue"
      description="Review new profile submissions, inspect horoscope charts, verify identity proofs, and approve for public search."
      initialProfiles={data.profiles}
      initialTotal={data.total}
      fixedStatus={ProfileStatus.PENDING}
    />
  );
}
