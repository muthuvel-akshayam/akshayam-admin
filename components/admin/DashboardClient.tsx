'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminDashboardStats, AdminProfile, ProfileStatus } from '@/types/admin';
import { fetchDashboardStatsAction, approveProfileAction, rejectProfileAction } from '@/actions/admin/profile.actions';
import DashboardCards from './DashboardCards';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { useToast } from './ui/Toast';

export interface DashboardClientProps {
  initialStats: AdminDashboardStats;
}

export default function DashboardClient({ initialStats }: DashboardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminDashboardStats>(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  // Keep the initial server and client markup identical. The current time is
  // browser-specific, so it must only be set after hydration.
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  // Live Auto-Refresh polling every 15 seconds when active
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetchDashboardStatsAction();
        if (res.success && res.data) {
          setStats(res.data);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.warn('Auto-refresh polling failed:', err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  // Manual live refresh trigger
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchDashboardStatsAction();
      if (res.success && res.data) {
        setStats(res.data);
        setLastUpdated(new Date());
        showToast('Dashboard synchronized with live database!', 'success');
        router.refresh();
      } else {
        showToast(res.error || 'Failed to refresh data', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error connecting to database', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Quick Approve Action from Live Queue
  const handleQuickApprove = async (profileId: number, name: string) => {
    setActionLoadingId(profileId);
    try {
      const res = await approveProfileAction(profileId);
      if (res.success) {
        showToast(`Approved profile for ${name}!`, 'success');
        const updated = await fetchDashboardStatsAction();
        if (updated.success && updated.data) setStats(updated.data);
        router.refresh();
      } else {
        showToast(res.error || 'Approval failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error executing approval', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Reject Action from Live Queue
  const handleQuickReject = async (profileId: number, name: string) => {
    setActionLoadingId(profileId);
    try {
      const res = await rejectProfileAction(profileId, 'Incomplete biodata details or pending verification from dashboard.');
      if (res.success) {
        showToast(`Rejected profile for ${name}`, 'info');
        const updated = await fetchDashboardStatsAction();
        if (updated.success && updated.data) setStats(updated.data);
        router.refresh();
      } else {
        showToast(res.error || 'Rejection failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error executing rejection', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Dynamic Header & Live Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 ">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900  tracking-tight">
              System Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800   border border-emerald-300 ">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE STREAM
            </span>
          </div>
          <p className="text-sm text-slate-500  mt-1">
            Real-time astrological matching, queue moderation, and demographic telemetry.
          </p>
        </div>

        {/* Dynamic Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50  p-2 rounded-2xl border border-slate-200/80  shadow-sm">
          {/* Auto Refresh Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isAutoRefresh
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-slate-200  text-slate-600  hover:bg-slate-300'
            }`}
            title="Automatically polling database every 15s"
          >
            <span className={`w-2 h-2 rounded-full ${isAutoRefresh ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
            <span>Auto-Sync: {isAutoRefresh ? 'ON (15s)' : 'OFF'}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white  border border-slate-200  text-slate-700  font-bold text-xs hover:bg-slate-50  active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Now'}</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono px-2 hidden lg:inline">
            Updated: {lastUpdated
              ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '--:--:--'}
          </span>
        </div>
      </div>

      {/* 8-Cell Stat Cards Grid */}
      <DashboardCards stats={stats} />
    </div>
  );
}
