'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { useToast } from './ui/Toast';
import MatchTrackingModal from './MatchTrackingModal';
import { NakshatraMatches } from './NakshatraMatches';
import { useRouter } from 'next/navigation';
import { searchCompatibilityAction } from '../../actions/admin/compatibility.actions';
import { toggleUserFeaturedAction } from '../../actions/admin/user.actions';
import MatchingProfilesModal from './MatchingProfilesModal';

interface UserDrawerProps {
  userId: string | number | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewComplete?: () => void;
}

const value = (input: unknown) => {
  if (input === null || input === undefined || input === '') return null;
  return Array.isArray(input) ? input.join(', ') : String(input).replaceAll('_', ' ');
};

const getFullUrl = (url: string, label: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  if (label === 'Jathagam' || label === 'Caste certificate') {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-documents/${url}`;
  }
  
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function UserDrawer({ userId, isOpen, onClose, onReviewComplete }: UserDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewReason, setReviewReason] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [previewDocument, setPreviewDocument] = useState<{ url: string; label: string } | null>(null);
  const [matchTrackingTab, setMatchTrackingTab] = useState<'SENT' | 'NOT_MATCHED' | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isMatchesModalOpen, setIsMatchesModalOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen || !userId) {
      setUserData(null);
      setReviewReason('');
      setNewUserId('');
      return;
    }

    setLoading(true);
    fetch(`/api/admin/users/${encodeURIComponent(String(userId))}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserData(data.data);
          setNewUserId(String(data.data.id));
          setIsFeatured(data.data.isFeatured || false);
        } else {
          showToast(data.error || 'Failed to load user', 'error');
        }
      })
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  }, [isOpen, userId, showToast]);

  const profile = userData?.profile;
  const profileFields = useMemo(() => {
    if (!profile) return [] as Array<[string, string]>;
    const age = profile.dob ? Math.max(0, new Date().getFullYear() - new Date(profile.dob).getFullYear()) : null;
    return [
      ['Full name', profile.name], ['Gender', profile.gender],
      ['Date of birth', profile.dob ? `${new Date(profile.dob).toLocaleDateString()}${age !== null ? ` (${age} years)` : ''}` : null],
      ['Birth time', profile.tob], ['Birth place', profile.lob],
      ['Country', profile.livingCountry], ['State', profile.state], ['City', profile.city],
      ['Religion', profile.religion], ['Caste', profile.caste], ['Sub-caste', profile.subCaste], ['Koottam', profile.koottam],
      ['Marital status', profile.maritalStatus], ['Family status', profile.familyStatus],
      ['Height', profile.height ? `${profile.height} cm` : null], ['Weight', profile.weight ? `${profile.weight} kg` : null],
      ['Physical condition', profile.physicalCondition], ['Skin colour', profile.skinColour],
      ['Food habits', profile.foodHabits], ['Drinking habits', profile.drinkingHabits], ['Smoking habits', profile.smokingHabits],
      ['Rasi', profile.rasi], ['Nakshatra', profile.nakshatra], ['Matching nakshatras', profile.poruthaNakshatram], ['Dosham', profile.dosham],
      ['Dasa balance', profile.dasaBalance], ['House address', profile.houseAddress],
    ].map(([label, fieldValue]) => [label, value(fieldValue)] as [string, string | null])
      .filter((item): item is [string, string] => item[1] !== null);
  }, [profile]);

  const expectationFields = useMemo(() => {
    const expectations = userData?.expectations;
    if (!expectations) return [] as Array<[string, string]>;
    const yesNo = (item: unknown) => item === null || item === undefined ? null : item ? 'Yes' : 'No';
    return [
      ['Expected height', expectations.expectedHeight ? `${expectations.expectedHeight} cm` : null],
      ['Colour preference', expectations.colourPreference], ['Maximum age', expectations.maxAgeLimit ? `${expectations.maxAgeLimit} years` : null],
      ['Dowry expectation', expectations.dowryExpectation], ['Preferred sectors', expectations.preferredSectors],
      ['Preferred locations', expectations.preferredLocations], ['Expected income', expectations.expectedIncome],
      ['Rental income expected', yesNo(expectations.expectsRentalIncome)], ['Thottam expected', yesNo(expectations.expectsThottam)],
      ['Vacant land preference', expectations.vacantLand], ['Distance radius', expectations.preferredDistanceRadius ? `${expectations.preferredDistanceRadius} km` : null],
      ['Preferred city', expectations.city], ['Comments', expectations.comments],
    ].map(([label, fieldValue]) => [label, value(fieldValue)] as [string, string | null])
      .filter((item): item is [string, string] => item[1] !== null);
  }, [userData]);
  const familyFields = useMemo(() => {
    const family = userData?.family;
    if (!family) return [] as Array<[string, string]>;
    return [
      ['Father name', family.fatherName], ['Father status', family.fatherStatus], ['Father mobile', family.fatherMobile],
      ['Mother name', family.motherName], ['Mother status', family.motherStatus], ['Mother mobile', family.motherMobile],
      ['Work nature', family.workNature], ['Organisation', family.organisation], ['Designation', family.designation], ['Salary', family.salary],
      ['Working address', family.workingAddress], ['Google location', family.googleLocation], ['Rental income', family.rentalIncome],
      ['House type', family.houseType], ['House size', family.houseSqFt], ['Site / land', family.siteLand], ['Thottam', family.thottam],
      ['Vacant land', family.vacantLand], ['Total asset value', family.totalAssetValue], ['Asset comments', family.assetComments],
    ].map(([label, fieldValue]) => [label, value(fieldValue)] as [string, string | null])
      .filter((item): item is [string, string] => item[1] !== null);
  }, [userData]);

  const documents = useMemo(() => {
    const docs = profile ? [
      ['Jathagam', profile.jathakamUrl], ['Profile photo', profile.photoUrl], ['Caste certificate', profile.casteCertificateUrl],
    ].filter((item): item is [string, string] => Boolean(item[1])) : [] as Array<[string, string]>;
    
    if (userData?.paymentScreenshot) {
      docs.push(['Payment Screenshot', userData.paymentScreenshot]);
    }
    return docs;
  }, [profile, userData]);
  const handleReview = async (action: 'APPROVE' | 'REJECT' | 'MATCHED_REMOVED') => {
    if (!userId) return;
    if (action === 'REJECT' && !reviewReason.trim()) {
      showToast('Enter a reason so the user knows what to correct.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(String(userId))}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: reviewReason }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Unexpected server response');
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Profile review failed.');
      setUserData(data.data);
      let successMessage = 'Profile approved and now live.';
      if (action === 'REJECT') successMessage = 'Profile denied with the review reason.';
      if (action === 'MATCHED_REMOVED') successMessage = 'Profile marked as matched and taken offline.';
      showToast(successMessage, 'success');
      onReviewComplete?.();
    } catch (error: any) {
      showToast(error.message || 'Profile review failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };



  const handleUpdateUserId = async () => {
    if (!userId || !userData) return;
    const trimmedId = newUserId.trim();
    if (!trimmedId) {
      showToast('New user ID is required.', 'error');
      return;
    }
    if (trimmedId === String(userData.id)) {
      showToast('Please provide a different user ID to update.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(String(userId))}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUserId: trimmedId }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Unexpected server response');
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to update user ID.');
      showToast('User ID updated successfully. The drawer will refresh.', 'success');
      onReviewComplete?.();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to update user ID.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFindMatches = () => {
    if (!profile) return;
    setIsMatchesModalOpen(true);
  };

  const handleShare = () => {
    if (!profile) return;
    const age = profile.dob ? Math.max(0, new Date().getFullYear() - new Date(profile.dob).getFullYear()) : 'N/A';
    const education = userData?.educations?.[0]?.degreeName || 'N/A';
    const shareText = `Profile: ${profile.name}\nAge: ${age}\nHeight: ${profile.height || 'N/A'} cm\nEducation: ${education}\nCity: ${profile.city}`;
    
    // Open in WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    
    // Fallback to clipboard
    navigator.clipboard.writeText(shareText);
  };

  const handleDownload = async () => {
    if (!profile?.jathakamUrl) {
      showToast('No Jathagam available to download', 'error');
      return;
    }
    
    const fullUrl = getFullUrl(profile.jathakamUrl, 'Jathagam');
    
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

  const handleToggleImportant = async () => {
    if (!userId) return;
    setActionLoading(true);
    try {
      const res = await toggleUserFeaturedAction(userId as any, !isFeatured);
      if (res.success) {
        setIsFeatured(!isFeatured);
        showToast(!isFeatured ? 'Profile marked as important/shortlisted' : 'Profile removed from important list', 'success');
      } else {
        showToast(res.error || 'Failed to update important status', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;
  const isPending = profile?.status === 'PENDING';
  const isApproved = profile?.status === 'APPROVED';

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={onClose} />
      <aside className="fixed top-16 bottom-0 right-0 w-full max-w-3xl bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-slideInRight">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center gap-2 transition-colors text-xs font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Registration Review</h2>
              <p className="text-xs text-slate-500 hidden sm:block">Review all submitted details before deciding.</p>
            </div>
          </div>
          
          {profile && (
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
              <button 
                onClick={handleFindMatches}
                className="p-2 rounded-lg bg-emerald-800/50 hover:bg-emerald-700 transition-colors text-white tooltip-trigger" 
                title="Find Matches (Filter)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
              
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
                disabled={actionLoading}
                className={`p-2 rounded-lg transition-colors text-white tooltip-trigger ${isFeatured ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-800/50 hover:bg-emerald-700'}`} 
                title={isFeatured ? "Remove First Preference Badge" : "Mark as First Preference (Important)"}
              >
                <svg className="w-5 h-5" fill={isFeatured ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          : !userData ? <div className="text-center text-slate-500 mt-10">No data available.</div>
          : <>
            <section className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-4">
                {profile?.photoUrl ? (
                  <img 
                    src={getFullUrl(profile.photoUrl, 'Profile photo')} 
                    alt={profile.name || 'User'} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold uppercase border-2 border-emerald-200">
                    {(profile?.name || userData.email || 'U')[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {profile?.name || 'Unknown name'}
                    {userData.userIndex && (
                      <span className="text-xs text-slate-500 font-semibold bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
                        #{userData.userIndex}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 break-all">{userData.email || 'No email provided'}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] items-end">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">User ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newUserId}
                        onChange={(event) => setNewUserId(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <Button
                        variant="primary"
                        isLoading={actionLoading}
                        onClick={handleUpdateUserId}
                        className="whitespace-nowrap"
                      >
                        Save ID
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-5"><div><span className="block text-slate-500">Phone</span><strong>{userData.mobile_no || 'N/A'}</strong></div><div><span className="block text-slate-500">Account status</span><Badge status={userData.status} /></div><div><span className="block text-slate-500">Profile status</span><Badge status={profile?.status || 'PENDING'} /></div></div>
            </section>

            {profile && <section><h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Submitted Profile Details</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border border-slate-200 rounded-xl p-4">{profileFields.map(([label, fieldValue]) => <div key={label}><span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</span><span className="font-medium text-slate-800 break-words">{fieldValue}</span></div>)}</div></section>}

            {expectationFields.length > 0 && <section><h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Ethirparpu / Partner Expectations</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border border-slate-200 rounded-xl p-4">{expectationFields.map(([label, fieldValue]) => <div key={label}><span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</span><span className="font-medium text-slate-800 break-words">{fieldValue}</span></div>)}</div></section>}
            
            {familyFields.length > 0 && <section><h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Family Details</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border border-slate-200 rounded-xl p-4">{familyFields.map(([label, fieldValue]) => <div key={label}><span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</span><span className="font-medium text-slate-800 break-words">{fieldValue}</span></div>)}</div></section>}

            {documents.length > 0 && <section><h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Documents</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border border-slate-200 rounded-xl p-4">{documents.map(([label, fileUrl]) => <div key={label}><span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</span><button onClick={() => setPreviewDocument({ url: getFullUrl(fileUrl, label), label })} className="text-emerald-600 hover:underline break-words font-medium text-left">View {label}</button></div>)}</div></section>}

            {profile?.rejectedReason && <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm"><strong className="text-rose-800">Previous review reason</strong><p className="mt-1 text-rose-700">{profile.rejectedReason}</p></section>}
            
            {profile && profile.religion?.toLowerCase() === 'hindu' && <section><h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Matching Nakshatras</h4><NakshatraMatches user={{ ...userData, ...profile }} /></section>}
          </>}
        </main>

        {userData && <footer className="p-4 border-t border-slate-200 bg-slate-50">
          {isPending && <div className="space-y-3"><textarea value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} placeholder="Reason for denial (required only when denying)" className="w-full min-h-20 rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /><div className="flex justify-end gap-2"><Button variant="danger" isLoading={actionLoading} onClick={() => handleReview('REJECT')}>Deny with reason</Button><Button variant="primary" isLoading={actionLoading} onClick={() => handleReview('APPROVE')} className="bg-emerald-600 hover:bg-emerald-700 text-white">Approve &amp; make live</Button></div></div>}
          {isApproved && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-600">Match Tracking</span>
                <div className="flex gap-2">
                  <Button variant="primary" isLoading={actionLoading} onClick={() => setMatchTrackingTab('SENT')} className="bg-emerald-600 hover:bg-emerald-700 text-white">Profile Sent</Button>
                  <Button variant="danger" isLoading={actionLoading} onClick={() => setMatchTrackingTab('NOT_MATCHED')}>Sent (Not Matched)</Button>
                </div>
              </div>
              <div className="flex justify-end pt-3 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  isLoading={actionLoading} 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to mark this profile as matched and remove it from active searches?')) {
                      handleReview('MATCHED_REMOVED');
                    }
                  }} 
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-bold px-5"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                >
                  Remove After Match
                </Button>
              </div>
            </div>
          )}
        </footer>}
      </aside>

      {previewDocument && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 sm:p-6" onClick={() => setPreviewDocument(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-full max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">{previewDocument.label}</h3>
              <button onClick={() => setPreviewDocument(null)} className="p-2 rounded-full hover:bg-slate-200 text-slate-500" aria-label="Close">✕</button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center">
              <iframe src={previewDocument.url} className="w-full h-full border-0" title={previewDocument.label} />
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
              <Button variant="secondary" onClick={() => setPreviewDocument(null)}>Close Document</Button>
            </div>
          </div>
        </div>
      )}
      <MatchingProfilesModal 
        isOpen={isMatchesModalOpen} 
        onClose={() => setIsMatchesModalOpen(false)} 
        baseProfile={profile as any} 
      />
      {matchTrackingTab && userId && (
        <MatchTrackingModal
          isOpen={!!matchTrackingTab}
          onClose={() => setMatchTrackingTab(null)}
          targetUserId={String(userId)}
          initialTab={matchTrackingTab}
        />
      )}
    </>
  );
}