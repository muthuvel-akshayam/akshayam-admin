'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/admin/ui/Button';
import UsersTable from '@/components/admin/UsersTable';
import UserDrawer from '@/components/admin/UserDrawer';
import AmazonFiltersSidebar from '@/components/admin/AmazonFiltersSidebar';
import LanguageSwitcher from '@/components/admin/LanguageSwitcher';
import { CreateProfileModal } from '@/components/admin/CreateProfileModal';
import { AdminUser, FilterParams } from '@/types/admin';
import { useSearchParams, useRouter } from 'next/navigation';

export default function UsersPageClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [filters, setFilters] = useState<Partial<FilterParams>>({
    status: searchParams.get('status') || 'all',
    query: searchParams.get('query') || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [drawerUserId, setDrawerUserId] = useState<string | number | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchUsers = useCallback(async (page: number, currentFilters: Partial<FilterParams>) => {
    setLoading(true);
    try {
      let url = `/api/admin/users?page=${page}&limit=${itemsPerPage}&status=${currentFilters.status || 'all'}`;
      if (currentFilters.query) url += `&search=${encodeURIComponent(currentFilters.query)}`;
      if (currentFilters.minAge) url += `&minAge=${currentFilters.minAge}`;
      if (currentFilters.maxAge) url += `&maxAge=${currentFilters.maxAge}`;
      if (currentFilters.maritalStatus && currentFilters.maritalStatus !== 'ALL') url += `&maritalStatus=${currentFilters.maritalStatus}`;
      if (currentFilters.nakshatras && currentFilters.nakshatras.length > 0) url += `&nakshatras=${encodeURIComponent(currentFilters.nakshatras.join(','))}`;
      if (currentFilters.rasi) url += `&rasi=${encodeURIComponent(currentFilters.rasi)}`;
      if (currentFilters.dosham) url += `&dosham=${encodeURIComponent(currentFilters.dosham)}`;
      if (currentFilters.propertyValue) url += `&propertyValue=${encodeURIComponent(currentFilters.propertyValue)}`;
      if (currentFilters.minPavan) url += `&minPavan=${currentFilters.minPavan}`;
      if (currentFilters.maxPavan) url += `&maxPavan=${currentFilters.maxPavan}`;
      if (currentFilters.skinColour) url += `&skinColour=${encodeURIComponent(currentFilters.skinColour)}`;
      if (currentFilters.minHeight) url += `&minHeight=${currentFilters.minHeight}`;
      if (currentFilters.maxHeight) url += `&maxHeight=${currentFilters.maxHeight}`;
      if (currentFilters.workLocations && currentFilters.workLocations.length > 0) url += `&workLocations=${encodeURIComponent(currentFilters.workLocations.join(','))}`;
      if (currentFilters.preferredCities && currentFilters.preferredCities.length > 0) url += `&preferredCities=${encodeURIComponent(currentFilters.preferredCities.join(','))}`;
      if (currentFilters.preferredProfessions && currentFilters.preferredProfessions.length > 0) url += `&preferredProfessions=${encodeURIComponent(currentFilters.preferredProfessions.join(','))}`;

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
    fetchUsers(1, filters);
  }, [fetchUsers]); // Intentionally not including filters directly here if we want manual apply, but we'll fetch on filter change.

  const urlStatus = searchParams.get('status') || 'all';
  const urlQuery = searchParams.get('query') || '';

  useEffect(() => {
    setFilters(prev => {
      if (prev.status !== urlStatus || prev.query !== urlQuery) {
        const newFilters = { ...prev, status: urlStatus, query: urlQuery };
        fetchUsers(1, newFilters);
        return newFilters;
      }
      return prev;
    });
  }, [urlStatus, urlQuery, fetchUsers]);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, filters);
  };

  const handleFilterChange = (search: string, status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', status);
    if (search) params.set('query', search);
    else params.delete('query');
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleSidebarFilterChange = (newFilters: Partial<FilterParams>) => {
    setFilters(newFilters);
    fetchUsers(1, newFilters);
  };

  const refreshList = () => {
    fetchUsers(currentPage, filters);
  };



  return (
    <div className="pb-12 bg-[#F8FAFC] min-h-screen">
      {/* Header - Made more compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 mb-4 border-b border-[#E2E8F0] bg-white px-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            User Directory & Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage matrimonial profiles, approve registrations, and track matchmaking process.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="hidden sm:flex"
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Create Profile
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex-1 sm:flex-none"
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            }
          >
            Filters
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshList}
            disabled={loading}
            className="flex-1 sm:flex-none"
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="px-4 flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
        {/* Left Sidebar */}
        <AmazonFiltersSidebar
          filters={filters}
          onChange={handleSidebarFilterChange}
          isMobileOpen={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <UsersTable
            users={users}
            total={total}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            onRowClick={(id) => setDrawerUserId(id)}
            currentStatus={filters.status as string}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Profile Drawer */}
      <UserDrawer
        userId={drawerUserId}
        isOpen={drawerUserId !== null}
        onClose={() => setDrawerUserId(null)}
        onReviewComplete={refreshList}
      />

      <CreateProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshList}
      />
    </div>
  );
}
