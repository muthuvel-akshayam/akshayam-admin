'use client';

// ==========================================
// CLIENT WRAPPER FOR COMPATIBILITY MATRIX
// ==========================================

import React, { useState } from 'react';
import CompatibilityMatrix from '@/components/admin/CompatibilityMatrix';
import ExcelImportModal from '@/components/admin/ExcelImportModal';
import { CompatibilityMatrixRow } from '@/types/admin';
import { getCompatibilityMatrixAction } from '@/actions/admin/compatibility.actions';

export interface CompatibilityPageClientProps {
  initialRows: CompatibilityMatrixRow[];
  initialTotal: number;
}

export const CompatibilityPageClient: React.FC<CompatibilityPageClientProps> = ({
  initialRows,
  initialTotal,
}) => {
  const [rows, setRows] = useState<CompatibilityMatrixRow[]>(initialRows);
  const [total, setTotal] = useState<number>(initialTotal);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const itemsPerPage = 15;

  const fetchMatrix = async (page: number, query?: string, gender?: string) => {
    try {
      const res = await getCompatibilityMatrixAction(
        page,
        itemsPerPage,
        query || undefined,
        gender === 'ALL' ? undefined : (gender as any)
      );
      if (res.success && res.data) {
        setRows(res.data.data || []);
        setTotal(res.data.total || 0);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch compatibility matrix:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchMatrix(newPage);
  };

  const handleSearch = (query: string, gender: string) => {
    fetchMatrix(1, query, gender);
  };

  const refreshMatrix = () => {
    fetchMatrix(currentPage);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 ">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900  tracking-tight">
            Nakshatra Compatibility Matrix
          </h1>
          <p className="text-sm text-slate-500  mt-1">
            Import, audit, and calculate uthamam / madhyamam astrological matching rules between male and female birth stars.
          </p>
        </div>
      </div>

      {/* Main Compatibility Matrix View */}
      <CompatibilityMatrix
        initialRows={rows}
        total={total}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onOpenImportModal={() => setImportModalOpen(true)}
        onSearch={handleSearch}
      />

      {/* Excel Spreadsheet Upload Modal */}
      <ExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          setImportModalOpen(false);
          refreshMatrix();
        }}
      />
    </div>
  );
};

export default CompatibilityPageClient;
