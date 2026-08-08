'use client';

// ==========================================
// DASHBOARD STAT CARDS COMPONENT
// ==========================================

import React from 'react';
import Link from 'next/link';
import { AdminDashboardStats } from '../../types/admin';

export interface DashboardCardsProps {
  stats: AdminDashboardStats;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+12% this month',
      isPositive: true,
      href: '/admin/users',
      iconBg: 'bg-blue-100 text-blue-700  ',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Pending Profiles',
      value: stats.pendingProfiles,
      change: 'Requires review',
      isAlert: stats.pendingProfiles > 0,
      href: '/admin/users?status=pending',
      iconBg: 'bg-amber-100 text-amber-700  ',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Approved Profiles',
      value: stats.approvedProfiles,
      change: `${stats.approvalRate}% approval rate`,
      isPositive: true,
      href: '/admin/users?status=approved',
      iconBg: 'bg-emerald-100 text-emerald-700  ',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Rejected Profiles',
      value: stats.rejectedProfiles,
      change: 'Moderated out',
      href: '/admin/users?status=denied',
      iconBg: 'bg-rose-100 text-rose-700  ',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Today's Registrations",
      value: stats.todaysRegistrations,
      change: 'New today',
      isPositive: true,
      href: '/admin/users?status=all',
      iconBg: 'bg-teal-100 text-teal-700  ',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Total Male',
      value: stats.totalMale,
      change: `${Math.round((stats.totalMale / (stats.totalMale + stats.totalFemale || 1)) * 100)}% of database`,
      href: '/admin/users?status=all',
      iconBg: 'bg-sky-100 text-sky-700  ',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Total Female',
      value: stats.totalFemale,
      change: `${Math.round((stats.totalFemale / (stats.totalMale + stats.totalFemale || 1)) * 100)}% of database`,
      href: '/admin/users?status=all',
      iconBg: 'bg-fuchsia-100 text-fuchsia-700  ',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
      {cards.map((card, idx) => (
        <Link
          key={idx}
          href={card.href}
          className="group bg-white  rounded-2xl p-5 border border-slate-200  shadow-sm hover:shadow-md hover:border-emerald-500/40  transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500  uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900  mt-1 group-hover:text-emerald-700  transition-colors">
                {card.value.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${card.iconBg} shrink-0 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100  mt-auto">
            <span
              className={`font-medium ${
                card.isAlert
                  ? 'text-amber-600  font-bold'
                  : card.isPositive
                  ? 'text-emerald-600 '
                  : 'text-slate-500 '
              }`}
            >
              {card.change}
            </span>
            <span className="text-slate-400 group-hover:translate-x-1 transition-transform inline-block">
              →
            </span>
          </div>
        </Link>
      ))}


    </div>
  );
};

export default DashboardCards;
