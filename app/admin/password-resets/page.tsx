'use client';

import React, { useEffect, useState } from 'react';
import { getPasswordResetRequests, resolvePasswordResetRequest, markAllPasswordResetRequestsRead } from '../../../actions/admin/passwordReset.actions';
import Badge from '@/components/admin/ui/Badge';
import Button from '@/components/admin/ui/Button';
import { useToast } from '@/components/admin/ui/Toast';

export default function PasswordResetsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchRequests();
    markAllPasswordResetRequestsRead().catch(console.error); // Mark all as read when opening page
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getPasswordResetRequests();
      if (res.success) {
        setRequests(res.data || []);
      } else {
        showToast(res.error || 'Failed to fetch requests', 'error');
      }
    } catch (err) {
      showToast('Error fetching requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetClick = (req: any) => {
    setSelectedRequest(req);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleResetSubmit = async () => {
    if (!newPassword.trim()) {
      showToast('Password cannot be empty', 'error');
      return;
    }
    
    setIsResetting(true);
    try {
      const res = await resolvePasswordResetRequest(selectedRequest.id, selectedRequest.userId, newPassword);
      if (res.success) {
        showToast(res.message || 'Success', 'success');
        setIsResetModalOpen(false);
        fetchRequests();
      } else {
        showToast(res.error || 'Failed to reset password', 'error');
      }
    } catch (err) {
      showToast('Error resetting password', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Password Reset Requests</h1>
        <p className="text-sm text-slate-500 mt-1">Manage users who forgot their passwords.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Mobile / Email</th>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No password reset requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {req.user?.profile?.name || req.user?.name || 'Unknown User'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 font-medium">{req.user?.mobile_no}</div>
                      {req.user?.email && <div className="text-slate-400 text-xs">{req.user?.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={req.status === 'PENDING' ? 'amber' : 'emerald'}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'PENDING' && (
                        <Button size="sm" onClick={() => handleResetClick(req)}>
                          Reset Password
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isResetModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleUp">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Reset Password</h2>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Set a new password for <span className="font-bold">{selectedRequest.user?.profile?.name || selectedRequest.user?.mobile_no}</span>.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsResetModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                isLoading={isResetting}
                onClick={handleResetSubmit}
              >
                Reset & Resolve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
