import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Akshayam Matrimony | Owners & Admin Console',
  description: 'Dedicated administration portal for matrimonial profile moderation, astrological matching, and platform analytics.',
};

export default function AdminPortalLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-center space-y-8 animate-fadeIn">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/30 text-3xl font-extrabold text-white">
          AM
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
            <span>🛡️</span> Protected Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Owners & Admin Portal
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Welcome to the dedicated administration console for <span className="text-emerald-400 font-semibold">Akshayam Matrimony</span>. Manage biodatas, inspect horoscope charts, and monitor demographic analytics.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5 transition-all duration-200 text-base"
          >
            <span>Enter Dashboard Console</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database Connected (Port 8000)</span>
          </div>
          <div>
            <span>Role-Based Security Enforced</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500 font-medium">
        &copy; {new Date().getFullYear()} Akshayam Matrimony. All rights reserved.
      </div>
    </div>
  );
}
