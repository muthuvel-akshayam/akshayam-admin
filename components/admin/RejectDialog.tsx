'use client';

// ==========================================
// REJECTION REASON DIALOG COMPONENT
// ==========================================

import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { AdminProfile } from '../../types/admin';
import { rejectProfileAction } from '../../actions/admin/profile.actions';

export interface RejectDialogProps {
  profile: AdminProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: AdminProfile) => void;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
  profile,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!profile) return null;

  const quickReasons = [
    'Blurry or inappropriate primary photograph.',
    'Incomplete family or education information.',
    'Invalid phone number or contact details.',
    'Horoscope / Jathagam chart unreadable.',
    'Profile details violate terms of service.',
  ];

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.trim() === '') {
      showToast('Please provide a reason for rejecting this profile.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const profileId = Number(profile.id);
      const res = await rejectProfileAction(profileId, reason);
      if (res.success && res.data) {
        showToast(res.message || `Profile ${profile.name} rejected.`, 'info');
        if (onSuccess) onSuccess(res.data);
        onClose();
        setReason('');
      } else {
        showToast(res.error || 'Failed to reject profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error rejecting profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) {
          setReason('');
          onClose();
        }
      }}
      title="Reject Profile Submission"
      subtitle={`Specify rejection feedback for ${profile.name}`}
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} isLoading={isLoading}>
            Confirm Rejection
          </Button>
        </div>
      }
    >
      <form onSubmit={handleReject} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-amber-50  border border-amber-200  text-amber-800  text-xs flex items-center gap-2.5">
          <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Rejecting a profile will set its status to REJECTED and remove it from public search.</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  uppercase mb-2">
            Rejection Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this profile cannot be approved (e.g. Blurry photo, incomplete biodata)..."
            className="w-full p-3 rounded-xl border border-slate-300  bg-white  text-slate-800  text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">Quick Select Templates:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickReasons.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReason(qr)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100  hover:bg-slate-200  text-slate-700  text-left transition-colors border border-slate-200 "
              >
                + {qr}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default RejectDialog;
