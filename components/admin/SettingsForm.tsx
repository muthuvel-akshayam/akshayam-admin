'use client';

// ==========================================
// SYSTEM SETTINGS FORM COMPONENT
// ==========================================

import React, { useState } from 'react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { AdminSettings } from '@/types/admin';
import { updateSettingsAction } from '@/actions/admin/settings.actions';

export interface SettingsFormProps {
  initialSettings: AdminSettings;
  onSaveSuccess?: (newSettings: AdminSettings) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  initialSettings,
  onSaveSuccess,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<AdminSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'moderation' | 'maintenance'>('general');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await updateSettingsAction(formData);
      if (res.success && res.data) {
        showToast('System configuration saved successfully!', 'success');
        if (onSaveSuccess) onSaveSuccess(res.data);
      } else {
        showToast(res.error || 'Failed to update configuration', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white  rounded-2xl border border-slate-200  shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar Navigation for Settings */}
      <div className="w-full md:w-64 bg-slate-50  p-4 border-b md:border-b-0 md:border-r border-slate-200  space-y-1">
        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Configuration
        </p>
        {[
          { id: 'general', label: 'General Information', icon: '🏢' },
          { id: 'moderation', label: 'Moderation & Approval', icon: '🛡️' },
          { id: 'maintenance', label: 'Maintenance Mode', icon: '🛠️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            type="button"
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-600  hover:bg-slate-100 '
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Settings Editor Area */}
      <form onSubmit={handleSubmit} className="flex-1 p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
        {/* Tab 1: General Information */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900 ">General Site Identity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure public matrimonial title and admin contact notification channels.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700  uppercase mb-2">
                  Site Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.siteTitle}
                  onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                  placeholder="Akshayam Matrimony"
                  className="w-full p-3 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700  uppercase mb-2">
                  Contact Notification Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="admin@akshayam.com"
                  className="w-full p-3 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Moderation & Approval */}
        {activeTab === 'moderation' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900 ">Default Profile Moderation Rules</h3>
              <p className="text-xs text-slate-500 mt-0.5">Determine how newly submitted matrimonial profiles are processed into the search engine.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50  border border-slate-200  space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800  uppercase mb-2">
                  Default Registration Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setFormData({ ...formData, defaultApprovalStatus: 'PENDING' })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      formData.defaultApprovalStatus === 'PENDING'
                        ? 'border-emerald-600 bg-white  shadow-sm'
                        : 'border-slate-200  opacity-70 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="defaultApprovalStatus"
                      checked={formData.defaultApprovalStatus === 'PENDING'}
                      onChange={() => {}}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 ">Require Admin Verification (PENDING)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Recommended: Profiles must be manually approved by administrators before appearing in public search.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setFormData({ ...formData, defaultApprovalStatus: 'APPROVED' })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      formData.defaultApprovalStatus === 'APPROVED'
                        ? 'border-emerald-600 bg-white  shadow-sm'
                        : 'border-slate-200  opacity-70 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="defaultApprovalStatus"
                      checked={formData.defaultApprovalStatus === 'APPROVED'}
                      onChange={() => {}}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 ">Auto-Publish Immediately (APPROVED)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Profiles become LIVE on public search instantly upon user registration without waiting for review.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200  flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 ">Enable Email Notifications on Submission</p>
                  <p className="text-xs text-slate-500">Send instant alert to {formData.contactEmail} when a new profile is registered.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications ?? true}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Maintenance Mode */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900 ">System Maintenance & Lockdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Temporarily restrict general user access during database migrations or horoscope updates.</p>
            </div>

            <div
              onClick={() => setFormData({ ...formData, maintenanceMode: !formData.maintenanceMode })}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                formData.maintenanceMode
                  ? 'border-amber-500 bg-amber-50/50  shadow-md'
                  : 'border-slate-200  bg-slate-50 '
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${formData.maintenanceMode ? 'bg-amber-100 text-amber-700  ' : 'bg-slate-200 text-slate-600  '}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-extrabold text-base text-slate-900  flex items-center gap-2">
                    Maintenance Mode
                    {formData.maintenanceMode && (
                      <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase">Active</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-600  mt-1 max-w-lg">
                    When enabled, non-admin users will see a maintenance screen. Administrators can continue accessing this console normally.
                  </p>
                </div>
              </div>

              <div className={`w-14 h-8 rounded-full transition-colors flex items-center p-1 shrink-0 ${formData.maintenanceMode ? 'bg-amber-600 justify-end' : 'bg-slate-300  justify-start'}`}>
                <span className="w-6 h-6 rounded-full bg-white shadow-md block transition-transform" />
              </div>
            </div>
          </div>
        )}

        {/* Footer Submit Button */}
        <div className="pt-6 border-t border-slate-200  flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setFormData(initialSettings)} disabled={isLoading}>
            Reset Changes
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="px-6">
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;
