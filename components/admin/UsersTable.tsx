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
  togglePaymentAction,
} from '../../actions/admin/user.actions';
import { removeAfterMatchAction } from '../../actions/admin/profile.actions';
import { NAKSHATRAS_LIST } from '../../lib/admin/constants';

export interface UsersTableProps {
  users: AdminUser[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onFilterChange?: (search: string, status: string) => void;
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

  const handleStatusToggle = async (e: React.MouseEvent, user: AdminUser) => {
    e.stopPropagation();
    const userId = Number(user.id);
    setLoadingId(userId);
    try {
      const isSuspended = user.status === 'SUSPENDED';
      const action = isSuspended ? activateUserAction : suspendUserAction;
      const res = await action(userId);
      if (res.success) showToast(res.message || `Account status updated for ${user.name}`, 'info');
      else showToast(res.error || 'நிலையை மாற்றுவதில் பிழை', 'error');
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
        showToast(res.message || 'முகப்பு நிலை புதுப்பிக்கப்பட்டது', 'success');
      } else {
        e.target.checked = !isFeatured;
        showToast(res.error || 'புதுப்பிப்பதில் பிழை', 'error');
      }
    } catch (err: any) {
      e.target.checked = !isFeatured;
      showToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handlePaymentToggle = async (e: React.ChangeEvent<HTMLInputElement>, user: AdminUser) => {
    e.stopPropagation();
    const isPaid = e.target.checked;
    setLoadingId(Number(user.id));
    try {
      const res = await togglePaymentAction(user.id, isPaid);
      if (res.success) {
        user.paymentDone = isPaid;
        showToast(res.message || 'கட்டண நிலை புதுப்பிக்கப்பட்டது', 'success');
      } else {
        e.target.checked = !isPaid;
        showToast(res.error || 'புதுப்பிப்பதில் பிழை', 'error');
      }
    } catch (err: any) {
      e.target.checked = !isPaid;
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
        if (res.success) showToast('பயனர் பொருத்தப்பட்டதாகக் குறிக்கப்பட்டு நீக்கப்பட்டார்', 'success');
        else showToast(res.error || 'பயனரை நீக்குவதில் பிழை', 'error');
      } else {
        const res = await deleteUserAction(deleteConfirmUser.id as number);
        if (res.success) showToast('பயனர் கணக்கு நிரந்தரமாக நீக்கப்பட்டது', 'success');
        else showToast(res.error || 'பயனரை நீக்குவதில் பிழை', 'error');
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
      showToast('கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்', 'error');
      return;
    }

    const userId = Number(resetPasswordUser.id);
    setLoadingId(userId);
    try {
      const res = await updateUserPasswordAction(resetPasswordUser.id, newPassword);
      if (res.success) {
        showToast(`${resetPasswordUser.name} கடவுச்சொல் புதுப்பிக்கப்பட்டது`, 'success');
        setResetPasswordUser(null);
        setNewPassword('');
      } else {
        showToast(res.error || 'கடவுச்சொல்லை புதுப்பிப்பதில் பிழை', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilterChange) onFilterChange(searchQuery, currentStatus);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleFilterSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="பயனர் பெயர், மின்னஞ்சல், போன் எண் தேடுக..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Button type="submit" variant="secondary" size="sm" className="shrink-0 h-9">தேடு</Button>
        </form>
        {onFilterChange && (
          <div className="w-full sm:w-auto">
            <select
              value={currentStatus}
              onChange={(e) => onFilterChange(searchQuery, e.target.value)}
              className="w-full sm:w-auto bg-white text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
            >
              <option value="all">அனைத்து பயனர்கள்</option>
              <option value="pending">நிலுவையில்</option>
              <option value="approved">அங்கீகரிக்கப்பட்டது</option>
              <option value="denied">நிராகரிக்கப்பட்டது</option>
              <option value="matched_removed">பொருத்தப்பட்டது / நீக்கப்பட்டது</option>
            </select>
          </div>
        )}
      </div>


      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">பெயர்</th>
              <th className="px-4 py-3.5">பயனர் எண்</th>
              <th className="px-4 py-3.5">மொபைல் எண்</th>
              <th className="px-4 py-3.5 text-center">கட்டணம்</th>
              <th className="px-4 py-3.5">பங்கு</th>
              <th className="px-4 py-3.5">நிலை</th>
              <th className="px-4 py-3.5">தேதி</th>
              <th className="px-4 py-3.5 text-center">முகப்பு</th>
              <th className="px-6 py-3.5 text-right">செயல்கள்</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  பதிவு செய்த பயனர்கள் எதுவும் இல்லை.
                </td>
              </tr>
            ) : (
              users.map((user, index) => {
                const isRoleAdmin = String(user.role) === 'ADMIN';
                const isCreatedByAdmin = user.profileCreatedBy ? String(user.profileCreatedBy).toLowerCase() === 'admin' : false;
                const isAdmin = isRoleAdmin || isCreatedByAdmin;
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
                          <div className="font-bold text-slate-900 leading-tight">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        {user.userid || user.userIndex || user.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-mono text-xs">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={user.paymentDone || false}
                          disabled={loadingId === user.id}
                          onChange={(e) => handlePaymentToggle(e, user)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                      <div className="text-[10px] text-slate-500 mt-1">{user.paymentDone ? 'ஆம்' : 'இல்லை'}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isAdmin ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {isAdmin ? 'நிர்வாகி' : 'பயனர்'}
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
                        title="முகப்பு பக்கத்தில் காட்டு"
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
                          {isSuspended ? 'செயல்படுத்து' : 'தடை செய்'}
                        </button>
                        
                        {/* Reset Password Button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setResetPasswordUser(user); setNewPassword(''); }}
                          disabled={loadingId === user.id}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          title="கடவுச்சொல்லை மாற்று"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmUser(user); }}
                          disabled={loadingId === user.id}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title={user.profileId ? "பொருத்தத்திற்குப் பிறகு நீக்கு" : "கணக்கை நீக்கு"}
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
        title={deleteConfirmUser?.profileId ? "பொருத்தத்திற்குப் பிறகு நீக்கவா?" : "பயனர் கணக்கை நீக்கவா?"}
        message={deleteConfirmUser?.profileId ? `${deleteConfirmUser?.name} அவர்களுக்கு பொருத்தம் கிடைத்துவிட்டதாக குறிக்க மற்றும் தேடலில் இருந்து நீக்க விரும்புகிறீர்களா?` : `${deleteConfirmUser?.name} கணக்கை நீக்கவா?`}
        confirmText={deleteConfirmUser?.profileId ? "பொருத்தத்திற்குப் பிறகு நீக்கு" : "கணக்கை நீக்கு"}
        variant="danger"
        isLoading={!!loadingId}
      />

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">கடவுச்சொல்லை மாற்று</h3>
              <button onClick={() => setResetPasswordUser(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleResetPassword} className="p-5">
              <p className="text-sm text-slate-600 mb-4">
                <strong>{resetPasswordUser.name}</strong> அவர்களுக்கு புதிய கடவுச்சொல்லை உள்ளிடவும். அவர்கள் உடனடியாக இந்த புதிய கடவுச்சொல்லுடன் உள்நுழைய முடியும்.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    புதிய கடவுச்சொல் <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    placeholder="புதிய கடவுச்சொல்லை உள்ளிடுக"
                    autoComplete="off"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">குறைந்தபட்சம் 6 எழுத்துக்கள்.</p>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setResetPasswordUser(null)}>
                  ரத்துசெய்
                </Button>
                <Button type="submit" variant="primary" isLoading={!!loadingId}>
                  கடவுச்சொல்லை புதுப்பி
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
