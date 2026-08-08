import React from 'react';
import { getDashboardStats } from '@/services/admin/profile.service';
import DashboardClient from '@/components/admin/DashboardClient';

// Ensure 100% live server rendering without static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return <DashboardClient initialStats={stats} />;
}
