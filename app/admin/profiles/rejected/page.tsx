import React from 'react';
import { getProfilesByStatus } from '../../../../services/admin/profile.service';
import ProfilesPageClient from '../ProfilesPageClient';
import { ProfileStatus } from '../../../../types/admin';

export const dynamic = 'force-dynamic';

export default async function RejectedProfilesPage() {
  const data = await getProfilesByStatus('REJECTED', 1, 10);

  return (
    <ProfilesPageClient
      title="Rejected Profiles"
      description="Profiles moderated out of the system due to guidelines violations or incomplete verification."
      initialProfiles={data.profiles}
      initialTotal={data.total}
      fixedStatus={ProfileStatus.REJECTED}
    />
  );
}
