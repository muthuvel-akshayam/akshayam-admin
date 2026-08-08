import React from 'react';
import { getProfilesByStatus } from '../../../services/admin/profile.service';
import ProfilesPageClient from './ProfilesPageClient';

export const dynamic = 'force-dynamic';

export default async function AllProfilesPage() {
  const data = await getProfilesByStatus('ALL', 1, 10);

  return (
    <ProfilesPageClient
      title="All Matrimonial Profiles"
      description="Manage, verify, edit, and audit all user-created and admin-created biodatas across the platform."
      initialProfiles={data.profiles}
      initialTotal={data.total}
      fixedStatus="ALL"
    />
  );
}
