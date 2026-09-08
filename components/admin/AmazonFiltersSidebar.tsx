import React from 'react';
import { FilterParams } from '@/types/admin';
import { NAKSHATRAS_LIST } from '@/lib/admin/constants';

const RASIS = [
  'Mesham (Aries)', 'Rishabham (Taurus)', 'Mithunam (Gemini)', 'Kadagam (Cancer)',
  'Simmam (Leo)', 'Kanni (Virgo)', 'Thulam (Libra)', 'Viruchigam (Scorpio)',
  'Dhanusu (Sagittarius)', 'Magaram (Capricorn)', 'Kumbam (Aquarius)', 'Meenam (Pisces)'
];

const DOSHAMS = [
  { label: 'சுத்தம் (No Dosham)', value: 'No Dosham' },
  { label: 'செவ்வாய் (Chevvai)', value: 'Chevvai' },
  { label: 'ராகு கேது (Rahu Ketu)', value: 'Rahu Ketu' },
  { label: 'ராகு கேது செவ்வாய் (Rahu Ketu Chevvai)', value: 'Rahu Ketu Chevvai' },
  { label: 'Sarpa', value: 'Sarpa' },
  { label: 'Kala Sarpa', value: 'Kala Sarpa' },
  { label: 'Kalathra', value: 'Kalathra' }
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

export interface AmazonFiltersSidebarProps {
  filters: Partial<FilterParams>;
  onChange: (filters: Partial<FilterParams>) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AmazonFiltersSidebar: React.FC<AmazonFiltersSidebarProps> = ({ filters, onChange, isMobileOpen, onCloseMobile }) => {
  const updateFilter = (key: keyof FilterParams, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const handleArrayToggle = (key: keyof FilterParams, value: string) => {
    const arr = (filters[key] as string[]) || [];
    if (arr.includes(value)) {
      updateFilter(key, arr.filter(v => v !== value));
    } else {
      updateFilter(key, [...arr, value]);
    }
  };

  const clearFilters = () => {
    onChange({
      status: filters.status,
      gender: filters.gender,
      query: filters.query,
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl p-4 overflow-y-auto transform transition-transform duration-300
        lg:static lg:w-60 lg:shadow-none lg:p-0 lg:overflow-visible lg:transform-none lg:z-auto lg:shrink-0 lg:pr-6
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-4 lg:mb-4 pb-4 border-b border-slate-100 lg:border-none lg:pb-0">
          <h3 className="font-bold text-sm text-slate-900">Filters</h3>
          <div className="flex items-center gap-3">
            <button onClick={clearFilters} className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline font-semibold">
              Clear all
            </button>
            {/* Mobile Close Button */}
            <button onClick={onCloseMobile} className="lg:hidden p-1 text-slate-500 hover:text-slate-700 bg-slate-100 rounded-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

      <div className="space-y-6">
        
        {/* Personal & Astro */}
        <div>
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">Age Range</h4>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              value={filters.minAge || ''}
              onChange={e => updateFilter('minAge', e.target.value ? Number(e.target.value) : undefined)}
              className="w-16 px-2 py-1 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={filters.maxAge || ''}
              onChange={e => updateFilter('maxAge', e.target.value ? Number(e.target.value) : undefined)}
              className="w-16 px-2 py-1 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">Marital Status</h4>
          <div className="space-y-1.5">
            {[
              { val: 'ALL', label: 'Any Status' },
              { val: 'NEVER_MARRIED', label: 'Unmarried / முதல் மணம்' },
              { val: 'DIVORCED', label: 'Divorced / மறுமணம்' },
              { val: 'WIDOWED', label: 'Widowed / விதவை' }
            ].map(ms => (
              <label key={ms.val} className="flex items-start gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="maritalStatus"
                  value={ms.val}
                  checked={(filters.maritalStatus || 'ALL') === ms.val}
                  onChange={() => updateFilter('maritalStatus', ms.val)}
                  className="mt-0.5 w-3.5 h-3.5 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-[13px] text-slate-700 group-hover:text-emerald-700">{ms.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">Jathakam / Dosham</h4>
          <select 
            value={filters.dosham || ''} 
            onChange={e => updateFilter('dosham', e.target.value)} 
            className="w-full text-[13px] p-1.5 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none bg-white"
          >
            <option value="">Any Dosham</option>
            {DOSHAMS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        <div>
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">Nakshatra</h4>
          <select 
            value={filters.nakshatras?.[0] || ''} 
            onChange={e => updateFilter('nakshatras', e.target.value ? [e.target.value] : [])} 
            className="w-full text-[13px] p-1.5 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none bg-white"
          >
            <option value="">Any Nakshatra</option>
            {NAKSHATRAS_LIST.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div>
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">Rasi</h4>
          <select 
            value={filters.rasi || ''} 
            onChange={e => updateFilter('rasi', e.target.value)} 
            className="w-full text-[13px] p-1.5 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none bg-white"
          >
            <option value="">Any Rasi</option>
            {RASIS.map(r => <option key={r} value={r.split(' ')[0]}>{r}</option>)}
          </select>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">Financial & Assets</h4>
          
          <div className="mb-4">
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">Property Value</h5>
            <select 
              value={filters.propertyValue || ''} 
              onChange={e => updateFilter('propertyValue', e.target.value)} 
              className="w-full text-[13px] p-1.5 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="">Any Value</option>
              {PROPERTY_VALUES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">Gold Offered (Pavan)</h5>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.minPavan || ''}
                onChange={e => updateFilter('minPavan', e.target.value ? Number(e.target.value) : undefined)}
                className="w-16 px-2 py-1 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-slate-400 text-[12px]">to</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.maxPavan || ''}
                onChange={e => updateFilter('maxPavan', e.target.value ? Number(e.target.value) : undefined)}
                className="w-16 px-2 py-1 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">Appearance</h4>
          
          <div className="mb-4">
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">Colour</h5>
            <div className="space-y-1.5">
              {COLOURS.map(c => {
                const colorValue = c.split(' / ')[0];
                return (
                  <label key={colorValue} className="flex items-start gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.skinColour === colorValue}
                      onChange={() => updateFilter('skinColour', filters.skinColour === colorValue ? undefined : colorValue)}
                      className="mt-0.5 w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-[13px] text-slate-700 group-hover:text-emerald-700">{c}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">Height (cm)</h5>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.minHeight || ''}
                onChange={e => updateFilter('minHeight', e.target.value ? Number(e.target.value) : undefined)}
                className="w-16 px-2 py-1 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-slate-400 text-[12px]">to</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.maxHeight || ''}
                onChange={e => updateFilter('maxHeight', e.target.value ? Number(e.target.value) : undefined)}
                className="w-16 px-2 py-1 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">Location & Career</h4>
          
          <div className="mb-4">
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">Work Location</h5>
            <div className="space-y-1.5">
              {WORK_LOCATIONS.map(wl => (
                <label key={wl} className="flex items-start gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={(filters.workLocations || []).includes(wl)}
                    onChange={() => handleArrayToggle('workLocations', wl)}
                    className="mt-0.5 w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-[13px] text-slate-700 group-hover:text-emerald-700">{wl}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">Profession</h5>
            <div className="space-y-1.5">
              {PROFESSIONS.map(pf => (
                <label key={pf} className="flex items-start gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={(filters.preferredProfessions || []).includes(pf)}
                    onChange={() => handleArrayToggle('preferredProfessions', pf)}
                    className="mt-0.5 w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-[13px] text-slate-700 group-hover:text-emerald-700">{pf}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">Preferred Cities</h5>
            <input 
              type="text" 
              placeholder="e.g. Chennai, Erode..." 
              value={(filters.preferredCities || []).join(', ')}
              onChange={e => updateFilter('preferredCities', e.target.value ? e.target.value.split(',').map(s=>s.trim()) : undefined)}
              className="w-full px-2 py-1.5 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

      </div>
    </div>
    </>
  );
};
export default AmazonFiltersSidebar;
