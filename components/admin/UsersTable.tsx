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
} from '../../actions/admin/user.actions';
import { removeAfterMatchAction } from '../../actions/admin/profile.actions';

export interface UsersTableProps {
  users: AdminUser[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onFilterChange?: (search: string) => void;
  onRowClick?: (userId: string | number) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  total,
  currentPage,
  itemsPerPage,
  onPageChange,
  onFilterChange,
  onRowClick,
}) => {
  const { showToast } = useToast();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilterChange) onFilterChange(searchQuery);
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
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">ID / Name</th>
              <th className="px-4 py-3.5">Phone Number</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Date</th>
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
                          <div className="text-xs text-slate-400">{user.email}</div>
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
    </div>
  );
};

export default UsersTable;
