'use client';

// ==========================================
// EXCEL / CSV IMPORT MODAL
// ==========================================

import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { importCompatibilityExcelAction } from '../../actions/admin/compatibility.actions';

export interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      showToast('Please upload a valid Excel (.xlsx, .xls) or CSV spreadsheet.', 'warning');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a spreadsheet file first.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await importCompatibilityExcelAction(formData);
      if (res.success) {
        showToast(res.message || `Successfully imported ${res.importedCount} compatibility records!`, 'success');
        if (onSuccess) onSuccess();
        onClose();
        setFile(null);
      } else {
        showToast(res.error || 'Import failed. Check column headers.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error parsing Excel file', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      title="Import Compatibility Spreadsheet"
      subtitle="Upload Male / Female Nakshatra matching tables (Excel or CSV)"
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} disabled={!file}>
            Start Excel Import
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <div className="p-3 rounded-xl bg-slate-50  border border-slate-200  text-slate-600  text-xs">
          <p className="font-bold text-slate-800  mb-1">Expected Spreadsheet Column Headers:</p>
          <p className="font-mono text-[11px] bg-slate-200  p-2 rounded mb-2 overflow-x-auto">
            MaleNakshatra | FemaleNakshatra | Score | CompatibilityType | Notes
          </p>
          <p className="opacity-90">
            Existing records with identical Male and Female Nakshatras will be updated automatically.
          </p>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-emerald-600 bg-emerald-50/50  scale-[1.01]'
              : file
              ? 'border-emerald-500 bg-emerald-50/20 '
              : 'border-slate-300  hover:border-slate-400 bg-slate-50/50 '
          }`}
          onClick={() => document.getElementById('excel-file-input')?.click()}
        >
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700   flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-bold text-slate-900  text-sm">{file.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB • Click to choose a different file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-slate-200  text-slate-500 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="font-bold text-slate-800  text-sm">Click to upload spreadsheet or drag and drop</p>
              <p className="text-xs text-slate-400 mt-1">Supports .xlsx, .xls, and .csv files up to 10MB</p>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ExcelImportModal;
