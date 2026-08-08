'use client';

// ==========================================
// ADMIN TOPBAR COMPONENT
// ==========================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ui/Toast';
import LanguageSwitcher from './LanguageSwitcher';

export interface TopbarProps {
  onToggleSidebar?: () => void;
  onSearchSubmit?: (query: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  onSearchSubmit,
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(searchQuery.trim());
      } else {
        router.push(`/admin/profiles?query=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleLogout = () => {
    showToast('Logging out of admin console...', 'info');
    setTimeout(() => {
      // Redirect or invoke auth logout
      router.push('/');
    }, 1000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90  backdrop-blur-md border-b border-slate-200  h-16 px-4 lg:px-8 flex items-center justify-between transition-colors shadow-sm">
      {/* Left side: Mobile menu & Search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100   transition-colors"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <form onSubmit={handleSearch} className="w-full relative">
          <input
            type="text"
            placeholder="Search profiles, nakshatra, city, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100  text-slate-800  pl-10 pr-4 py-2 rounded-xl text-sm border border-transparent focus:border-emerald-600 focus:bg-white  focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>

      {/* Right side: Notifications & Admin Profile */}
      <div className="flex items-center gap-3 ml-4">
        
        <LanguageSwitcher />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2.5 rounded-xl text-slate-600  hover:bg-slate-100  transition-colors"
            title="Notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white  animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white  rounded-2xl shadow-xl border border-slate-200  py-3 z-50 animate-scaleUp">
              <div className="px-4 pb-2 border-b border-slate-100  flex justify-between items-center">
                <span className="font-bold text-sm text-slate-800 ">Notifications</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800   px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="divide-y divide-slate-100  max-h-64 overflow-y-auto">
                <div
                  onClick={() => {
                    setShowNotifications(false);
                    router.push('/admin/profiles/pending');
                  }}
                  className="p-3.5 hover:bg-slate-50  cursor-pointer transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-800 ">New Profile Submission</p>
                  <p className="text-xs text-slate-500  mt-0.5">Ananya Iyer submitted profile for verification.</p>
                  <p className="text-[10px] text-emerald-600 mt-1 font-medium">10 mins ago</p>
                </div>
                <div
                  onClick={() => {
                    setShowNotifications(false);
                    router.push('/admin/compatibility');
                  }}
                  className="p-3.5 hover:bg-slate-50  cursor-pointer transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-800 ">Excel Import Ready</p>
                  <p className="text-xs text-slate-500  mt-0.5">Nakshatra compatibility matrix updated.</p>
                  <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile & Logout */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100  transition-colors border border-transparent hover:border-slate-200 "
          >
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              A
            </div>
            <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white  rounded-2xl shadow-xl border border-slate-200  py-2 z-50 animate-scaleUp">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push('/admin/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700  hover:bg-slate-50  flex items-center gap-2.5"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Site Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push('/');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700  hover:bg-slate-50  flex items-center gap-2.5"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  View Live Site
                </button>
              </div>
              <div className="border-t border-slate-100  pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50  flex items-center gap-2.5 font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
