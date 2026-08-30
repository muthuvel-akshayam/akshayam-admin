'use client';

import React, { useState } from 'react';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Pagination from './ui/Pagination';
import ConfirmDialog from './ui/ConfirmDialog';
import { useToast } from './ui/Toast';
import { AdminUser } from '../../types/admin';
import {
  suspendUserAction,
  activateUserAction,
  deleteUserAction,
  toggleUserFeaturedAction,
  updateUserPasswordAction,
} from '../../actions/admin/user.actions';
import { removeAfterMatchAction } from '../../actions/admin/profile.actions';

export interface UsersTableProps {
  users: AdminUser[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onFilterChange?: (search: string, status: string, minAge?: number, maxAge?: number, nakshatras?: string, dosham?: string) => void;
  onRowClick?: (userId: string | number) => void;
  currentStatus?: string;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  total,
  currentPage,
  itemsPerPage,
  onPageChange,
  onFilterChange,
  onRowClick,
  currentStatus = 'all',
}) => {
  const { showToast } = useToast();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Advanced Filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minAge, setMinAge] = useState<number | ''>('');
  const [maxAge, setMaxAge] = useState<number | ''>('');
  const [nakshatras, setNakshatras] = useState('');
  const [dosham, setDosham] = useState('');

  const handleStatusToggle = async (e: React.MouseEvent, user: AdminUser) => {
    e.stopPropagation();
    const userId = Number(user.id);
    setLoadingId(userId);
    try {
      const isSuspended = user.status === 'SUSPENDED';
      const action = isSuspended ? activateUserAction : suspendUserAction;
      const res = await action(userId);
      if (res.success) showToast(res.message || `Account status updated for ${user.name}`, 'info');
      else showToast(res.error || 'Failed to change status', 'error');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleFeaturedToggle = async (e: React.ChangeEvent<HTMLInputElement>, user: AdminUser) => {
    e.stopPropagation();
    const isFeatured = e.target.checked;
    setLoadingId(Number(user.id));
    try {
      const res = await toggleUserFeaturedAction(user.id, isFeatured);
      if (res.success) {
        showToast(res.message || 'Featured status updated', 'success');
      } else {
        e.target.checked = !isFeatured;
        showToast(res.error || 'Failed to update', 'error');
      }
    } catch (err: any) {
      e.target.checked = !isFeatured;
      showToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmUser) return;
    const userId = Number(deleteConfirmUser.id);
    setLoadingId(userId);
    try {
      if (deleteConfirmUser.profileId) {
        const res = await removeAfterMatchAction(deleteConfirmUser.profileId);
        if (res.success) showToast('User marked as matched and removed', 'success');
        else showToast(res.error || 'Failed to remove user', 'error');
      } else {
        const res = await deleteUserAction(deleteConfirmUser.id as number);
        if (res.success) showToast('User account deleted permanently', 'success');
        else showToast(res.error || 'Failed to delete user', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoadingId(null);
      setDeleteConfirmUser(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newPassword) return;
    
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    const userId = Number(resetPasswordUser.id);
    setLoadingId(userId);
    try {
      const res = await updateUserPasswordAction(resetPasswordUser.id, newPassword);
      if (res.success) {
        showToast(`Password updated for ${resetPasswordUser.name}`, 'success');
        setResetPasswordUser(null);
        setNewPassword('');
      } else {
        showToast(res.error || 'Failed to update password', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilterChange) onFilterChange(searchQuery, currentStatus, minAge || undefined, maxAge || undefined, nakshatras || undefined, dosham || undefined);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleFilterSubmit} className="flex-1 flex items-center gap-3 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search user name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>
        {onFilterChange && (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Advanced
            </Button>
            <select
              value={currentStatus}
              onChange={(e) => onFilterChange(searchQuery, e.target.value, minAge || undefined, maxAge || undefined, nakshatras || undefined, dosham || undefined)}
              className="bg-white text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
            >
              <option value="all">All Users</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="matched_removed">Matched / Removed</option>
            </select>
          </div>
        )}
      </div>

      {showAdvanced && onFilterChange && (
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-end animate-fadeIn">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Age Range</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={minAge} 
                onChange={(e) => setMinAge(e.target.value ? Number(e.target.value) : '')} 
                className="w-20 bg-white text-slate-800 px-3 py-1.5 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
              />
              <span className="text-slate-400">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxAge} 
                onChange={(e) => setMaxAge(e.target.value ? Number(e.target.value) : '')} 
                className="w-20 bg-white text-slate-800 px-3 py-1.5 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nakshatras (comma separated)</label>
            <input 
              type="text" 
              placeholder="e.g. Ashwini, Bharani" 
              value={nakshatras} 
              onChange={(e) => setNakshatras(e.target.value)} 
              className="w-48 bg-white text-slate-800 px-3 py-1.5 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Thoosam / Dosham</label>
            <input 
              type="text" 
              placeholder="e.g. Sevvai" 
              value={dosham} 
              onChange={(e) => setDosham(e.target.value)} 
              className="w-40 bg-white text-slate-800 px-3 py-1.5 rounded-lg text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => onFilterChange(searchQuery, currentStatus, minAge || undefined, maxAge || undefined, nakshatras || undefined, dosham || undefined)}
          >
            Apply Filters
          </Button>
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">ID / Name</th>
              <th className="px-4 py-3.5">Phone Number</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-4 py-3.5 text-center">Featured</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No registered users found.
                </td>
              </tr>
            ) : (
              users.map((user, index) => {
                const isAdmin = String(user.role) === 'ADMIN';
                const isSuspended = user.status === 'SUSPENDED';

                return (
                  <tr
                    key={user.id}
                    onClick={() => onRowClick?.(user.id)}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAdmin ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                            {user.name} <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">#{user.userIndex || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-mono text-xs">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isAdmin ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge status={user.status} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-xs">
                      {new Date(user.registeredDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        defaultChecked={user.isFeatured}
                        disabled={loadingId === user.id}
                        onChange={(e) => handleFeaturedToggle(e, user)}
                        className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer disabled:opacity-50"
                        title="Show on Landing Page"
                      />
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleStatusToggle(e, user)}
                          disabled={loadingId === user.id}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                            isSuspended ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSuspended ? 'Activate' : 'Suspend'}
                        </button>
                        
                        {/* Reset Password Button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setResetPasswordUser(user); setNewPassword(''); }}
                          disabled={loadingId === user.id}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          title="Reset Password"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmUser(user); }}
                          disabled={loadingId === user.id}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title={user.profileId ? "Remove After Match" : "Delete Account"}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(total / itemsPerPage) || 1}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmUser}
        onClose={() => setDeleteConfirmUser(null)}
        onConfirm={handleDelete}
        title={deleteConfirmUser?.profileId ? "Remove After Match?" : "Delete User Account?"}
        message={deleteConfirmUser?.profileId ? `Are you sure you want to mark ${deleteConfirmUser?.name} as matched and remove them from active searches?` : `Delete account for ${deleteConfirmUser?.name}?`}
        confirmText={deleteConfirmUser?.profileId ? "Remove After Match" : "Delete Account"}
        variant="danger"
        isLoading={!!loadingId}
      />

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
              <button onClick={() => setResetPasswordUser(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleResetPassword} className="p-5">
              <p className="text-sm text-slate-600 mb-4">
                Update the password for <strong>{resetPasswordUser.name}</strong>. They will be able to log in with this new password immediately.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    placeholder="Enter new password"
                    autoComplete="off"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">Minimum 6 characters.</p>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setResetPasswordUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={!!loadingId}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
