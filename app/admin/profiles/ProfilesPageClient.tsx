'use client';

// ==========================================
// CLIENT WRAPPER FOR PROFILES LISTING PAGES
// ==========================================

import React, { useState, useEffect } from 'react';
import Button from '@/components/admin/ui/Button';
import ProfilesTable from '@/components/admin/ProfilesTable';
import ProfileReviewModal from '@/components/admin/ProfileReviewModal';
import ProfileEditModal from '@/components/admin/ProfileEditModal';
import RejectDialog from '@/components/admin/RejectDialog';
import CreateProfileModal from '@/components/admin/CreateProfileModal';
import ProfilesFilterDrawer from '@/components/admin/ProfilesFilterDrawer';
import { AdminProfile, ProfileStatus, FilterParams } from '@/types/admin';
import { getProfilesAction } from '@/actions/admin/profile.actions';
import { useRouter, useSearchParams } from 'next/navigation';

export interface ProfilesPageClientProps {
  title: string;
  description: string;
  initialProfiles: AdminProfile[];
  initialTotal: number;
  fixedStatus?: ProfileStatus | 'ALL';
}

export const ProfilesPageClient: React.FC<ProfilesPageClientProps> = ({
  title,
  description,
  initialProfiles,
  initialTotal,
  fixedStatus = 'ALL',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<AdminProfile[]>(initialProfiles);
  const [total, setTotal] = useState<number>(initialTotal);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Unified Filters state
  const [filters, setFilters] = useState<Partial<FilterParams>>({
    status: searchParams.get('status') || fixedStatus,
    gender: searchParams.get('gender') || 'ALL',
    query: searchParams.get('query') || '',
    minAge: searchParams.get('minAge') ? Number(searchParams.get('minAge')) : undefined,
    maxAge: searchParams.get('maxAge') ? Number(searchParams.get('maxAge')) : undefined,
    maritalStatus: searchParams.get('maritalStatus') || 'ALL',
    nakshatras: searchParams.get('nakshatras') ? searchParams.get('nakshatras')!.split(',') : [],
  });

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // When URL search params change, update state and fetch if this component is mounted and URL changes externally
  useEffect(() => {
    if (searchParams.toString()) {
      const newFilters: Partial<FilterParams> = {
        ...filters,
        status: searchParams.get('status') || fixedStatus,
        gender: searchParams.get('gender') || 'ALL',
        query: searchParams.get('query') || '',
        minAge: searchParams.get('minAge') ? Number(searchParams.get('minAge')) : undefined,
        maxAge: searchParams.get('maxAge') ? Number(searchParams.get('maxAge')) : undefined,
        maritalStatus: searchParams.get('maritalStatus') || 'ALL',
        nakshatras: searchParams.get('nakshatras') ? searchParams.get('nakshatras')!.split(',') : [],
      };
      setFilters(newFilters);
      fetchFilteredProfiles(1, newFilters);
    }
  }, [searchParams]);

  const fetchFilteredProfiles = async (page: number, currentFilters: Partial<FilterParams>) => {
    try {
      const res = await getProfilesAction(
        page,
        itemsPerPage,
        currentFilters.status === 'ALL' ? undefined : (currentFilters.status as any),
        currentFilters.gender === 'ALL' ? undefined : (currentFilters.gender as any),
        currentFilters.query || undefined,
        currentFilters.minAge,
        currentFilters.maxAge,
        currentFilters.maritalStatus === 'ALL' ? undefined : currentFilters.maritalStatus,
        currentFilters.nakshatras,
        currentFilters.rasi,
        currentFilters.dosham,
        currentFilters.minHeight,
        currentFilters.maxHeight,
        currentFilters.propertyValue,
        currentFilters.minPavan,
        currentFilters.maxPavan,
        currentFilters.skinColour,
        currentFilters.workLocations,
        currentFilters.preferredCities,
        currentFilters.preferredProfessions
      );
      if (res.success && res.data) {
        setProfiles(res.data.data || []);
        setTotal(res.data.total || 0);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchFilteredProfiles(newPage, filters);
  };

  const handleFilterChange = (status: string, gender: string, search: string) => {
    const newFilters = { ...filters, status, gender, query: search };
    setFilters(newFilters);
    fetchFilteredProfiles(1, newFilters);
  };

  const handleApplyAdvancedFilters = (newFilters: Partial<FilterParams>) => {
    setFilters(newFilters);
    fetchFilteredProfiles(1, newFilters);
  };

  const refreshList = () => {
    fetchFilteredProfiles(currentPage, filters);
    router.refresh();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 ">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900  tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-500  mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshList}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Refresh
          </Button>

          <Button
            variant="success"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Create New Profile
          </Button>
        </div>
      </div>

      {/* Profiles Data Table */}
      <ProfilesTable
        profiles={profiles}
        total={total}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        showFilters={true}
        currentStatus={filters.status as any}
        currentGender={filters.gender as any}
        onFilterChange={handleFilterChange}
        onOpenFilters={() => setDrawerOpen(true)}
        onViewProfile={(profile) => {
          setSelectedProfile(profile);
          setReviewModalOpen(true);
        }}
        onRejectProfile={(profile) => {
          setSelectedProfile(profile);
          setRejectModalOpen(true);
        }}
        onEditProfile={(profile) => {
          router.push(`/admin/profiles/${profile.id || profile.displayId}/edit`);
        }}
        onRefresh={refreshList}
      />

      {/* Advanced Filters Drawer */}
      <ProfilesFilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentFilters={filters}
        onApplyFilters={handleApplyAdvancedFilters}
      />

      {/* Review Profile Modal */}
      <ProfileReviewModal
        profile={selectedProfile}
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          refreshList();
        }}
        onReject={(p) => {
          setReviewModalOpen(false);
          setSelectedProfile(p);
          setRejectModalOpen(true);
        }}
        onEdit={(p) => {
          setReviewModalOpen(false);
          router.push(`/admin/profiles/${p.id || p.displayId}/edit`);
        }}
        onDeleted={() => refreshList()}
      />

      {/* Edit Profile Modal */}
      <ProfileEditModal
        profile={selectedProfile}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          refreshList();
        }}
        onSuccess={() => refreshList()}
      />

      {/* Reject Dialog */}
      <RejectDialog
        profile={selectedProfile}
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          refreshList();
        }}
        onSuccess={() => refreshList()}
      />

      {/* Create Profile Modal */}
      <CreateProfileModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          refreshList();
        }}
        onSuccess={() => refreshList()}
      />
    </div>
  );
};

export default ProfilesPageClient;
