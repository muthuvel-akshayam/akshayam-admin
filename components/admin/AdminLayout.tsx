'use client';

// ==========================================
// ADMIN LAYOUT COMPONENT WRAPPER
// ==========================================

import React, { useState, Suspense } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { ToastProvider } from './ui/Toast';

export interface AdminLayoutProps {
  children: React.ReactNode;
  pendingCount?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  pendingCount = 14,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50  text-slate-800  flex">
        {/* Sidebar */}
        <Suspense fallback={<div className="w-72 hidden lg:block" />}>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            pendingCount={pendingCount}
          />
        </Suspense>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
          {/* Topbar */}
          <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

export default AdminLayout;
