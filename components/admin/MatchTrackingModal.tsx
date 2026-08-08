'use client';

import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';

interface MatchTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  initialTab?: 'SENT' | 'NOT_MATCHED';
}

export default function MatchTrackingModal({ isOpen, onClose, targetUserId, initialTab = 'SENT' }: MatchTrackingModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'SENT' | 'NOT_MATCHED'>(initialTab);
  const [candidateId, setCandidateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchLogs();
    }
  }, [isOpen, initialTab, targetUserId]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUserId)}/sent-logs`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setLogs(data.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUserId)}/track-sent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: activeTab,
          recipientUserId: candidateId.trim(),
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      showToast('Candidate successfully logged.', 'success');
      setCandidateId('');
      fetchLogs();
    } catch (err: any) {
      showToast(err.message || 'Failed to log candidate', 'error');
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (log: any) => {
    const newStatus = log.status === 'SENT' ? 'NOT_MATCHED' : 'SENT';
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUserId)}/track-sent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          recipientUserId: log.recipientUserId,
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
      fetchLogs();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => log.status === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Match Tracking</h2>
            <p className="text-sm text-slate-500 mt-1">Manage shared profiles for user ID: <span className="font-mono text-slate-700 bg-slate-100 px-1 rounded">{targetUserId}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'SENT' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('SENT')}
          >
            Profile Sent
          </button>
          <button
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'NOT_MATCHED' ? 'border-rose-500 text-rose-700 bg-rose-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('NOT_MATCHED')}
          >
            Sent (Not Matched)
          </button>
        </div>

        {/* Add Form */}
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleAddCandidate} className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Candidate User ID to log..."
              value={candidateId}
              onChange={e => setCandidateId(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
            <Button type="submit" variant={activeTab === 'SENT' ? 'primary' : 'danger'} isLoading={isLoading}>
              Add Candidate
            </Button>
          </form>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[300px] max-h-[50vh]">
          {isLoading && logs.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No candidates found in {activeTab === 'SENT' ? 'Profile Sent' : 'Sent (Not Matched)'} list.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map(log => (
                <div key={log.id} className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden flex-shrink-0">
                      {log.recipientUser?.profile?.photoUrl ? (
                        <img src={log.recipientUser.profile.photoUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        (log.recipientUser?.profile?.name || 'U')[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-800">{log.recipientUser?.profile?.name || 'Unknown User'}</p>
                        <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-xs text-slate-500">ID: <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{log.recipientUser?.userIndex ? `#${log.recipientUser.userIndex}` : log.recipientUserId.substring(0, 8)}</span></p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div>
                      <span className="block text-slate-400">Astrology</span>
                      <span className="font-semibold text-slate-700 truncate block" title={`${log.recipientUser?.profile?.nakshatra || 'N/A'} / ${log.recipientUser?.profile?.rasi || 'N/A'}`}>
                        {log.recipientUser?.profile?.nakshatra || 'N/A'} / {log.recipientUser?.profile?.rasi || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Profession</span>
                      <span className="font-semibold text-slate-700 truncate block" title={`${log.recipientUser?.profile?.highestEducation || 'N/A'} - ${log.recipientUser?.profile?.designation || 'N/A'}`}>
                        {log.recipientUser?.profile?.highestEducation || 'N/A'} - {log.recipientUser?.profile?.designation || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <a
                      href={`https://wa.me/${log.recipientUser?.mobile_no?.replace(/\D/g, '') || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex justify-center items-center gap-1 py-2 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      📲 Share
                    </a>
                    {log.recipientUser?.profile?.jathakamUrl && (
                      <a
                        href={log.recipientUser.profile.jathakamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex justify-center items-center gap-1 py-2 text-xs font-bold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        📄 Jathagam
                      </a>
                    )}
                    <button
                      onClick={() => handleToggleStatus(log)}
                      disabled={isLoading}
                      className={`flex-1 flex justify-center items-center gap-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                        activeTab === 'SENT'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      🔄 {activeTab === 'SENT' ? 'Unmatch' : 'Restore'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
