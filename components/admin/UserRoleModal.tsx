'use client';

// ==========================================
// USER ROLE & PRIVILEGES MODAL
// ==========================================

import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { AdminUser, UserRole } from '../../types/admin';
import { makeAdminAction, removeAdminAction } from '../../actions/admin/user.actions';

export interface UserRoleModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedUser: AdminUser) => void;
}

export const UserRoleModal: React.FC<UserRoleModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const isAdmin = String(user.role) === 'ADMIN';

  const handleRoleSubmit = async () => {
    setIsLoading(true);
    try {
      const action = isAdmin ? removeAdminAction : makeAdminAction;
      const userId = Number(user.id);
      const res = await action(userId);

      if (res.success && res.data) {
        showToast(res.message || 'Privileges updated successfully.', 'success');
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        showToast(res.error || 'Failed to update user role', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error executing role update', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      title="Modify User Privileges"
      subtitle={`Manage administrative access for ${user.name}`}
      maxWidth="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant={isAdmin ? 'danger' : 'success'} onClick={handleRoleSubmit} isLoading={isLoading}>
            {isAdmin ? 'Downgrade to Standard User' : 'Promote to Admin'}
          </Button>
        </div>
      }
    >
      <div className="text-center py-3">
        <div
          className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-bold text-xl mb-4 shadow-md ${
            isAdmin ? 'bg-amber-100 text-amber-700  ' : 'bg-emerald-100 text-emerald-700  '
          }`}
        >
          {isAdmin ? '👑' : '🛡️'}
        </div>
        <h4 className="font-bold text-base text-slate-800 ">{user.name}</h4>
        <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>

        <div className="mt-6 p-4 rounded-xl bg-slate-50  border border-slate-200  text-left text-xs text-slate-600 ">
          <p className="font-bold mb-1 text-slate-800 ">
            {isAdmin ? 'Downgrading Privileges:' : 'Promoting to Administrator:'}
          </p>
          <ul className="list-disc list-inside space-y-1 opacity-90">
            {isAdmin ? (
              <>
                <li>User will lose access to the /admin console.</li>
                <li>Cannot approve or reject matrimonial profiles.</li>
                <li>Cannot modify site settings or export astrology data.</li>
              </>
            ) : (
              <>
                <li>User will gain full access to all /admin dashboards.</li>
                <li>Can approve, reject, and permanently delete profiles.</li>
                <li>Can manage other users and import compatibility spreadsheets.</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default UserRoleModal;
