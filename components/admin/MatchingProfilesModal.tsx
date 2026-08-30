'use client';

import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { useToast } from './ui/Toast';
import { AdminProfile, ProfileStatus } from '../../types/admin';
import { getProfilesAction } from '../../actions/admin/profile.actions';
import { searchCompatibilityAction } from '../../actions/admin/compatibility.actions';

export interface MatchingProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseProfile: AdminProfile | null;
}

export default function MatchingProfilesModal({ isOpen, onClose, baseProfile }: MatchingProfilesModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 6;

  // Filter state
  const [gender, setGender] = useState<string>('ALL');
  const [minAge, setMinAge] = useState<number | ''>('');
  const [maxAge, setMaxAge] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState(''); // Used for city, name, etc.
  const [nakshatras, setNakshatras] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('APPROVED');
  const [maritalStatus, setMaritalStatus] = useState<string>('ALL');

  // Input text for nakshatras to allow manual entry/removal
  const [nakshatraInput, setNakshatraInput] = useState('');

  useEffect(() => {
    if (isOpen && baseProfile) {
      calculateInitialFilters(baseProfile);
    } else {
      // Reset state on close
      setProfiles([]);
      setTotal(0);
      setPage(1);
    }
  }, [isOpen, baseProfile]);

  const calculateInitialFilters = async (profile: AdminProfile) => {
    setLoading(true);
    try {
      const oppositeGender = profile.gender === 'MALE' ? 'FEMALE' : 'MALE';
      setGender(oppositeGender);

      const age = profile.dateOfBirth ? Math.max(0, new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()) : profile.age || 30;
      let minA = 18;
      let maxA = 50;
      if (profile.gender === 'MALE') {
        minA = Math.max(18, age - 7);
        maxA = age;
      } else {
        minA = age;
        maxA = age + 7;
      }
      setMinAge(minA);
      setMaxAge(maxA);

      const res = await searchCompatibilityAction(profile.nakshatra, profile.gender);
      let matchedNakshatras: string[] = [];
      if (res.success && res.data) {
        matchedNakshatras = res.data
          .filter((m: any) => !m.compatibilityType.toLowerCase().includes('adhamam'))
          .map((m: any) => profile.gender === 'MALE' ? m.femaleNakshatra : m.maleNakshatra);
      }
      setNakshatras(matchedNakshatras);
      setStatus('APPROVED');
      setMaritalStatus('ALL');
      setSearchQuery('');
      setPage(1);

      // Fetch immediately with these calculated values
      fetchMatches(1, oppositeGender, minA, maxA, matchedNakshatras, 'APPROVED', 'ALL', '');
    } catch (err: any) {
      showToast('Error calculating initial matches', 'error');
      setLoading(false);
    }
  };

  const fetchMatches = async (
    targetPage: number,
    tGender: string,
    tMinAge: number | '',
    tMaxAge: number | '',
    tNakshatras: string[],
    tStatus: string,
    tMaritalStatus: string,
    tSearch: string
  ) => {
    setLoading(true);
    try {
      const res = await getProfilesAction(
        targetPage,
        limit,
        tStatus === 'ALL' ? undefined : tStatus,
        tGender === 'ALL' ? undefined : tGender,
        tSearch || undefined,
        tMinAge === '' ? undefined : Number(tMinAge),
        tMaxAge === '' ? undefined : Number(tMaxAge),
        tMaritalStatus === 'ALL' ? undefined : tMaritalStatus,
        tNakshatras.length > 0 ? tNakshatras : undefined
      );

      if (res.success && res.data) {
        setProfiles(res.data.data);
        setTotal(res.data.total);
        setPage(targetPage);
      }
    } catch (error: any) {
      showToast('Failed to fetch matching profiles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchMatches(1, gender, minAge, maxAge, nakshatras, status, maritalStatus, searchQuery);
  };

  const removeNakshatra = (n: string) => {
    setNakshatras(nakshatras.filter((x) => x !== n));
  };

  const addNakshatra = () => {
    if (nakshatraInput.trim() && !nakshatras.includes(nakshatraInput.trim())) {
      setNakshatras([...nakshatras, nakshatraInput.trim()]);
      setNakshatraInput('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Find Matches for ${baseProfile?.name}`}
      subtitle="Refine search filters below to find the best compatible profiles"
      maxWidth="5xl"
    >
      <div className="flex flex-col h-[75vh] space-y-4">
        {/* Filters Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
          <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search (City/Name) */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search (City, Location, Name)</label>
              <input
                type="text"
                placeholder="e.g. Coimbatore, Engineer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Profile Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="APPROVED">Approved Only</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Age Range */}
            <div className="col-span-1 flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Min Age</label>
                <input
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Max Age</label>
                <input
                  type="number"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Marital Status</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">Any Marital Status</option>
                <option value="NEVER_MARRIED">Never Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </select>
            </div>

            {/* Nakshatras Input */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Compatible Nakshatras</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add nakshatra..."
                  value={nakshatraInput}
                  onChange={(e) => setNakshatraInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addNakshatra();
                    }
                  }}
                  className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
                <Button type="button" variant="secondary" onClick={addNakshatra}>Add</Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1">
                {nakshatras.map((n) => (
                  <span key={n} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full">
                    {n}
                    <button type="button" onClick={() => removeNakshatra(n)} className="hover:text-emerald-950">&times;</button>
                  </span>
                ))}
                {nakshatras.length === 0 && <span className="text-[10px] text-slate-400">No nakshatras selected</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="col-span-1 md:col-span-4 flex justify-end">
              <Button type="submit" variant="primary" isLoading={loading}>Apply Filters</Button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="flex-1 bg-slate-50/50 p-4 rounded-xl border border-slate-200 overflow-y-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : profiles.length > 0 ? (
            <>
              <div className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Found {total} Compatible Profiles
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:border-emerald-400 transition-colors">
                    <div className="flex gap-3 items-center">
                      <img 
                        src={p.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'} 
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        alt={p.name}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 truncate" title={p.name}>{p.name}</h4>
                        <div className="text-xs text-slate-500 font-mono">ID: {p.userIndex ? `#${p.userIndex}` : String(p.id).substring(0, 8)}</div>
                      </div>
                      <Badge status={p.status} />
                    </div>
                    
                    <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-y-1 mt-1">
                      <div><span className="text-slate-400">Age:</span> {p.age} Yrs</div>
                      <div className="truncate"><span className="text-slate-400">City:</span> {p.city}</div>
                      <div><span className="text-slate-400">Height:</span> {p.height || 'N/A'}</div>
                      <div className="truncate"><span className="text-slate-400">Star:</span> {p.nakshatra}</div>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <a 
                        href={`/admin/profiles/${p.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        View Profile
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {total > limit && (
                <div className="flex justify-center mt-6 gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => fetchMatches(page - 1, gender, minAge, maxAge, nakshatras, status, maritalStatus, searchQuery)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 flex items-center">
                    Page {page} of {Math.ceil(total / limit)}
                  </span>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => fetchMatches(page + 1, gender, minAge, maxAge, nakshatras, status, maritalStatus, searchQuery)}
                    disabled={page >= Math.ceil(total / limit)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-bold">No compatible profiles found</p>
              <p className="text-xs mt-1">Try broadening your search filters</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
