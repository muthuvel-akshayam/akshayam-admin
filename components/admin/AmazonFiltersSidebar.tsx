import React from 'react';
import { FilterParams } from '@/types/admin';
import { NAKSHATRAS_LIST } from '@/lib/admin/constants';
import { useTranslations, useLocale } from 'next-intl';
import nakshatraNames from '@/data/nakshatra_names.json';

const RASIS = [
  { label: 'மேஷம்', value: 'Mesham' },
  { label: 'ரிஷபம்', value: 'Rishabham' },
  { label: 'மிதுனம்', value: 'Mithunam' },
  { label: 'கடகம்', value: 'Kadagam' },
  { label: 'சிம்மம்', value: 'Simmam' },
  { label: 'கன்னி', value: 'Kanni' },
  { label: 'துலாம்', value: 'Thulam' },
  { label: 'விருச்சிகம்', value: 'Viruchigam' },
  { label: 'தனுசு', value: 'Dhanusu' },
  { label: 'மகரம்', value: 'Magaram' },
  { label: 'கும்பம்', value: 'Kumbam' },
  { label: 'மீனம்', value: 'Meenam' }
];

const DOSHAMS = [
  { label: 'சுத்தம் (No Dosham)', value: 'No Dosham' },
  { label: 'செவ்வாய் (Chevvai)', value: 'Chevvai' },
  { label: 'ராகு கேது (Rahu Ketu)', value: 'Rahu Ketu' },
  { label: 'ராகு கேது செவ்வாய் (Rahu Ketu Chevvai)', value: 'Rahu Ketu Chevvai' }
];

const PROPERTY_VALUES = [
  { label: '1 கோடிக்கும் கீழ்', value: 'Below 1 Cr' },
  { label: '5 கோடிக்கும் கீழ்', value: 'Below 5 Cr' },
  { label: '10 கோடிக்கும் கீழ்', value: 'Below 10 Cr' },
  { label: '15 கோடிக்கும் கீழ்', value: 'Below 15 Cr' },
  { label: '20 கோடிக்கும் கீழ்', value: 'Below 20 Cr' },
  { label: '25 கோடிக்கும் கீழ்', value: 'Below 25 Cr' },
  { label: '30 கோடிக்கும் கீழ்', value: 'Below 30 Cr' },
  { label: '35 கோடிக்கும் கீழ்', value: 'Below 35 Cr' },
  { label: '40 கோடிக்கும் கீழ்', value: 'Below 40 Cr' },
  { label: '45 கோடிக்கும் கீழ்', value: 'Below 45 Cr' },
  { label: '50 கோடிக்கும் கீழ்', value: 'Below 50 Cr' },
  { label: '55 கோடிக்கும் கீழ்', value: 'Below 55 Cr' },
  { label: '60 கோடிக்கும் கீழ்', value: 'Below 60 Cr' },
  { label: '65 கோடிக்கும் கீழ்', value: 'Below 65 Cr' },
  { label: '70 கோடிக்கும் கீழ்', value: 'Below 70 Cr' },
  { label: '75 கோடிக்கும் கீழ்', value: 'Below 75 Cr' },
  { label: '80 கோடிக்கும் கீழ்', value: 'Below 80 Cr' },
  { label: '85 கோடிக்கும் கீழ்', value: 'Below 85 Cr' },
  { label: '90 கோடிக்கும் கீழ்', value: 'Below 90 Cr' },
  { label: '95 கோடிக்கும் கீழ்', value: 'Below 95 Cr' },
  { label: '100 கோடிக்கும் கீழ்', value: 'Below 100 Cr' },
  { label: '100+ கோடி', value: '100+ Cr' },
  { label: '150+ கோடி', value: '150+ Cr' },
  { label: '200+ கோடி', value: '200+ Cr' },
  { label: '250+ கோடி', value: '250+ Cr' },
  { label: '300+ கோடி', value: '300+ Cr' }
];

const COLOURS = [
  { label: 'சிகப்பு', value: 'Fair / சிகப்பு' },
  { label: 'மாநிறம்', value: 'Wheatish / மாநிறம்' },
  { label: 'கருமை', value: 'Dark / கருமை' }
];

const WORK_LOCATIONS = [
  { label: 'சென்னை', value: 'Chennai' },
  { label: 'கோயம்புத்தூர்', value: 'Coimbatore' },
  { label: 'பெங்களூர்', value: 'Bangalore' },
  { label: 'மற்ற மாநிலங்கள்', value: 'Other States' },
  { label: 'வெளிநாடு', value: 'Abroad / Other Countries' }
];

const PROFESSIONS = [
  { label: 'ஐடி / மென்பொருள்', value: 'IT / Software' },
  { label: 'மருத்துவர் / மருத்துவம்', value: 'Doctor / Medical' },
  { label: 'ஆடை / ஜவுளி', value: 'Garments / Textile' },
  { label: 'விவசாயம்', value: 'Farmers / Agriculture' },
  { label: 'வியாபாரம்', value: 'Business' }
];

export interface AmazonFiltersSidebarProps {
  filters: Partial<FilterParams>;
  onChange: (filters: Partial<FilterParams>) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AmazonFiltersSidebar: React.FC<AmazonFiltersSidebarProps> = ({ filters, onChange, isMobileOpen, onCloseMobile }) => {
  const t = useTranslations('FiltersSidebar');
  const locale = useLocale();

  const getTranslatedStar = (key: string) => {
    const star = (nakshatraNames as Record<string, {en: string, ta: string}>)[key];
    if (!star) return key;
    return locale === 'en' ? star.en : star.ta;
  };

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
          <h3 className="font-bold text-sm text-slate-900">{'வடிகட்டிகள்'}</h3>
          <div className="flex items-center gap-2">
            <button onClick={clearFilters} className="text-xs whitespace-nowrap text-emerald-600 hover:text-emerald-800 hover:underline font-semibold">
              {'அனைத்தையும் நீக்கு'}
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
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">{'வயது வரம்பு'}</h4>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder={'குறைந்த'} 
              value={filters.minAge || ''}
              onChange={e => updateFilter('minAge', e.target.value ? Number(e.target.value) : undefined)}
              className="flex-1 min-w-0 px-2 py-1.5 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-slate-400 text-xs shrink-0">{'முதல்'}</span>
            <input 
              type="number" 
              placeholder={'அதிக'} 
              value={filters.maxAge || ''}
              onChange={e => updateFilter('maxAge', e.target.value ? Number(e.target.value) : undefined)}
              className="flex-1 min-w-0 px-2 py-1.5 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">{'திருமண நிலை'}</h4>
          <div className="space-y-1.5">
            {[
              { val: 'ALL', label: 'அனைத்தும்' },
              { val: 'NEVER_MARRIED', label: 'முதல் மணம்' },
              { val: 'DIVORCED', label: 'மறுமணம்' },
              { val: 'WIDOWED', label: 'விதவை' }
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
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">{'ஜாதகம் / தோஷம்'}</h4>
          <select 
            value={filters.dosham || ''} 
            onChange={e => updateFilter('dosham', e.target.value)} 
            className="w-full text-[13px] p-1.5 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none bg-white"
          >
            <option value="">{'எந்த தோஷமும்'}</option>
            {DOSHAMS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        <div>
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">{'நட்சத்திரம்'}</h4>
          <select 
            value={filters.nakshatras?.[0] || ''} 
            onChange={e => updateFilter('nakshatras', e.target.value ? [e.target.value] : [])} 
            className="w-full text-[13px] p-1.5 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none bg-white"
          >
            <option value="">{'எந்த நட்சத்திரமும்'}</option>
            {NAKSHATRAS_LIST.map(n => <option key={n} value={n}>{getTranslatedStar(n)}</option>)}
          </select>
        </div>

        <div>
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">{'ராசி'}</h4>
          <select 
            value={filters.rasi || ''} 
            onChange={e => updateFilter('rasi', e.target.value)} 
            className="w-full text-[13px] p-1.5 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none bg-white"
          >
            <option value="">{'எந்த ராசியும்'}</option>
            {RASIS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">{'பொருளாதாரம் & சொத்துக்கள்'}</h4>
          
          <div className="mb-4">
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">{'சொத்து மதிப்பு'}</h5>
            <select 
              value={filters.propertyValue || ''} 
              onChange={e => updateFilter('propertyValue', e.target.value)} 
              className="w-full text-[13px] p-1.5 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="">{'எந்த மதிப்பும்'}</option>
              {PROPERTY_VALUES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div>
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">{'வழங்கும் நகை (பவுன்)'}</h5>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder={'குறைந்த'} 
                value={filters.minPavan || ''}
                onChange={e => updateFilter('minPavan', e.target.value ? Number(e.target.value) : undefined)}
                className="w-16 px-2 py-1 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-slate-400 text-[12px]">{'முதல்'}</span>
              <input 
                type="number" 
                placeholder={'அதிக'} 
                value={filters.maxPavan || ''}
                onChange={e => updateFilter('maxPavan', e.target.value ? Number(e.target.value) : undefined)}
                className="w-16 px-2 py-1 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">{'தோற்றம்'}</h4>
          
          <div className="mb-4">
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">{'நிறம்'}</h5>
            <div className="space-y-1.5">
              {COLOURS.map(c => {
                const colorValue = c.value.split(' / ')[0];
                return (
                  <label key={colorValue} className="flex items-start gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.skinColour === colorValue}
                      onChange={() => updateFilter('skinColour', filters.skinColour === colorValue ? undefined : colorValue)}
                      className="mt-0.5 w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-[13px] text-slate-700 group-hover:text-emerald-700">{c.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">{'உயரம் (செ.மீ)'}</h5>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder={'குறைந்த'} 
                value={filters.minHeight || ''}
                onChange={e => updateFilter('minHeight', e.target.value ? Number(e.target.value) : undefined)}
                className="w-16 px-2 py-1 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-slate-400 text-[12px]">{'முதல்'}</span>
              <input 
                type="number" 
                placeholder={'அதிக'} 
                value={filters.maxHeight || ''}
                onChange={e => updateFilter('maxHeight', e.target.value ? Number(e.target.value) : undefined)}
                className="w-16 px-2 py-1 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-[13px] text-slate-800 mb-2">{'இடம் & வேலை'}</h4>
          
          <div className="mb-4">
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">{'வேலை செய்யும் இடம்'}</h5>
            <div className="space-y-1.5">
              {WORK_LOCATIONS.map(wl => (
                <label key={wl.value} className="flex items-start gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={(filters.workLocations || []).includes(wl.value)}
                    onChange={() => handleArrayToggle('workLocations', wl.value)}
                    className="mt-0.5 w-3.5 h-3.5 text-emerald-600 border-slate-300 focus:ring-emerald-500 rounded cursor-pointer"
                  />
                  <span className="text-[13px] text-slate-700 group-hover:text-emerald-700">{wl.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">{'தொழில்'}</h5>
            <div className="space-y-1.5">
              {PROFESSIONS.map(pf => (
                <label key={pf.value} className="flex items-start gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={(filters.preferredProfessions || []).includes(pf.value)}
                    onChange={() => handleArrayToggle('preferredProfessions', pf.value)}
                    className="mt-0.5 w-3.5 h-3.5 text-emerald-600 border-slate-300 focus:ring-emerald-500 rounded cursor-pointer"
                  />
                  <span className="text-[13px] text-slate-700 group-hover:text-emerald-700">{pf.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-[12px] font-semibold text-slate-600 mb-1">{'விருப்பமான நகரங்கள்'}</h5>
            <input 
              type="text" 
              placeholder={'உ.ம். சென்னை, ஈரோடு...'} 
              value={(filters.preferredCities || []).join(', ')}
              onChange={e => updateFilter('preferredCities', e.target.value ? e.target.value.split(',').map(s=>s.trim()) : undefined)}
              className="w-full px-2 py-1.5 text-[13px] border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

      </div>
      
      {/* Mobile Sticky Apply Button */}
      <div className="lg:hidden sticky -bottom-4 -mx-4 px-4 py-4 mt-8 bg-white border-t border-slate-200 z-10">
        <button 
          onClick={onCloseMobile}
          className="w-full bg-emerald-600 text-white text-[13px] font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          {'வடிகட்டிகளை பயன்படுத்து'}
        </button>
      </div>

    </div>
    </>
  );
};
export default AmazonFiltersSidebar;
