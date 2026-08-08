'use client';

// ==========================================
// PAGINATION PRIMITIVE
// ==========================================

import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1 && totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white  border-t border-slate-200  text-sm ${className}`}>
      <div className="text-slate-500 ">
        Showing <span className="font-semibold text-slate-800 ">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-800 ">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-800 ">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg border border-slate-200  hover:bg-slate-50  disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 "
          title="Previous Page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {getPageNumbers().map((page, idx) =>
          typeof page === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                currentPage === page
                  ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                  : 'hover:bg-slate-100  text-slate-700 '
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="px-2 text-slate-400">
              {page}
            </span>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg border border-slate-200  hover:bg-slate-50  disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 "
          title="Next Page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
