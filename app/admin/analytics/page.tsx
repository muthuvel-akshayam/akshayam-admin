import React from 'react';
import { getDashboardStats } from '../../../services/admin/profile.service';
import AnalyticsCharts from '../../../components/admin/AnalyticsCharts';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 ">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900  tracking-tight">
            Demographic & Astrological Analytics
          </h1>
          <p className="text-sm text-slate-500  mt-1">
            Deep-dive visual reporting on user acquisition, gender distribution, religion balance, and community representation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800   px-3.5 py-2 rounded-xl border border-emerald-200  self-start sm:self-auto">
          <span>📊 Live System Analytics</span>
        </div>
      </div>

      {/* Analytics Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white  border border-slate-200  shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Active Profiles</p>
          <p className="text-3xl font-extrabold text-slate-900  mt-2">
            {(stats.approvedProfiles + stats.pendingProfiles).toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600  font-medium mt-1">
            {stats.approvedProfiles} Verified Live ({stats.approvalRate}%)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white  border border-slate-200  shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Gender Balance Ratio</p>
          <p className="text-3xl font-extrabold text-sky-700  mt-2">
            {Math.round((stats.totalMale / (stats.totalMale + stats.totalFemale || 1)) * 100)}% Male
          </p>
          <p className="text-xs text-fuchsia-600  font-medium mt-1">
            {100 - Math.round((stats.totalMale / (stats.totalMale + stats.totalFemale || 1)) * 100)}% Female Representation
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white  border border-slate-200  shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Daily Registration Rate</p>
          <p className="text-3xl font-extrabold text-teal-700  mt-2">
            +{stats.todaysRegistrations} Today
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Average 14.2 new biodatas per day
          </p>
        </div>
      </div>

      {/* Main Charts Suite */}
      <AnalyticsCharts stats={stats} />
    </div>
  );
}
