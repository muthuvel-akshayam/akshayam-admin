'use client';

import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { FilterParams } from '../../types/admin';
import { NAKSHATRAS_LIST } from '../../lib/admin/constants';

// Fixed Lists for Filters
const RASIS = [
  'Mesham (Aries)', 'Rishabham (Taurus)', 'Mithunam (Gemini)', 'Kadagam (Cancer)',
  'Simmam (Leo)', 'Kanni (Virgo)', 'Thulam (Libra)', 'Viruchigam (Scorpio)',
  'Dhanusu (Sagittarius)', 'Magaram (Capricorn)', 'Kumbam (Aquarius)', 'Meenam (Pisces)'
];

const DOSHAMS = [
  { label: 'சுத்தம் (No Dosham)', value: 'No Dosham' },
  { label: 'செவ்வாய் (Chevvai)', value: 'Chevvai' },
  { label: 'ராகு கேது (Rahu Ketu)', value: 'Rahu Ketu' },
  { label: 'ராகு கேது செவ்வாய் (Rahu Ketu Chevvai)', value: 'Rahu Ketu Chevvai' }
];

const PROPERTY_VALUES = [
  'Below 1 Cr', 'Below 5 Cr', 'Below 10 Cr', 'Below 15 Cr', 'Below 20 Cr', 'Below 25 Cr',
  'Below 30 Cr', 'Below 35 Cr', 'Below 40 Cr', 'Below 45 Cr', 'Below 50 Cr', 'Below 55 Cr',
  'Below 60 Cr', 'Below 65 Cr', 'Below 70 Cr', 'Below 75 Cr', 'Below 80 Cr', 'Below 85 Cr',
  'Below 90 Cr', 'Below 95 Cr', 'Below 100 Cr',
  '100+ Cr', '150+ Cr', '200+ Cr', '250+ Cr', '300+ Cr'
];

const COLOURS = [
  'Fair / சிகப்பு', 'Wheatish / மாநிறம்', 'Dark / கருமை'
];

const WORK_LOCATIONS = [
  'Chennai', 'Coimbatore', 'Bangalore', 'Other States', 'Abroad / Other Countries'
];

const PROFESSIONS = [
  'IT / Software', 'Doctor / Medical', 'Garments / Textile', 'Farmers / Agriculture', 'Business'
];

export interface ProfilesFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: Partial<FilterParams>;
  onApplyFilters: (filters: Partial<FilterParams>) => void;
}

export const ProfilesFilterDrawer: React.FC<ProfilesFilterDrawerProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onApplyFilters,
}) => {
  const [filters, setFilters] = useState<Partial<FilterParams>>(currentFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const updateFilter = (key: keyof FilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayToggle = (key: keyof FilterParams, value: string) => {
    const arr = (filters[key] as string[]) || [];
    if (arr.includes(value)) {
      updateFilter(key, arr.filter(v => v !== value));
    } else {
      updateFilter(key, [...arr, value]);
    }
  };

  const apply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const reset = () => {
    const emptyFilters: Partial<FilterParams> = {
      status: filters.status,
      gender: filters.gender,
      query: filters.query,
    };
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-extrabold text-slate-800">Advanced Filters</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          
          {/* 1. Personal & Astro */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider border-b border-emerald-100 pb-2">Personal & Astro</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Min Age</label>
                <input type="number" min="18" value={filters.minAge || ''} onChange={e => updateFilter('minAge', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-500 focus:outline-none" placeholder="18" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Max Age</label>
                <input type="number" min="18" value={filters.maxAge || ''} onChange={e => updateFilter('maxAge', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-500 focus:outline-none" placeholder="40" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Min Height (cm)</label>
                <input type="number" value={filters.minHeight || ''} onChange={e => updateFilter('minHeight', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-500 focus:outline-none" placeholder="150" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Max Height (cm)</label>
                <input type="number" value={filters.maxHeight || ''} onChange={e => updateFilter('maxHeight', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-500 focus:outline-none" placeholder="190" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Marital Status</label>
              <select value={filters.maritalStatus || 'ALL'} onChange={e => updateFilter('maritalStatus', e.target.value)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-500 focus:outline-none">
                <option value="ALL">Any Status</option>
                <option value="NEVER_MARRIED">Unmarried / முதல் மணம்</option>
                <option value="DIVORCED">Divorced / மறுமணம்</option>
                <option value="WIDOWED">Widowed / விதவை</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Colour</label>
              <select value={filters.skinColour || ''} onChange={e => updateFilter('skinColour', e.target.value)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-500 focus:outline-none">
                <option value="">Any Colour</option>
                {COLOURS.map(c => <option key={c} value={c.split(' / ')[0]}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Rasi</label>
              <select value={filters.rasi || ''} onChange={e => updateFilter('rasi', e.target.value)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-500 focus:outline-none">
                <option value="">Any Rasi</option>
                {RASIS.map(r => <option key={r} value={r.split(' ')[0]}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nakshatra</label>
              <select value={filters.nakshatras?.[0] || ''} onChange={e => updateFilter('nakshatras', e.target.value ? [e.target.value] : [])} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-500 focus:outline-none">
                <option value="">Any Nakshatra</option>
                {NAKSHATRAS_LIST.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Jathakam / Dosham</label>
              <select value={filters.dosham || ''} onChange={e => updateFilter('dosham', e.target.value)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-emerald-500 focus:outline-none">
                <option value="">Any Dosham</option>
                {DOSHAMS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </section>

          {/* 2. Financial & Assets */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider border-b border-amber-100 pb-2">Financial & Assets</h3>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Property Value</label>
              <select value={filters.propertyValue || ''} onChange={e => updateFilter('propertyValue', e.target.value)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-amber-500 focus:outline-none">
                <option value="">Any Property Value</option>
                {PROPERTY_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Min Gold (Pavan)</label>
                <input type="number" value={filters.minPavan || ''} onChange={e => updateFilter('minPavan', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-amber-500 focus:outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Max Gold (Pavan)</label>
                <input type="number" value={filters.maxPavan || ''} onChange={e => updateFilter('maxPavan', e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-amber-500 focus:outline-none" placeholder="100" />
              </div>
            </div>
          </section>

          {/* 3. Location & Career */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider border-b border-blue-100 pb-2">Location & Career</h3>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Place of Working</label>
              <div className="flex flex-wrap gap-2">
                {WORK_LOCATIONS.map(loc => {
                  const val = loc.split(' / ')[0];
                  const isActive = filters.workLocations?.includes(val);
                  return (
                    <button
                      key={loc}
                      onClick={() => handleArrayToggle('workLocations', val)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${isActive ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Preferred Cities (Expected by Candidate)</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Chennai, Madurai (comma separated)" 
                  value={filters.preferredCities?.join(', ') || ''}
                  onChange={(e) => {
                    const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    updateFilter('preferredCities', vals.length > 0 ? vals : undefined);
                  }}
                  className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:border-blue-500 focus:outline-none" 
                />
                <p className="text-[10px] text-slate-400">Max 3 cities supported. Leave empty for any.</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Preferred Profession</label>
              <div className="flex flex-wrap gap-2">
                {PROFESSIONS.map(prof => {
                  const val = prof.split(' / ')[0];
                  const isActive = filters.preferredProfessions?.includes(val);
                  return (
                    <button
                      key={prof}
                      onClick={() => handleArrayToggle('preferredProfessions', val)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${isActive ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex gap-3 z-10">
          <Button variant="secondary" onClick={reset} className="flex-1">Clear Filters</Button>
          <Button variant="primary" onClick={apply} className="flex-1">Apply Filters</Button>
        </div>
      </div>
    </>
  );
};

export default ProfilesFilterDrawer;
