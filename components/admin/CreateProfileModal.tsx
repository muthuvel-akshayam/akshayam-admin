'use client';

// ==========================================
// CREATE PROFILE MODAL COMPONENT
// ==========================================

import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { AdminProfile } from '../../types/admin';
import { createProfileAction } from '../../actions/admin/profile.actions';
import { RELIGIONS_LIST, CASTES_LIST, NAKSHATRAS_LIST } from '../../lib/admin/constants';

export interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: AdminProfile) => void;
}

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    gender: 'FEMALE',
    age: '24',
    religion: 'Hindu',
    caste: 'Brahmin - Iyer',
    nakshatra: 'Ashwini',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    aboutMe: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city) {
      showToast('Please complete all required fields.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await createProfileAction({
        ...formData,
        age: Number(formData.age),
      });

      if (res.success && res.data) {
        showToast(`Profile created for ${res.data.name}!`, 'success');
        if (onSuccess) onSuccess(res.data);
        onClose();
        setFormData({
          name: '',
          gender: 'FEMALE',
          age: '24',
          religion: 'Hindu',
          caste: 'Brahmin - Iyer',
          nakshatra: 'Ashwini',
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          aboutMe: '',
        });
      } else {
        showToast(res.error || 'Creation failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      title="Create New Profile"
      subtitle="Direct admin registration (Bypasses verification queue as APPROVED & LIVE)"
      maxWidth="2xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit} isLoading={isLoading}>
            Create Approved Profile
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <div className="p-3 rounded-xl bg-emerald-50  border border-emerald-200  text-emerald-800  text-xs mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Profiles created by administrators are immediately published to live public search.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lakshmi Narayanan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none font-semibold"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Age (Years) *</label>
            <input
              type="number"
              min={18}
              max={80}
              required
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Religion *</label>
            <select
              value={formData.religion}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none font-semibold"
            >
              {RELIGIONS_LIST.map((rel) => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Caste *</label>
            <select
              value={formData.caste}
              onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none font-semibold"
            >
              {CASTES_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Nakshatra *</label>
            <select
              value={formData.nakshatra}
              onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none font-semibold"
            >
              {NAKSHATRAS_LIST.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">City *</label>
            <input
              type="text"
              required
              placeholder="e.g. Coimbatore"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">State *</label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  uppercase mb-1">About Me</label>
          <textarea
            rows={3}
            placeholder="Brief bio or partner expectations..."
            value={formData.aboutMe}
            onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateProfileModal;
