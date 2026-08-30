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
import { AdminProfile, ProfileStatus } from '@/types/admin';
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

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || fixedStatus);
  const [genderFilter, setGenderFilter] = useState<string>(searchParams.get('gender') || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('query') || '');
  
  // Advanced Filters state
  const [minAge, setMinAge] = useState<number | undefined>(searchParams.get('minAge') ? Number(searchParams.get('minAge')) : undefined);
  const [maxAge, setMaxAge] = useState<number | undefined>(searchParams.get('maxAge') ? Number(searchParams.get('maxAge')) : undefined);
  const [maritalStatus, setMaritalStatus] = useState<string>(searchParams.get('maritalStatus') || 'ALL');
  const [nakshatras, setNakshatras] = useState<string[]>(searchParams.get('nakshatras') ? searchParams.get('nakshatras')!.split(',') : []);

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // When URL search params change, update state and fetch if this component is mounted and URL changes externally
  useEffect(() => {
    if (searchParams.get('gender')) setGenderFilter(searchParams.get('gender')!);
    if (searchParams.get('nakshatras')) setNakshatras(searchParams.get('nakshatras')!.split(','));
    if (searchParams.get('minAge')) setMinAge(Number(searchParams.get('minAge')));
    if (searchParams.get('maxAge')) setMaxAge(Number(searchParams.get('maxAge')));
    if (searchParams.get('status')) setStatusFilter(searchParams.get('status')!);
    // Trigger initial fetch with URL params if any exist (since initialProfiles might not reflect these params)
    if (searchParams.toString()) {
      fetchFilteredProfiles(
        1, 
        searchParams.get('status') || fixedStatus, 
        searchParams.get('gender') || 'ALL', 
        searchParams.get('query') || '',
        searchParams.get('minAge') ? Number(searchParams.get('minAge')) : undefined,
        searchParams.get('maxAge') ? Number(searchParams.get('maxAge')) : undefined,
        searchParams.get('maritalStatus') || 'ALL',
        searchParams.get('nakshatras') ? searchParams.get('nakshatras')!.split(',') : []
      );
    }
  }, [searchParams]);

  const fetchFilteredProfiles = async (
    page: number, 
    status: string, 
    gender: string, 
    query: string,
    minAgeParam?: number,
    maxAgeParam?: number,
    maritalStatusParam?: string,
    nakshatrasParam?: string[]
  ) => {
    try {
      const res = await getProfilesAction(
        page,
        itemsPerPage,
        status === 'ALL' ? undefined : (status as any),
        gender === 'ALL' ? undefined : (gender as any),
        query || undefined,
        minAgeParam,
        maxAgeParam,
        maritalStatusParam === 'ALL' ? undefined : maritalStatusParam,
        nakshatrasParam
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
    fetchFilteredProfiles(newPage, statusFilter, genderFilter, searchQuery, minAge, maxAge, maritalStatus, nakshatras);
  };

  const handleFilterChange = (
    status: string, 
    gender: string, 
    search: string,
    newMinAge?: number,
    newMaxAge?: number,
    newMaritalStatus?: string,
    newNakshatras?: string[]
  ) => {
    setStatusFilter(status);
    setGenderFilter(gender);
    setSearchQuery(search);
    if (newMinAge !== undefined) setMinAge(newMinAge);
    if (newMaxAge !== undefined) setMaxAge(newMaxAge);
    if (newMaritalStatus !== undefined) setMaritalStatus(newMaritalStatus);
    if (newNakshatras !== undefined) setNakshatras(newNakshatras);
    
    fetchFilteredProfiles(
      1, 
      status, 
      gender, 
      search, 
      newMinAge !== undefined ? newMinAge : minAge, 
      newMaxAge !== undefined ? newMaxAge : maxAge, 
      newMaritalStatus !== undefined ? newMaritalStatus : maritalStatus, 
      newNakshatras !== undefined ? newNakshatras : nakshatras
    );
  };

  const refreshList = () => {
    fetchFilteredProfiles(currentPage, statusFilter, genderFilter, searchQuery, minAge, maxAge, maritalStatus, nakshatras);
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
        currentStatus={statusFilter as any}
        currentGender={genderFilter as any}
        onFilterChange={handleFilterChange}
        onViewProfile={(profile) => {
          setSelectedProfile(profile);
          setReviewModalOpen(true);
        }}
        onRejectProfile={(profile) => {
          setSelectedProfile(profile);
          setRejectModalOpen(true);
        }}
        onEditProfile={(profile) => {
          setSelectedProfile(profile);
          setEditModalOpen(true);
        }}
        onRefresh={refreshList}
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
          setSelectedProfile(p);
          setEditModalOpen(true);
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
