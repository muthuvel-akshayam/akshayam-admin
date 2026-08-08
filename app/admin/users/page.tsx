import React from 'react';
import { getUsers } from '../../../services/admin/user.service';
import UsersPageClient from './UsersPageClient';

import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function UsersManagementPage() {
  return (
    <Suspense fallback={<div>Loading users...</div>}>
      <UsersPageClient />
    </Suspense>
  );
}
