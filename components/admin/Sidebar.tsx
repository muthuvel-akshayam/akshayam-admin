'use client';

// ==========================================
// ADMIN SIDEBAR COMPONENT
// ==========================================

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ADMIN_NAV_ITEMS } from '../../lib/admin/constants';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, pendingCount = 14 }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('Navigation');

  const getTransKey = (title: string): string => {
    switch (title) {
      case 'Dashboard': return 'dashboard';
      case 'Pending': return 'pending';
      case 'Denied': return 'denied';
      case 'Remove After Match': return 'removeAfterMatch';
      case 'Users': return 'users';
      case 'Nakshatra Compatibility': return 'nakshatraCompatibility';
      case 'Analytics': return 'analytics';
      case 'Settings': return 'settings';
      default: return 'dashboard';
    }
  };

  const renderIcon = (iconName: string, isActive: boolean) => {
    const color = isActive ? 'text-emerald-700 ' : 'text-slate-400 group-hover:text-slate-600 ';
    
    switch (iconName) {
      case 'layout-dashboard':
        return (
          <svg className={`w-5 h-5 ${color} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 18a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'clock':
        return (
          <svg className={`w-5 h-5 ${color} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'check-circle-2':
        return (
          <svg className={`w-5 h-5 ${color} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'x-circle':
        return (
          <svg className={`w-5 h-5 ${color} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'users':
        return (
          <svg className={`w-5 h-5 ${color} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'sparkles':
        return (
          <svg className={`w-5 h-5 ${color} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'bar-chart-3':
        return (
          <svg className={`w-5 h-5 ${color} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'settings':
        return (
          <svg className={`w-5 h-5 ${color} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white  border-r border-slate-200  flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100  flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900  tracking-tight block leading-none">
                AKSHAYAM
              </span>
              <span className="text-[10px] font-bold text-emerald-700  tracking-wider uppercase">
                Admin Console
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 "
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="px-3 text-[11px] font-bold text-slate-400  uppercase tracking-wider mb-3">
            Management
          </p>
          <nav className="space-y-1.5">
            {ADMIN_NAV_ITEMS.map((item) => {
              // Handle active state including query params for /admin/users
              let isActive = false;
              if (item.href === '/admin') {
                isActive = pathname === '/admin';
              } else if (item.href.includes('?')) {
                // E.g. /admin/users?status=pending
                const [basePath, query] = item.href.split('?');
                if (pathname === basePath) {
                  const urlParams = new URLSearchParams(query);
                  let allParamsMatch = true;
                  urlParams.forEach((val, key) => {
                    if (searchParams.get(key) !== val) {
                      allParamsMatch = false;
                    }
                  });
                  // If there's no status in URL, default to 'all' for /admin/users?status=all
                  if (!searchParams.get('status') && item.href === '/admin/users?status=all') {
                    allParamsMatch = true;
                  }
                  isActive = allParamsMatch;
                }
              } else {
                isActive = pathname.startsWith(item.href);
              }

              const showBadge = item.badgeKey === 'pendingProfiles' && pendingCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold   shadow-sm border border-emerald-100 '
                      : 'text-slate-600  hover:bg-slate-50  hover:text-slate-900 '
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(item.iconName, isActive)}
                    <span>{t(getTransKey(item.title) as any)}</span>
                  </div>

                  {showBadge && (
                    <span className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>


        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100  text-xs text-slate-400  flex items-center justify-between">
          <span>v2.5.0 Pro</span>
          <span>Next.js 15 App</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
