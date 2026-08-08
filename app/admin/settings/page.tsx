import React from 'react';
import { getSettings } from '../../../services/admin/settings.service';
import SettingsForm from '../../../components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 ">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900  tracking-tight">
            System & Site Configuration
          </h1>
          <p className="text-sm text-slate-500  mt-1">
            Manage global matrimonial branding, notification channels, default moderation approval rules, and maintenance mode.
          </p>
        </div>
      </div>

      {/* Settings Form Suite */}
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
