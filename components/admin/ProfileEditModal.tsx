'use client';

// ==========================================
// PROFILE EDIT MODAL COMPONENT
// ==========================================

import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { AdminProfile } from '../../types/admin';
import { editProfileAction } from '../../actions/admin/profile.actions';
import { RELIGIONS_LIST, CASTES_LIST, NAKSHATRAS_LIST } from '../../lib/admin/constants';

export interface ProfileEditModalProps {
  profile: AdminProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: AdminProfile) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        gender: profile.gender || 'FEMALE',
        age: profile.age || 25,
        religion: profile.religion || 'Hindu',
        caste: profile.caste || 'Brahmin - Iyer',
        nakshatra: profile.nakshatra || 'Ashwini',
        city: profile.city || 'Chennai',
        state: profile.state || 'Tamil Nadu',
        height: profile.height || '5 ft 5 in',
        aboutMe: profile.aboutMe || '',
      });
    }
  }, [profile]);

  if (!profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await editProfileAction(profile.id, {
        ...formData,
        age: Number(formData.age),
      });

      if (res.success && res.data) {
        showToast('Profile updated successfully!', 'success');
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        showToast(res.error || 'Update failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      title="Edit Profile Details"
      subtitle={`Modify information for ${profile.name} (ID: ${profile.id})`}
      maxWidth="2xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Gender</label>
            <select
              value={formData.gender || 'FEMALE'}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none font-semibold"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Age (Years)</label>
            <input
              type="number"
              min={18}
              max={80}
              required
              value={formData.age || 25}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Religion</label>
            <select
              value={formData.religion || 'Hindu'}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none font-semibold"
            >
              {RELIGIONS_LIST.map((rel) => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Caste</label>
            <select
              value={formData.caste || 'Brahmin - Iyer'}
              onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none font-semibold"
            >
              {CASTES_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">Nakshatra</label>
            <select
              value={formData.nakshatra || 'Ashwini'}
              onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none font-semibold"
            >
              {NAKSHATRAS_LIST.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">City</label>
            <input
              type="text"
              required
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  uppercase mb-1">State</label>
            <input
              type="text"
              required
              value={formData.state || ''}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  uppercase mb-1">About Me</label>
          <textarea
            rows={3}
            value={formData.aboutMe || ''}
            onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-300  bg-white  focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};

export default ProfileEditModal;
