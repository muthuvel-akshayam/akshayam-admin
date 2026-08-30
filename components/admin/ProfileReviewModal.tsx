'use client';

// ==========================================
// PROFILE REVIEW & MODERATION MODAL / DETAILS
// ==========================================

import React, { useState } from 'react';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import JathagamGridView, { PlanetPlacement } from './JathagamGridView';
import { AdminProfile, ProfileStatus } from '../../types/admin';
import { approveProfileAction, deleteProfileAction } from '../../actions/admin/profile.actions';
import { searchCompatibilityAction } from '../../actions/admin/compatibility.actions';
import { toggleUserFeaturedAction } from '../../actions/admin/user.actions';
import MatchingProfilesModal from './MatchingProfilesModal';
import { useRouter } from 'next/navigation';

const mapAstrologyGridToPlacements = (gridData: any): PlanetPlacement[] => {
  if (!gridData || typeof gridData !== 'object') return [];
  const houseMapping: Record<string, number> = {
    'meenam': 11, 'mesham': 0, 'rishabham': 1, 'mithunam': 2,
    'kadagam': 3, 'simmam': 4, 'kanni': 5, 'thulam': 6,
    'viruchigam': 7, 'dhanusu': 8, 'magaram': 9, 'kumbam': 10
  };
  
  return Object.entries(gridData).map(([key, planets]) => ({
    houseIndex: houseMapping[key.toLowerCase()] ?? 0,
    planets: Array.isArray(planets) ? planets : []
  }));
};

export interface ProfileReviewModalProps {
  profile: AdminProfile | null;
  isOpen: boolean;
  onClose?: () => void;
  onReject?: (profile: AdminProfile) => void;
  onEdit?: (profile: AdminProfile) => void;
  onDeleted?: (id: number) => void;
  isStandalonePage?: boolean;
}

export const ProfileReviewModal: React.FC<ProfileReviewModalProps> = ({
  profile,
  isOpen,
  onClose,
  onReject,
  onEdit,
  onDeleted,
  isStandalonePage = false,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'family' | 'jathagam' | 'docs' | 'privacy'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
  const [jathagamImgError, setJathagamImgError] = useState(false);
  const [newUserId, setNewUserId] = useState(String(profile?.userId || ''));
  const [isFeatured, setIsFeatured] = useState(profile?.isFeatured || false);
  const [isMatchesModalOpen, setIsMatchesModalOpen] = useState(false);
  const router = useRouter();

  if (!profile) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const profileId = Number(profile.id) || (profile.id as any);
      const res = await approveProfileAction(profileId, newUserId !== String(profile.userId) ? newUserId : undefined);
      if (res.success) {
        showToast(res.message || 'Profile approved successfully!', 'success');
        if (!isStandalonePage) onClose?.();
      } else {
        showToast(res.error || 'Approval failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error executing approval', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete profile for ${profile.name}?`)) return;
    setIsLoading(true);
    try {
      const profileId = Number(profile.id);
      const res = await deleteProfileAction(profileId);
      if (res.success) {
        showToast('Profile deleted successfully', 'success');
        if (onDeleted) onDeleted(profileId);
        if (!isStandalonePage) onClose?.();
      } else {
        showToast(res.error || 'Deletion failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindMatches = () => {
    setIsMatchesModalOpen(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const education = profile.educationOccupation?.highestEducation || 'N/A';
    const kulam = profile.koottam || profile.caste || profile.subCaste || 'N/A';
    const profileUrl = `https://www.akshayammatrimony.com/profiles/${profile.id}`;
    const shareText = `பெயர் :${profile.name} படிப்பு :${education} குலம் : ${kulam} - மேலும் விபரங்களுக்கு லிங்க்கை கிளிக் செய்யவும்\n${profileUrl}`;
    
    // Open in WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    
    // Fallback to clipboard
    navigator.clipboard.writeText(shareText).catch(err => {
      console.warn('Failed to copy to clipboard (permission denied):', err);
    });
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile?.jathagamUrl) {
      showToast('No Jathagam available to download', 'error');
      return;
    }
    
    const fullUrl = profile.jathagamUrl.startsWith('http') 
      ? profile.jathagamUrl 
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-documents/${profile.jathagamUrl}`;
    
    try {
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.name.replace(/\s+/g, '_')}_Jathagam.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      showToast('Jathagam downloaded successfully', 'success');
    } catch (err) {
      // Fallback: Open in new tab
      window.open(fullUrl, '_blank');
    }
  };

  const handleToggleImportant = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const res = await toggleUserFeaturedAction(profile.userId, !isFeatured);
      if (res.success) {
        setIsFeatured(!isFeatured);
        showToast(!isFeatured ? 'Profile marked as important/shortlisted' : 'Profile removed from important list', 'success');
      } else {
        showToast(res.error || 'Failed to update important status', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header Profile Summary Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 text-white shadow-md mb-6">
        <div className="flex items-center gap-4">
          <img
            src={
              profile.photos?.[selectedPhotoIdx]?.url ||
              profile.photos?.[0]?.url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop'
            }
            alt={profile.name}
            className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400 shadow cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setFullscreenImageUrl(
              profile.photos?.[selectedPhotoIdx]?.url ||
              profile.photos?.[0]?.url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop'
            )}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{profile.name}</h3>
              <Badge status={profile.status} />
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              {profile.age} Yrs • {profile.height} • {profile.religion}, {profile.caste} • {profile.city}
            </p>
            <p className="text-[10px] text-emerald-300 font-mono mt-0.5">
              Profile ID: {profile.id} | User ID: {profile.userId}
            </p>
          </div>
        </div>

        {/* Action Panel in Header */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={handleShare}
            className="p-2 rounded-lg bg-emerald-800/50 hover:bg-emerald-700 transition-colors text-white tooltip-trigger" 
            title="Copy Summary to Share"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          
          <button 
            onClick={handleDownload}
            className="p-2 rounded-lg bg-emerald-800/50 hover:bg-emerald-700 transition-colors text-white tooltip-trigger" 
            title="Download / Print PDF"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          
          <button 
            onClick={handleToggleImportant}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors text-white tooltip-trigger ${isFeatured ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-800/50 hover:bg-emerald-700'}`} 
            title={isFeatured ? "Remove First Preference Badge" : "Mark as First Preference (Important)"}
          >
            <svg className="w-5 h-5" fill={isFeatured ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleFindMatches}
            isLoading={isLoading}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
          >
            Find Matches
          </Button>

          {profile.status !== ProfileStatus.APPROVED && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Assign User ID"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="bg-white/10 border border-emerald-500 text-white placeholder:text-emerald-300 text-xs px-2 py-1.5 rounded-lg w-28 focus:outline-none focus:border-white transition-colors"
                title="Optional: Assign a specific User ID before approving"
              />
              <Button
                variant="success"
                size="sm"
                onClick={handleApprove}
                isLoading={isLoading}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                Approve
              </Button>
            </div>
          )}

          {profile.status !== ProfileStatus.REJECTED && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (onReject) onReject(profile);
              }}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            >
              Reject
            </Button>
          )}

          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(profile)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit
            </Button>
          )}

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-rose-900/40 text-rose-300 hover:bg-rose-900/80 transition-colors"
            title="Delete Profile"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Rejection Reason Notice (if rejected) */}
      {profile.status === ProfileStatus.REJECTED && profile.rejectedReason && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50  border border-rose-200  flex items-start gap-3">
          <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-xs font-bold text-rose-800  uppercase">Rejection Reason</p>
            <p className="text-sm text-rose-700  mt-1">{profile.rejectedReason}</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200  mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'Personal & Occupation' },
          { id: 'family', label: 'Family Information' },
          { id: 'jathagam', label: 'Jathagam & Astrology' },
          { id: 'docs', label: 'Photos & Documents' },
          { id: 'privacy', label: 'Privacy & Moderation Log' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700  bg-emerald-50/50 '
                : 'border-transparent text-slate-500 hover:text-slate-800 '
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Personal Information & Occupation */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          <div className="bg-slate-50  p-5 rounded-2xl border border-slate-200/80 ">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-4 pb-2 border-b border-slate-200 ">
              Personal Information
            </h4>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between"><dt className="text-slate-500">Full Name</dt><dd className="font-semibold">{profile.name || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Gender</dt><dd className="font-semibold">{profile.gender || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Age / DOB</dt><dd className="font-semibold">{profile.age || 'N/A'} Yrs ({profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'})</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Marital Status</dt><dd className="font-semibold">{profile.maritalStatus || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Height / Weight</dt><dd className="font-semibold">{profile.height || 'N/A'} / {profile.weight || 'N/A'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Physical Status</dt><dd className="font-semibold">{profile.physicalStatus || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Location</dt><dd className="font-semibold">{[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Not Specified'}</dd></div>
            </dl>
          </div>

          <div className="bg-slate-50  p-5 rounded-2xl border border-slate-200/80 ">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-4 pb-2 border-b border-slate-200 ">
              Education & Occupation
            </h4>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between"><dt className="text-slate-500">Highest Education</dt><dd className="font-semibold">{profile.educationOccupation?.highestEducation || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Employed In</dt><dd className="font-semibold">{profile.educationOccupation?.employedIn || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Occupation</dt><dd className="font-semibold">{profile.educationOccupation?.occupation || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Annual Income</dt><dd className="font-semibold text-emerald-700  font-bold">{profile.educationOccupation?.annualIncome || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Work Location</dt><dd className="font-semibold">{profile.educationOccupation?.workLocation || 'Not Specified'}</dd></div>
            </dl>
          </div>

          <div className="md:col-span-2 bg-slate-50  p-5 rounded-2xl border border-slate-200/80 ">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-2">
              About Me
            </h4>
            <p className="text-xs text-slate-700  leading-relaxed">
              {profile.aboutMe || 'Not Specified'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Family Information */}
      {activeTab === 'family' && (
        <div className="bg-slate-50  p-6 rounded-2xl border border-slate-200/80  animate-fadeIn">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-4 pb-2 border-b border-slate-200 ">
            Family Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Father's Name:</span><span className="font-semibold">{profile.family?.fatherName || 'Not Specified'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Father's Occupation:</span><span className="font-semibold">{profile.family?.fatherOccupation || 'Not Specified'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Mother's Name:</span><span className="font-semibold">{profile.family?.motherName || 'Not Specified'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Mother's Occupation:</span><span className="font-semibold">{profile.family?.motherOccupation || 'Not Specified'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Brothers:</span><span className="font-semibold">{profile.family?.brothersCount ?? 0} ({profile.family?.brothersMarried ?? 0} Married)</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Sisters:</span><span className="font-semibold">{profile.family?.sistersCount ?? 0} ({profile.family?.sistersMarried ?? 0} Married)</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Family Type:</span><span className="font-semibold">{profile.family?.familyType || 'Not Specified'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Family Values:</span><span className="font-semibold">{profile.family?.familyValue || 'Not Specified'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Native Place:</span><span className="font-semibold">{profile.family?.nativePlace || 'Not Specified'}</span></div>
          </div>
        </div>
      )}

      {/* Tab 3: Jathagam & Astrology */}
      {activeTab === 'jathagam' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          <div className="bg-slate-50  p-5 rounded-2xl border border-slate-200/80 ">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-4 pb-2 border-b border-slate-200 ">
              Astrological Profile
            </h4>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between"><dt className="text-slate-500">Religion</dt><dd className="font-bold text-emerald-700 ">{profile.religion || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Caste / Sub-caste</dt><dd className="font-semibold">{profile.caste || 'Not Specified'} {profile.subCaste ? `(${profile.subCaste})` : ''}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Gothram</dt><dd className="font-semibold">{profile.gothram || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Nakshatra (Birth Star)</dt><dd className="font-bold text-slate-900  bg-slate-200  px-2 py-0.5 rounded">{profile.nakshatra || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Rasi (Moon Sign)</dt><dd className="font-semibold">{profile.rasi || 'Not Specified'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Dosham Status</dt><dd className="font-semibold text-amber-600 ">{profile.dosham || 'Not Specified'}</dd></div>
            </dl>
          </div>

          <div className="bg-slate-50  p-5 rounded-2xl border border-slate-200/80  flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-2">
                Jathagam Chart Viewer (PDF / Image)
              </h4>
              <p className="text-xs text-slate-500 mb-4">Click below to inspect the uploaded horoscope chart.</p>
            </div>
            <div className="border-2 border-dashed border-slate-300  rounded-xl p-4 text-center bg-white  flex flex-col items-center justify-center min-h-[160px]">
              {(profile.rasiGrid || profile.amsamGrid) ? (
                <div className="w-full">
                  <JathagamGridView 
                    rasiData={mapAstrologyGridToPlacements(profile.rasiGrid)}
                    navamsamData={mapAstrologyGridToPlacements(profile.amsamGrid)}
                  />
                  {profile.jathagamUrl && (
                    <div className="mt-6 border-t pt-4">
                      <p className="text-xs text-slate-500 mb-2">Original Uploaded File:</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFullscreenImageUrl(profile.jathagamUrl || null);
                        }}
                        className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-lg inline-block transition-colors shadow-sm"
                      >
                        View Full Original File
                      </button>
                    </div>
                  )}
                </div>
              ) : profile.jathagamUrl ? (
                <>
                  {!jathagamImgError && !profile.jathagamUrl.toLowerCase().includes('.pdf') ? (
                    <img
                      src={profile.jathagamUrl}
                      alt="Jathagam Preview"
                      className="max-h-[140px] max-w-full object-contain mb-3 rounded-lg shadow-sm cursor-zoom-in"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFullscreenImageUrl(profile.jathagamUrl || null);
                      }}
                      onError={() => setJathagamImgError(true)}
                    />
                  ) : (
                    <svg className="w-10 h-10 text-emerald-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  <p className="text-xs font-bold text-slate-800 ">Horoscope_Chart_{profile.name.replace(/\s+/g, '_')}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFullscreenImageUrl(profile.jathagamUrl || null);
                    }}
                    className="mt-3 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-lg inline-block transition-colors shadow-sm"
                  >
                    View Jathagam Fullscreen
                  </button>
                  <a
                    href={profile.jathagamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-[10px] text-slate-500 hover:text-emerald-600 underline"
                  >
                    Open in new tab
                  </a>
                </>
              ) : (
                <p className="text-xs text-slate-400">No Jathagam uploaded for this profile yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Photos & Documents */}
      {activeTab === 'docs' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-3">
              Uploaded Photographs ({profile.photos?.length || 0})
            </h4>
            {profile.photos && profile.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {profile.photos.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedPhotoIdx(idx);
                      setFullscreenImageUrl(p.url);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square cursor-pointer border-2 transition-all ${
                      selectedPhotoIdx === idx ? 'border-emerald-600 scale-[1.02] shadow-md' : 'border-slate-200  opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt="Profile thumbnail" className="w-full h-full object-cover" />
                    {p.isPrimary && (
                      <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No photos uploaded for this profile.</p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-3">
              Uploaded Verification Documents
            </h4>
            {profile.documents && profile.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50  border border-slate-200 ">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700  ">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 ">{doc.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{doc.type}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800   px-2 py-1 rounded-full">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No documents uploaded for this profile.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Privacy Settings & Moderation Log */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 animate-fadeIn text-xs">
          <div className="bg-slate-50  p-5 rounded-2xl border border-slate-200/80 ">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-3 pb-2 border-b border-slate-200 ">
              User Privacy Preferences
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><span className="text-slate-500 block">Show Photo To:</span><span className="font-bold text-slate-800 ">{profile.privacy?.showPhotoTo || 'Not Specified'}</span></div>
              <div><span className="text-slate-500 block">Show Phone To:</span><span className="font-bold text-slate-800 ">{profile.privacy?.showPhoneTo || 'Not Specified'}</span></div>
              <div><span className="text-slate-500 block">Show Jathagam To:</span><span className="font-bold text-slate-800 ">{profile.privacy?.showJathagamTo || 'Not Specified'}</span></div>
            </div>
          </div>

          <div className="bg-slate-50  p-5 rounded-2xl border border-slate-200/80 ">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-3 pb-2 border-b border-slate-200 ">
              Moderation Audit Log
            </h4>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between text-slate-600 ">
                <span>Created / Registered:</span>
                <span>{new Date(profile.registeredDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 ">
                <span>Current Status:</span>
                <span className="font-bold">{profile.status}</span>
              </div>
              {profile.approvedAt && (
                <div className="flex justify-between text-emerald-700  font-bold">
                  <span>Approved At:</span>
                  <span>{new Date(profile.approvedAt).toLocaleString()} (by {profile.approvedBy || 'Admin'})</span>
                </div>
              )}
              {profile.rejectedReason && (
                <div className="flex justify-between text-rose-600  font-bold">
                  <span>Rejected Reason:</span>
                  <span>{profile.rejectedReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Document/Image Viewer Overlay */}
      {fullscreenImageUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm cursor-zoom-out animate-fadeIn"
          onClick={() => setFullscreenImageUrl(null)}
        >
          {fullscreenImageUrl.toLowerCase().includes('.pdf') || (fullscreenImageUrl === profile.jathagamUrl && jathagamImgError) ? (
            <iframe 
              src={fullscreenImageUrl} 
              className="w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl animate-scaleUp"
              title="PDF Viewer"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img 
              src={fullscreenImageUrl} 
              alt="Fullscreen View" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
              onError={() => {
                if (fullscreenImageUrl === profile.jathagamUrl) setJathagamImgError(true);
              }}
            />
          )}
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all z-50"
            onClick={() => setFullscreenImageUrl(null)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  if (isStandalonePage) {
    return <div className="bg-white  rounded-2xl p-6 border border-slate-200  shadow-sm">{content}</div>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      title="Profile Review Details"
      subtitle={`Comprehensive verification inspection for ${profile.name}`}
      maxWidth="4xl"
      footer={
        <Button variant="secondary" onClick={onClose || (() => {})}>
          Close Viewer
        </Button>
      }
    >
      {content}
      <MatchingProfilesModal 
        isOpen={isMatchesModalOpen} 
        onClose={() => setIsMatchesModalOpen(false)} 
        baseProfile={profile as any} 
      />
    </Modal>
  );
};

export default ProfileReviewModal;
