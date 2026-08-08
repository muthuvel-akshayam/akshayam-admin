import React from 'react';
import { getCompatibilityMatrix } from '../../../services/admin/compatibility.service';
import CompatibilityPageClient from './CompatibilityPageClient';

export const dynamic = 'force-dynamic';

export default async function CompatibilityManagementPage() {
  const data = await getCompatibilityMatrix(1, 15);

  return (
    <CompatibilityPageClient
      initialRows={data.rows}
      initialTotal={data.total}
    />
  );
}
