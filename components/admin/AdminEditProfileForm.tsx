'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ui/Toast';
import Button from './ui/Button';
import { editProfileAction } from '../../actions/admin/profile.actions';
import { RELIGIONS_LIST, CASTES_LIST, NAKSHATRAS_LIST, KOOTTAM_LIST, RASI_LIST, DOSHAM_LIST, SUB_CASTES_MAP } from '../../lib/admin/constants';

interface AdminEditProfileFormProps {
  profile: any;
}

export default function AdminEditProfileForm({ profile }: AdminEditProfileFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  
  // Format Date to YYYY-MM-DD for input type="date"
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<any>({
    ...profile,
    dob: formatDate(profile.dob)
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' && value !== '' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const allowedFields = [
        'name', 'gender', 'livingCountry', 'state', 'city', 'religion', 'caste', 
        'subCaste', 'koottam', 'dob', 'tob', 'lob', 'height', 'weight', 
        'physicalCondition', 'skinColour', 'maritalStatus', 'familyStatus', 
        'foodHabits', 'drinkingHabits', 'smokingHabits', 'rasi', 'nakshatra', 
        'poruthaNakshatram', 'dosham', 'dasaBalance', 'houseAddress'
      ];
      
      const dataToSubmit: any = {};
      allowedFields.forEach(field => {
        if (formData[field] !== undefined) {
          dataToSubmit[field] = formData[field];
        }
      });
      
      if (dataToSubmit.dob) {
        dataToSubmit.dob = new Date(dataToSubmit.dob).toISOString();
      }

      const res = await editProfileAction(profile.id, dataToSubmit);
      if (res.success) {
        showToast('Profile updated successfully!', 'success');
        router.push(`/admin/profiles`);
        router.refresh();
      } else {
        showToast(res.error || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'location', label: 'Location & Social' },
    { id: 'physical', label: 'Physical & Habits' },
    { id: 'horoscope', label: 'Horoscope' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
              <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['MALE', 'FEMALE']} required />
              <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
              <Input label="Time of Birth (e.g. 10:30 AM)" name="tob" value={formData.tob} onChange={handleChange} />
              <Input label="Place of Birth" name="lob" value={formData.lob} onChange={handleChange} />
              <Select label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} options={['NEVER MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING DIVORCE']} />
              <Select label="Family Status" name="familyStatus" value={formData.familyStatus} onChange={handleChange} options={['RICH', 'UPPER MIDDLE', 'MIDDLE', 'LOWER MIDDLE', 'POOR']} />
              <div className="md:col-span-2">
                 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">House Address</label>
                 <textarea name="houseAddress" value={formData.houseAddress || ''} onChange={handleChange} rows={3} className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none" />
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Living Country" name="livingCountry" value={formData.livingCountry} onChange={handleChange} required />
              <Input label="State" name="state" value={formData.state} onChange={handleChange} required />
              <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
              <Select label="Religion" name="religion" value={formData.religion} onChange={handleChange} options={RELIGIONS_LIST} required />
              <Select label="Caste" name="caste" value={formData.caste} onChange={handleChange} options={CASTES_LIST} required />
              <Input label="Sub Caste" name="subCaste" value={formData.subCaste} onChange={handleChange} />
              <Select label="Koottam" name="koottam" value={formData.koottam} onChange={handleChange} options={KOOTTAM_LIST} />
            </div>
          )}

          {activeTab === 'physical' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} required />
              <Input label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} required />
              <Select label="Physical Condition" name="physicalCondition" value={formData.physicalCondition} onChange={handleChange} options={['AVERAGE', 'ATHLETIC', 'SLIM', 'HEAVY', 'PHYSICALLY CHALLENGED']} required />
              <Input label="Skin Colour" name="skinColour" value={formData.skinColour} onChange={handleChange} required />
              <Select label="Food Habits" name="foodHabits" value={formData.foodHabits} onChange={handleChange} options={['VEGETARIAN', 'NON_VEGETARIAN', 'EGGETARIAN', 'DOES_NOT_MATTER']} required />
              <Select label="Drinking Habits" name="drinkingHabits" value={formData.drinkingHabits} onChange={handleChange} options={['NO', 'OCCASIONALLY', 'YES', 'DOES_NOT_MATTER']} required />
              <Select label="Smoking Habits" name="smokingHabits" value={formData.smokingHabits} onChange={handleChange} options={['NO', 'OCCASIONALLY', 'YES', 'DOES_NOT_MATTER']} required />
            </div>
          )}

          {activeTab === 'horoscope' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Rasi" name="rasi" value={formData.rasi} onChange={handleChange} options={RASI_LIST} />
              <Select label="Nakshatra" name="nakshatra" value={formData.nakshatra} onChange={handleChange} options={NAKSHATRAS_LIST} />
              <Select label="Dosham" name="dosham" value={formData.dosham} onChange={handleChange} options={DOSHAM_LIST} />
              <Input label="Dasa Balance (e.g. 5 Years 2 Months)" name="dasaBalance" value={formData.dasaBalance} onChange={handleChange} />
              <div className="md:col-span-2">
                 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Porutha Nakshatram (comma separated)</label>
                 <textarea 
                   name="poruthaNakshatram" 
                   value={Array.isArray(formData.poruthaNakshatram) ? formData.poruthaNakshatram.join(', ') : (formData.poruthaNakshatram || '')} 
                   onChange={(e) => setFormData({...formData, poruthaNakshatram: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                   rows={3} 
                   className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none" 
                   placeholder="Aswini, Bharani, etc..."
                 />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

// Helper Components
function Input({ label, name, type = 'text', value, onChange, required }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none bg-white text-slate-900"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options, required }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none bg-white text-slate-900 font-medium"
      >
        <option value="">-- Select --</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
