'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/admin/ui/Button';
import UsersTable from '@/components/admin/UsersTable';
import UserDrawer from '@/components/admin/UserDrawer';
import { AdminUser } from '@/types/admin';
import { useSearchParams } from 'next/navigation';

export default function UsersPageClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Advanced filters
  const [minAge, setMinAge] = useState<number | undefined>();
  const [maxAge, setMaxAge] = useState<number | undefined>();
  const [nakshatras, setNakshatras] = useState<string | undefined>();
  const [dosham, setDosham] = useState<string | undefined>();
  
  const [loading, setLoading] = useState(false);
  const [drawerUserId, setDrawerUserId] = useState<string | number | null>(null);

  const fetchUsers = useCallback(async (
    page: number, 
    statusTab: string, 
    query: string, 
    fMinAge?: number, 
    fMaxAge?: number, 
    fNakshatras?: string, 
    fDosham?: string
  ) => {
    setLoading(true);
    try {
      let url = `/api/admin/users?page=${page}&limit=${itemsPerPage}&status=${statusTab}&search=${encodeURIComponent(query)}`;
      if (fMinAge) url += `&minAge=${fMinAge}`;
      if (fMaxAge) url += `&maxAge=${fMaxAge}`;
      if (fNakshatras) url += `&nakshatras=${encodeURIComponent(fNakshatras)}`;
      if (fDosham) url += `&dosham=${encodeURIComponent(fDosham)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setTotal(data.total);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchUsers(1, activeTab, searchQuery, minAge, maxAge, nakshatras, dosham);
  }, [activeTab, fetchUsers, searchQuery]);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, activeTab, searchQuery, minAge, maxAge, nakshatras, dosham);
  };

  const handleFilterChange = (search: string, status: string, newMinAge?: number, newMaxAge?: number, newNakshatras?: string, newDosham?: string) => {
    setSearchQuery(search);
    setActiveTab(status);
    if (newMinAge !== undefined) setMinAge(newMinAge);
    if (newMaxAge !== undefined) setMaxAge(newMaxAge);
    if (newNakshatras !== undefined) setNakshatras(newNakshatras);
    if (newDosham !== undefined) setDosham(newDosham);
    
    fetchUsers(1, status, search, newMinAge !== undefined ? newMinAge : minAge, newMaxAge !== undefined ? newMaxAge : maxAge, newNakshatras !== undefined ? newNakshatras : nakshatras, newDosham !== undefined ? newDosham : dosham);
  };

  const refreshList = () => {
    fetchUsers(currentPage, activeTab, searchQuery, minAge, maxAge, nakshatras, dosham);
  };



  return (
    <div className="space-y-6 pb-12 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            User Directory & Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage matrimonial profiles, approve registrations, and track matchmaking process.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshList}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Users'}
          </Button>
        </div>
      </div>


      {/* Table */}
      <UsersTable
        users={users}
        total={total}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onRowClick={(id) => setDrawerUserId(id)}
        currentStatus={activeTab}
      />

      {/* Profile Drawer */}
      <UserDrawer
        userId={drawerUserId}
        isOpen={drawerUserId !== null}
        onClose={() => setDrawerUserId(null)}
        onReviewComplete={refreshList}
      />
    </div>
  );
}
