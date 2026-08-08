'use client';

// ==========================================
// COMPATIBILITY MATRIX COMPONENT
// ==========================================

import React, { useState } from 'react';
import Button from './ui/Button';
import Pagination from './ui/Pagination';
import { CompatibilityMatrixRow } from '../../types/admin';
import { searchCompatibilityAction } from '../../actions/admin/compatibility.actions';
import { useToast } from './ui/Toast';
import { useTranslations, useLocale } from 'next-intl';
import nakshatraNames from '../../data/nakshatra_names.json';

export interface CompatibilityMatrixProps {
  initialRows: CompatibilityMatrixRow[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onOpenImportModal: () => void;
  onSearch?: (query: string, gender: 'MALE' | 'FEMALE' | 'ALL') => void;
}

export const CompatibilityMatrix: React.FC<CompatibilityMatrixProps> = ({
  initialRows,
  total,
  currentPage,
  itemsPerPage,
  onPageChange,
  onOpenImportModal,
  onSearch,
}) => {
  const { showToast } = useToast();
  const t = useTranslations('Nakshatra');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'MALE' | 'FEMALE' | 'ALL'>('ALL');
  
  const nakshatraEntries = Object.entries(nakshatraNames);
  const [matcherStar, setMatcherStar] = useState<string>(nakshatraEntries[0]?.[0] || '');
  const [matcherGender, setMatcherGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [matchingResults, setMatchingResults] = useState<CompatibilityMatrixRow[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const getTranslatedStar = (key: string) => {
    const star = (nakshatraNames as Record<string, {en: string, ta: string}>)[key];
    if (!star) return key;
    return locale === 'en' ? star.en : star.ta;
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, genderFilter);
    }
  };

  const handlePartnerSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await searchCompatibilityAction(matcherStar, matcherGender);
      if (res.success && res.data) {
        setMatchingResults(res.data);
        showToast(`Found ${res.data.length} compatibility rules`, 'success');
      } else {
        showToast(res.error || 'Partner search failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error searching matching nakshatras', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const renderScoreBadge = (score: number, type: string) => {
    const isUthamam = type.toLowerCase().includes('uthamam') || score >= 8;
    const isMadhyamam = type.toLowerCase().includes('madhyamam') || (score >= 6 && score < 8);
    
    if (isUthamam) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800   text-xs font-bold border border-emerald-300 ">
          {t('scoreUthamam', { score })}
        </span>
      );
    }
    if (isMadhyamam) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800   text-xs font-bold border border-amber-300 ">
          {t('scoreMadhyamam', { score })}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800   text-xs font-bold border border-rose-300 ">
        {t('scoreAdhamam', { score })}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Astrological Partner Matching Finder Engine */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <span className="text-[10px] uppercase font-bold bg-emerald-700/80 text-emerald-200 px-2.5 py-1 rounded-full border border-emerald-500">
            {t('engineTitle')}
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold mt-3 text-white">
            {t('displayMatchingTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 mb-6">
            {t('displayMatchingDesc')}
          </p>

          <form onSubmit={handlePartnerSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/10  p-3 rounded-2xl backdrop-blur-md border border-white/15">
            <div>
              <label className="block text-[10px] font-bold text-emerald-200 uppercase mb-1">{t('searcherGender')}</label>
              <select
                value={matcherGender}
                onChange={(e) => setMatcherGender(e.target.value as any)}
                className="w-full bg-white  text-slate-900  px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="MALE">{t('maleNakshatra')}</option>
                <option value="FEMALE">{t('femaleNakshatra')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-200 uppercase mb-1">{t('selectBirthStar')}</label>
              <select
                value={matcherStar}
                onChange={(e) => setMatcherStar(e.target.value)}
                className="w-full bg-white  text-slate-900  px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {nakshatraEntries.map(([key]) => (
                  <option key={key} value={key}>{getTranslatedStar(key)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                variant="success"
                className="w-full h-[38px] shadow-lg font-bold"
                isLoading={isSearching}
              >
                {t('findCompatibleStars')}
              </Button>
            </div>
          </form>

          {/* Matching Results Drawer */}
          {matchingResults && (
            <div className="mt-6 p-4 rounded-xl bg-white  text-slate-800  shadow-xl animate-fadeIn border border-emerald-500/30">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 ">
                <span className="font-bold text-xs text-slate-900 ">
                  {t('compatibleMatchesFor')} {getTranslatedStar(matcherStar)} ({matcherGender === 'MALE' ? t('maleNakshatra') : t('femaleNakshatra')})
                </span>
                <button
                  onClick={() => setMatchingResults(null)}
                  className="text-[11px] text-slate-400 hover:text-slate-600  font-semibold"
                >
                  {t('closeResults')}
                </button>
              </div>

              {matchingResults.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">{t('noMatchingRules')}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {matchingResults.map((match) => {
                    const partnerStarKey = matcherGender === 'MALE' ? match.femaleNakshatra : match.maleNakshatra;
                    return (
                      <div
                        key={match.id}
                        className="p-2.5 rounded-xl bg-slate-50  border border-slate-200  flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-900 ">{getTranslatedStar(partnerStarKey)}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{match.notes || t('astrologicalPairing')}</p>
                        </div>
                        {renderScoreBadge(match.compatibilityScore, match.compatibilityType)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Compatibility Matrix Table */}
      <div className="bg-white  rounded-2xl border border-slate-200  shadow-sm overflow-hidden flex flex-col">
        {/* Table Header & Toolbar */}
        <div className="p-5 border-b border-slate-200  bg-slate-50/50  flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form onSubmit={handleFilterSubmit} className="flex-1 flex items-center gap-3 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white  text-slate-800  pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200  focus:border-emerald-600 focus:outline-none"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Button type="submit" variant="secondary" size="sm">
              {t('filter')}
            </Button>
          </form>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <select
              value={genderFilter}
              onChange={(e) => {
                const val = e.target.value as any;
                setGenderFilter(val);
                if (onSearch) onSearch(searchQuery, val);
              }}
              className="bg-white  text-slate-700  px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200  focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">{t('allColumns')}</option>
              <option value="MALE">{t('maleNakshatraOnly')}</option>
              <option value="FEMALE">{t('femaleNakshatraOnly')}</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={onOpenImportModal}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              }
            >
              {t('importExcel')}
            </Button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50  text-slate-500  uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 ">
              <tr>
                <th className="px-6 py-3.5">{t('tableHeaderMale')}</th>
                <th className="px-6 py-3.5">{t('tableHeaderFemale')}</th>
                <th className="px-6 py-3.5">{t('tableHeaderScore')}</th>
                <th className="px-6 py-3.5">{t('tableHeaderRemarks')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {initialRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    {t('noRecords')}
                  </td>
                </tr>
              ) : (
                initialRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70  transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap font-bold text-slate-900 ">
                      {getTranslatedStar(row.maleNakshatra)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-bold text-slate-900 ">
                      {getTranslatedStar(row.femaleNakshatra)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {renderScoreBadge(row.compatibilityScore, row.compatibilityType)}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600  max-w-md truncate" title={row.notes}>
                      {row.notes || t('standardRules')}
                    </td>
                  </tr>
                ))
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
      </div>
    </div>
  );
};

export default CompatibilityMatrix;

