'use client';

// ==========================================
// ANALYTICS CHARTS COMPONENT
// ==========================================

import React from 'react';
import { AdminDashboardStats, MonthlyChartPoint, ChartDataPoint } from '../../types/admin';

export interface AnalyticsChartsProps {
  stats: AdminDashboardStats;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats }) => {
  const maxMonthly = Math.max(
    ...stats.monthlyRegistrations.map((m) => m.registrations),
    100
  );

  const totalGender = (stats.totalMale || 1) + (stats.totalFemale || 1);
  const malePercent = Math.round(((stats.totalMale || 58) / totalGender) * 100);
  const femalePercent = 100 - malePercent;

  return (
    <div className="space-y-6">
      {/* Top Row: Monthly Trend & Gender Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Registrations Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white  p-6 rounded-2xl border border-slate-200  shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 ">
                Profiles Registered per Month
              </h3>
              <p className="text-xs text-slate-500  mt-0.5">
                Monthly breakdown of registrations, approvals, and rejections
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700 ">
                <span className="w-3 h-3 rounded bg-emerald-700" /> Registered
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 ">
                <span className="w-3 h-3 rounded bg-emerald-400" /> Approved
              </span>
            </div>
          </div>

          {/* Bar Chart Simulator */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 border-b border-slate-100 ">
            {stats.monthlyRegistrations.map((point: MonthlyChartPoint, idx: number) => {
              const regHeight = Math.max(Math.round((point.registrations / maxMonthly) * 100), 10);
              const appHeight = Math.max(Math.round((point.approvals / maxMonthly) * 100), 5);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {point.month}: {point.registrations} Reg / {point.approvals} App
                    </div>

                    {/* Registered Bar */}
                    <div
                      style={{ height: `${regHeight}%` }}
                      className="w-3 sm:w-5 bg-emerald-700 rounded-t-md transition-all duration-500 group-hover:bg-emerald-600"
                    />

                    {/* Approved Bar */}
                    <div
                      style={{ height: `${appHeight}%` }}
                      className="w-3 sm:w-5 bg-emerald-400 rounded-t-md transition-all duration-500 group-hover:bg-emerald-300"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 ">
                    {point.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
            <span>Overall Growth: +18.4% YoY</span>
            <span>Avg Approval Time: 4.2 Hours</span>
          </div>
        </div>

        {/* Gender Breakdown & Approval Rate Box */}
        <div className="bg-white  p-6 rounded-2xl border border-slate-200  shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 ">Male vs Female Ratio</h3>
            <p className="text-xs text-slate-500  mt-0.5">
              Demographic balance in active database
            </p>
          </div>

          {/* Visual Progress Bar */}
          <div className="my-6">
            <div className="flex justify-between items-center mb-2 text-sm font-bold">
              <span className="flex items-center gap-2 text-sky-700 ">
                <span className="w-3 h-3 rounded-full bg-sky-600" /> Male ({stats.totalMale})
              </span>
              <span className="flex items-center gap-2 text-fuchsia-700 ">
                Female ({stats.totalFemale}) <span className="w-3 h-3 rounded-full bg-fuchsia-600" />
              </span>
            </div>

            <div className="h-6 w-full bg-slate-100  rounded-full overflow-hidden flex p-1 shadow-inner">
              <div
                style={{ width: `${malePercent}%` }}
                className="h-full bg-sky-600 rounded-l-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
              >
                {malePercent > 15 && `${malePercent}%`}
              </div>
              <div
                style={{ width: `${femalePercent}%` }}
                className="h-full bg-fuchsia-600 rounded-r-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
              >
                {femalePercent > 15 && `${femalePercent}%`}
              </div>
            </div>
          </div>

          {/* Approval Rate Card */}
          <div className="p-4 rounded-xl bg-emerald-50  border border-emerald-100  mt-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800  uppercase tracking-wider">
                  Overall Approval Rate
                </p>
                <p className="text-3xl font-extrabold text-emerald-700  mt-1">
                  {stats.approvalRate}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-200  flex items-center justify-center text-emerald-700  font-bold text-sm">
                ✓
              </div>
            </div>
            <p className="text-[11px] text-emerald-700/80  mt-2">
              Based on {stats.approvedProfiles} approved and {stats.rejectedProfiles} rejected profiles.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Religion & Caste Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Religion Distribution */}
        <div className="bg-white  p-6 rounded-2xl border border-slate-200  shadow-sm">
          <h3 className="text-base font-bold text-slate-900 ">Religion Distribution</h3>
          <p className="text-xs text-slate-500  mt-0.5 mb-6">
            Profile distribution across religious communities
          </p>

          <div className="space-y-4">
            {stats.religionDistribution.map((item: ChartDataPoint, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-700 ">{item.label}</span>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100  rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.value}%`, backgroundColor: item.color || '#047857' }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Caste Distribution */}
        <div className="bg-white  p-6 rounded-2xl border border-slate-200  shadow-sm">
          <h3 className="text-base font-bold text-slate-900 ">Caste Distribution</h3>
          <p className="text-xs text-slate-500  mt-0.5 mb-6">
            Top community representations in active matrimonial database
          </p>

          <div className="space-y-4">
            {stats.casteDistribution.map((item: ChartDataPoint, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-700 ">{item.label}</span>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100  rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.value}%`, backgroundColor: item.color || '#059669' }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
