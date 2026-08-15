import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminRedirect } from '@/lib/admin/auth';
import { getProfilesByStatus } from '@/services/admin/profile.service';
import AdminLayout from '@/components/admin/AdminLayout';
import '@/app/globals.css';

export const metadata = {
  title: 'Admin Console | Akshayam Matrimonial',
  description: 'Role-based protected administrator dashboard and moderation portal.',
};

export default async function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce role-based access control (RBAC): Only USER with role == ADMIN can enter
  const auth = await requireAdminRedirect();

  // Fetch live count of pending profiles for sidebar badge notification
  const pendingData = await getProfilesByStatus('PENDING', 1, 1);
  const pendingCount = pendingData.total || 0;

  return (
    <AdminLayout pendingCount={pendingCount}>
      {children}
    </AdminLayout>
  );
}
