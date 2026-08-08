'use client';

// ==========================================
// PROFILES DATA TABLE COMPONENT
// ==========================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Pagination from './ui/Pagination';
import ConfirmDialog from './ui/ConfirmDialog';
import { useToast } from './ui/Toast';
import { AdminProfile, ProfileStatus } from '../../types/admin';
import { approveProfileAction, removeAfterMatchAction, restoreProfileAction } from '@/actions/admin/profile.actions';

export interface ProfilesTableProps {
  profiles: AdminProfile[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onViewProfile?: (profile: AdminProfile) => void;
  onRejectProfile?: (profile: AdminProfile) => void;
  onEditProfile?: (profile: AdminProfile) => void;
  showFilters?: boolean;
  currentStatus?: ProfileStatus | 'ALL';
  currentGender?: 'MALE' | 'FEMALE' | 'ALL';
  onFilterChange?: (status: string, gender: string, search: string) => void;
  onRefresh?: () => void;
}

export const ProfilesTable: React.FC<ProfilesTableProps> = ({
  profiles,
  total,
  currentPage,
  itemsPerPage,
  onPageChange,
  onViewProfile,
  onRejectProfile,
  onEditProfile,
  showFilters = true,
  currentStatus = 'ALL',
  currentGender = 'ALL',
  onFilterChange,
  onRefresh,
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deleteConfirmProfile, setDeleteConfirmProfile] = useState<AdminProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleApprove = async (profile: AdminProfile) => {
    const profileId = Number(profile.id);
    setLoadingId(profileId);
    try {
      const res = await approveProfileAction(profileId);
      if (res.success) {
        showToast(res.message || `Approved ${profile.name}`, 'success');
        if (onRefresh) onRefresh();
      } else {
        showToast(res.error || 'Failed to approve', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error approving profile', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmProfile) return;
    const profileId = Number(deleteConfirmProfile.id);
    setLoadingId(profileId);
    try {
      const res = await removeAfterMatchAction(profileId);
      if (res.success) {
        showToast('Profile moved to Remove After Match successfully', 'success');
        if (onRefresh) onRefresh();
      } else {
        showToast(res.error || 'Failed to remove profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error removing profile', 'error');
    } finally {
      setLoadingId(null);
      setDeleteConfirmProfile(null);
    }
  };

  const handleRestore = async (profile: AdminProfile) => {
    const profileId = Number(profile.id);
    setLoadingId(profileId);
    try {
      const res = await restoreProfileAction(profileId);
      if (res.success) {
        showToast(res.message || `Restored ${profile.name} to pending`, 'info');
        if (onRefresh) onRefresh();
      } else {
        showToast(res.error || 'Failed to restore', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error restoring profile', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange(currentStatus, currentGender, searchQuery);
    }
  };

  return (
    <div className="bg-white  rounded-2xl border border-slate-200  shadow-sm overflow-hidden flex flex-col">
      {/* Table Header & Filters */}
      {showFilters && (
        <div className="p-5 border-b border-slate-200  bg-slate-50/50  flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form onSubmit={handleFilterSubmit} className="flex-1 flex items-center gap-3 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search name, city, nakshatra, caste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white  text-slate-800  pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200  focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Filter
            </Button>
          </form>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <select
              value={currentGender}
              onChange={(e) => onFilterChange && onFilterChange(currentStatus, e.target.value, searchQuery)}
              className="bg-white  text-slate-700  px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200  focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male Only</option>
              <option value="FEMALE">Female Only</option>
            </select>

            <select
              value={currentStatus}
              onChange={(e) => onFilterChange && onFilterChange(e.target.value, currentGender, searchQuery)}
              className="bg-white  text-slate-700  px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200  focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Only</option>
              <option value="APPROVED">Approved Only</option>
              <option value="REJECTED">Rejected Only</option>
            </select>
          </div>
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50  text-slate-500  uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 ">
            <tr>
              <th className="px-5 py-3.5">Photo / Name</th>
              <th className="px-4 py-3.5">Gender / Age</th>
              <th className="px-4 py-3.5">Religion / Caste</th>
              <th className="px-4 py-3.5">Nakshatra</th>
              <th className="px-4 py-3.5">City</th>
              <th className="px-4 py-3.5">Registered</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 ">
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500 ">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100  flex items-center justify-center text-slate-400 mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-base">No profiles found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
                </td>
              </tr>
            ) : (
              profiles.map((profile) => {
                const primaryPhoto = profile.photos?.find((p) => p.isPrimary)?.url || profile.photos?.[0]?.url;

                return (
                  <tr
                    key={profile.id}
                    onClick={() => {
                      if (onViewProfile) onViewProfile(profile);
                      else router.push(`/admin/profiles/${profile.id}`);
                    }}
                    className="hover:bg-slate-50/70  transition-colors group cursor-pointer"
                  >
                    {/* Photo / Name */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100  overflow-hidden shrink-0 border border-slate-200  relative">
                          {primaryPhoto ? (
                            <img src={primaryPhoto} alt={profile.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xs">
                              {profile.name.charAt(0)}
                            </div>
                          )}
                          {profile.isLive && (
                            <span
                              className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white  rounded-full"
                              title="Live on site"
                            />
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/profiles/${profile.id}`}
                            className="font-bold text-slate-900  hover:text-emerald-700  transition-colors block leading-tight"
                          >
                            {profile.name}
                          </Link>
                          <span className="text-[11px] text-slate-400  font-mono">
                            ID: {profile.userIndex ? `#${profile.userIndex}` : String(profile.id).substring(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Gender / Age */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 ">
                        {profile.gender === 'MALE' ? 'Male' : 'Female'}
                      </div>
                      <div className="text-xs text-slate-500">{profile.age} Yrs</div>
                    </td>

                    {/* Religion / Caste */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 ">{profile.religion}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[130px]" title={profile.caste}>
                        {profile.caste}
                      </div>
                    </td>

                    {/* Nakshatra */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100  text-slate-700  font-medium text-xs">
                        {profile.nakshatra}
                      </span>
                    </td>

                    {/* City */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 ">
                      {profile.city}
                    </td>

                    {/* Registered Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-xs">
                      {new Date(profile.registeredDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge status={profile.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewProfile) onViewProfile(profile);
                            else router.push(`/admin/profiles/${profile.id}`);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50   transition-colors"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Approve Button (Only if not approved) */}
                        {profile.status !== ProfileStatus.APPROVED && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(profile);
                            }}
                            disabled={loadingId === profile.id}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50   transition-colors disabled:opacity-50"
                            title="Approve Profile"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}

                        {/* Reject Button (Only if not rejected) */}
                        {profile.status !== ProfileStatus.REJECTED && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onRejectProfile) onRejectProfile(profile);
                            }}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50   transition-colors"
                            title="Reject Profile"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        )}

                        {/* Restore Button (If rejected) */}
                        {profile.status === ProfileStatus.REJECTED && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(profile);
                            }}
                            disabled={loadingId === profile.id}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50   transition-colors"
                            title="Restore to Pending"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}

                        {/* Edit Button */}
                        {onEditProfile && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProfile(profile);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100   transition-colors"
                            title="Edit Profile"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmProfile(profile);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50   transition-colors"
                          title="Remove After Match"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(total / itemsPerPage) || 1}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmProfile}
        onClose={() => setDeleteConfirmProfile(null)}
        onConfirm={handleDelete}
        title="Remove After Match?"
        message={`Are you sure you want to mark ${deleteConfirmProfile?.name} as matched and remove them from active searches?`}
        confirmText="Remove After Match"
        variant="danger"
        isLoading={!!loadingId}
      />
    </div>
  );
};

export default ProfilesTable;
