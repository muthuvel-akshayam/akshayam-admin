'use client';

import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { AdminProfile } from '../../types/admin';
import { createProfileAction } from '../../actions/admin/profile.actions';
import { useTranslations } from 'next-intl';
import { supabaseAdmin } from '../../lib/admin/supabase';
import { 
  RELIGIONS_LIST, 
  CASTES_LIST, 
  SUB_CASTES_MAP,
  KOOTTAM_LIST,
  RASI_LIST,
  NAKSHATRAS_LIST,
  DOSHAM_LIST 
} from '../../lib/admin/constants';

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
  const t = useTranslations('createProfile');
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const STEPS = [
    t('steps.personal'),
    t('steps.family'),
    t('steps.expectations')
  ];

  const [formData, setFormData] = useState({
    // Account & Personal Info
    mobileNumber: '',
    whatsappProfileDeliveryNumber: '',
    password: '',
    name: '',
    gender: 'Male',
    livingCountry: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    houseAddress: '',
    houseLocation: '',
    religion: 'Hindu',
    caste: 'Kongu Vellala Gounder',
    subCaste: '',
    koottam: '',
    dateOfBirth: '',
    timeOfBirth: '',
    timeOfBirthAMPM: 'AM',
    placeOfBirth: '',
    rasi: '',
    nakshatra: '',
    dosham: '',
    poruthaNakshatram: [] as string[],
    height: '',
    weight: '',
    physicalStatus: 'Average',
    complexion: 'Any',
    maritalStatus: 'NEVER_MARRIED',
    // Previous Marriage & Children
    yearOfMarriage: '',
    yearOfDivorce: '',
    haveChildren: 'No',
    numberOfChildren: '',
    childrenGender: '',
    childrenAge: '',
    aboutMe: '',

    // Family Details & Career
    fatherName: '',
    fatherLivingStatus: 'Alive',
    fatherOccupation: '',
    fatherMobile: '',
    motherName: '',
    motherLivingStatus: 'Alive',
    motherOccupation: '',
    motherMobile: '',
    rentalIncome: '',
    siblings: [] as { name: string; relation: string; status: string }[],
    
    employedIn: 'PRIVATE',
    workNature: 'Job',
    salary: '',
    organisation: '',
    occupationDetails: '',
    workLocation: '',
    workingLocationGoogle: '',

    houseType: '',
    houseSqFt: '',
    siteLand: '',
    thottam: '',
    vacantLand: 'No Vacant Land',
    totalAssetValue: '',
    assetComments: '',
    dowryDetails: '',

    // Expectations
    expectedHeight: '',
    colourPreference: 'Any',
    maxAgeLimit: '',
    dowryExpectation: '',
    preferredFamilyType: 'Any',
    preferredCareerType: 'Job',
    preferredSectors: [] as string[],
    preferredLocations: [] as string[],
    expectedIncome: 'Doesn\'t Matter / Any',
    expectsRentalIncome: false,
    acceptsDivorced: false,
    expectsThottam: false,
    expectsVacantLand: false,
    preferredDistanceRadius: 'Any Distance',
    preferredCities: [] as string[],
    preferredResidentArea: 'Any',
    expectationComments: ''
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [jathakamFile, setJathakamFile] = useState<File | null>(null);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addSibling = () => {
    setFormData(prev => ({
      ...prev,
      siblings: [...prev.siblings, { name: '', relation: 'Elder Brother', status: 'Unmarried' }]
    }));
  };

  const updateSibling = (index: number, key: string, value: string) => {
    setFormData(prev => {
      const newSiblings = [...prev.siblings];
      newSiblings[index] = { ...newSiblings[index], [key]: value };
      return { ...prev, siblings: newSiblings };
    });
  };

  const removeSibling = (index: number) => {
    setFormData(prev => ({
      ...prev,
      siblings: prev.siblings.filter((_, i) => i !== index)
    }));
  };

  const toggleMultiSelect = (key: string, value: string) => {
    setFormData(prev => {
      const arr = prev[key as keyof typeof prev] as string[];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter(item => item !== value) };
      }
      return { ...prev, [key]: [...arr, value] };
    });
  };

  const handleDateInput = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 8) clean = clean.slice(0, 8);
    if (clean.length > 4) {
      clean = `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4)}`;
    } else if (clean.length > 2) {
      clean = `${clean.slice(0, 2)}-${clean.slice(2)}`;
    }
    updateForm('dateOfBirth', clean);
  };

  const handleTimeInput = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 4) clean = clean.slice(0, 4);
    if (clean.length > 2) {
      clean = `${clean.slice(0, 2)}:${clean.slice(2)}`;
    }
    updateForm('timeOfBirth', clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      let photoUrl = '';
      let jathakamUrl = '';

      if (photoFile) {
        const pPath = `photos/${Date.now()}-${photoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { data: pData, error: pErr } = await supabaseAdmin.storage.from('profile-photos').upload(pPath, photoFile);
        if (pErr) throw new Error(`Photo upload failed: ${pErr.message}`);
        const { data: { publicUrl } } = supabaseAdmin.storage.from('profile-photos').getPublicUrl(pPath);
        photoUrl = publicUrl;
      }

      if (jathakamFile) {
        const jPath = `jathagams/${Date.now()}-${jathakamFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { data: jData, error: jErr } = await supabaseAdmin.storage.from('user-documents').upload(jPath, jathakamFile);
        if (jErr) throw new Error(`Jathagam upload failed: ${jErr.message}`);
        const { data: { publicUrl } } = supabaseAdmin.storage.from('user-documents').getPublicUrl(jPath);
        jathakamUrl = publicUrl;
      }

      const payload: any = { 
        ...formData, 
        gender: formData.gender.toUpperCase(),
        timeOfBirth: formData.timeOfBirth ? `${formData.timeOfBirth} ${formData.timeOfBirthAMPM}` : '',
        photoUrl,
        jathakamUrl
      };

      const res = await createProfileAction(payload);
      if (res.success && res.data) {
        showToast(t('toast.success', { name: res.data.name }), 'success');
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        showToast(res.error || t('toast.failed'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || t('toast.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getSubCasteOptions = () => {
    const list = SUB_CASTES_MAP[formData.caste] || ['Not Specified / Any', 'Don\'t wish to specify / Other'];
    if (!list.includes('Not Specified / Any')) {
       list.push('Not Specified / Any');
       list.push('Don\'t wish to specify / Other');
    }
    return list;
  };

  const handleTimeChange = (type: 'h' | 'm' | 'a', val: string) => {
    let [h, m] = (formData.timeOfBirth || '12:00').split(':');
    let isPm = parseInt(h) >= 12;
    let hour12 = parseInt(h) % 12 || 12;

    if (type === 'h') hour12 = parseInt(val);
    if (type === 'm') m = val;
    if (type === 'a') isPm = val === 'PM';

    let hour24 = hour12;
    if (isPm && hour12 !== 12) hour24 += 12;
    if (!isPm && hour12 === 12) hour24 = 0;

    const newTime = `${hour24.toString().padStart(2, '0')}:${m.padStart(2, '0')}`;
    updateForm('timeOfBirth', newTime);
  };

  const getTimeParts = () => {
    if (!formData.timeOfBirth) return { h: '', m: '', a: 'AM' };
    const [hStr, mStr] = formData.timeOfBirth.split(':');
    const h24 = parseInt(hStr);
    const isPm = h24 >= 12;
    const h12 = h24 % 12 || 12;
    return { h: h12.toString(), m: mStr, a: isPm ? 'PM' : 'AM' };
  };

  const timeParts = getTimeParts();

  const renderPersonalStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-bold text-slate-800 mb-3 border-b pb-1">{t('labels.accountInfo')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.mobile')}</label>
            <input type="text" required value={formData.mobileNumber} onChange={(e) => updateForm('mobileNumber', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.password')}</label>
            <input type="password" required value={formData.password} onChange={(e) => updateForm('password', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.whatsapp')}</label>
            <input type="text" value={formData.whatsappProfileDeliveryNumber} onChange={(e) => updateForm('whatsappProfileDeliveryNumber', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-md font-bold text-slate-800 mb-3 border-b pb-1">{t('labels.basicDetails')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.fullName')}</label>
            <input type="text" required value={formData.name} onChange={(e) => updateForm('name', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.gender')}</label>
            <select value={formData.gender} onChange={(e) => updateForm('gender', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Male">{t('options.Male')}</option>
              <option value="Female">{t('options.Female')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.dob')}</label>
            <input type="text" placeholder="DD-MM-YYYY" value={formData.dateOfBirth} onChange={(e) => handleDateInput(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.tob')}</label>
            <div className="flex gap-2">
              <input type="text" placeholder="HH:MM" value={formData.timeOfBirth} onChange={(e) => handleTimeInput(e.target.value)} className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
              <select value={formData.timeOfBirthAMPM} onChange={(e) => updateForm('timeOfBirthAMPM', e.target.value)} className="w-20 sm:w-24 p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none text-center">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.pob')}</label>
            <input type="text" value={formData.placeOfBirth} onChange={(e) => updateForm('placeOfBirth', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.maritalStatus')}</label>
            <select value={formData.maritalStatus} onChange={(e) => updateForm('maritalStatus', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="NEVER_MARRIED">{t('options.NEVER_MARRIED')}</option>
              <option value="DIVORCED">{t('options.DIVORCED')}</option>
              <option value="WIDOWED">{t('options.WIDOWED')}</option>
              <option value="AWAITING_DIVORCE">{t('options.AWAITING_DIVORCE')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.height')}</label>
            <input type="text" placeholder="e.g. 165" value={formData.height} onChange={(e) => updateForm('height', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.weight')}</label>
            <input type="text" placeholder="e.g. 65 kg" value={formData.weight} onChange={(e) => updateForm('weight', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.physicalStatus')}</label>
            <select value={formData.physicalStatus} onChange={(e) => updateForm('physicalStatus', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Average">{t('options.Average')}</option>
              <option value="Slim">{t('options.Slim')}</option>
              <option value="Fat">{t('options.Fat')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.complexion')}</label>
            <select value={formData.complexion} onChange={(e) => updateForm('complexion', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Any">{t('options.Any')}</option>
              <option value="Fair">{t('options.Fair')}</option>
              <option value="Wheatish">{t('options.Wheatish')}</option>
              <option value="Dark">{t('options.Dark')}</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        {['DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE'].includes(formData.maritalStatus) && (
        <div className="mt-4 p-4 border border-slate-200 bg-slate-50 rounded-xl">
          <h4 className="text-sm font-bold text-slate-800 mb-3">{t('labels.prevMarriageDetails')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.yearOfMarriage')}</label>
              <input type="text" placeholder="e.g. 2018" value={formData.yearOfMarriage} onChange={(e) => updateForm('yearOfMarriage', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
            </div>
            {formData.maritalStatus === 'DIVORCED' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.yearOfDivorce')}</label>
                <input type="text" placeholder="e.g. 2022" value={formData.yearOfDivorce} onChange={(e) => updateForm('yearOfDivorce', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
              </div>
            )}
            <div className={formData.maritalStatus !== 'DIVORCED' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.haveChildren')}</label>
              <select value={formData.haveChildren} onChange={(e) => updateForm('haveChildren', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
                <option value="No">{t('options.No')}</option>
                <option value="Yes">{t('options.Yes')}</option>
              </select>
            </div>
            {formData.haveChildren === 'Yes' && (
              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 mt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.numberOfChildren')}</label>
                  <input type="number" placeholder="e.g. 1" value={formData.numberOfChildren} onChange={(e) => updateForm('numberOfChildren', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.childrenGender')}</label>
                  <select value={formData.childrenGender} onChange={(e) => updateForm('childrenGender', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
                    <option value="">{t('labels.childrenGender')}</option>
                    <option value="Boy">{t('options.Boy')}</option>
                    <option value="Girl">{t('options.Girl')}</option>
                    <option value="Both">{t('options.Both')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.childrenAge')}</label>
                  <input type="text" placeholder="e.g. 5 years" value={formData.childrenAge} onChange={(e) => updateForm('childrenAge', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      <div>
        <h3 className="text-md font-bold text-slate-800 mb-3 border-b pb-1">{t('labels.locationRelig')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.country')}</label>
            <input type="text" value={formData.livingCountry} onChange={(e) => updateForm('livingCountry', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.state')}</label>
            <input type="text" value={formData.state} onChange={(e) => updateForm('state', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.city')}</label>
            <input type="text" value={formData.city} onChange={(e) => updateForm('city', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.address')}</label>
            <textarea rows={2} value={formData.houseAddress} onChange={(e) => updateForm('houseAddress', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.religion')}</label>
            <select value={formData.religion} onChange={(e) => updateForm('religion', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              {RELIGIONS_LIST.map((rel) => <option key={rel} value={rel}>{t(`constants.${rel}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.caste')}</label>
            <select value={formData.caste} onChange={(e) => {
                updateForm('caste', e.target.value);
                updateForm('subCaste', ''); 
              }} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              {CASTES_LIST.map((c) => <option key={c} value={c}>{t(`constants.${c}`)}</option>)}
            </select>
          </div>
          {formData.caste !== 'Kongu Vellala Gounder' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.subCaste')}</label>
              <select value={formData.subCaste} onChange={(e) => updateForm('subCaste', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
                <option value="">{t('labels.subCaste')}</option>
                {getSubCasteOptions().map((sc) => <option key={sc} value={sc}>{t(`constants.${sc}`)}</option>)}
              </select>
            </div>
          )}
          
          {formData.caste === 'Kongu Vellala Gounder' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.koottam')}</label>
              <select value={formData.koottam} onChange={(e) => updateForm('koottam', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
                <option value="">{t('labels.koottam')}</option>
                {KOOTTAM_LIST.map((k) => <option key={k} value={k}>{t(`constants.${k}`)}</option>)}
              </select>
            </div>
          )}

          {formData.religion === 'Hindu' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.rasi')}</label>
                <select value={formData.rasi} onChange={(e) => updateForm('rasi', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
                  <option value="">{t('labels.rasi')}</option>
                  {RASI_LIST.map((r) => <option key={r} value={r}>{t(`constants.${r}`)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.nakshatra')}</label>
                <select value={formData.nakshatra} onChange={(e) => updateForm('nakshatra', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
                  <option value="">{t('labels.nakshatra')}</option>
                  {NAKSHATRAS_LIST.map((n) => <option key={n} value={n}>{t(`constants.${n}`)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.dosham')}</label>
                <select value={formData.dosham} onChange={(e) => updateForm('dosham', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
                  <option value="">{t('labels.dosham')}</option>
                  {DOSHAM_LIST.map((d) => <option key={d} value={d}>{t(`constants.${d}`)}</option>)}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">{t('labels.porutham')}</label>
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto border p-3 rounded-xl bg-slate-50">
                  {NAKSHATRAS_LIST.map(n => (
                     <label key={n} className="flex items-center gap-1 text-sm bg-white border px-2 py-1 rounded cursor-pointer hover:bg-slate-50">
                       <input type="checkbox" checked={formData.poruthaNakshatram.includes(n)} onChange={() => toggleMultiSelect('poruthaNakshatram', n)} />
                       <span>{t(`constants.${n}`)}</span>
                     </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderFamilyStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-bold text-slate-800 mb-3 border-b pb-1">{t('labels.parents')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.fatherName')}</label>
            <input type="text" value={formData.fatherName} onChange={(e) => updateForm('fatherName', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.fatherLiving')}</label>
            <select value={formData.fatherLivingStatus} onChange={(e) => updateForm('fatherLivingStatus', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Alive">{t('options.Alive')}</option>
              <option value="Late">{t('options.Late')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.fatherOcc')}</label>
            <input type="text" value={formData.fatherOccupation} onChange={(e) => updateForm('fatherOccupation', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.fatherMob')}</label>
            <input type="text" value={formData.fatherMobile} onChange={(e) => updateForm('fatherMobile', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.motherName')}</label>
            <input type="text" value={formData.motherName} onChange={(e) => updateForm('motherName', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.motherLiving')}</label>
            <select value={formData.motherLivingStatus} onChange={(e) => updateForm('motherLivingStatus', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Alive">{t('options.Alive')}</option>
              <option value="Late">{t('options.Late')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.motherOcc')}</label>
            <input type="text" value={formData.motherOccupation} onChange={(e) => updateForm('motherOccupation', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.motherMob')}</label>
            <input type="text" value={formData.motherMobile} onChange={(e) => updateForm('motherMobile', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3 border-b pb-1">
          <h3 className="text-md font-bold text-slate-800">{t('labels.siblings')}</h3>
          <Button variant="secondary" size="sm" onClick={addSibling}>{t('buttons.addSibling')}</Button>
        </div>
        <div className="space-y-3">
          {formData.siblings.map((sib, i) => (
            <div key={i} className="flex gap-2 items-center p-3 border rounded-xl bg-slate-50 flex-wrap sm:flex-nowrap">
              <input type="text" value={sib.name} onChange={e => updateSibling(i, 'name', e.target.value)} className="flex-1 min-w-[150px] p-2 rounded-lg border border-slate-300" />
              <select value={sib.relation} onChange={e => updateSibling(i, 'relation', e.target.value)} className="flex-1 min-w-[150px] p-2 rounded-lg border border-slate-300">
                <option value="Elder Brother">{t('options.Elder Brother')}</option>
                <option value="Younger Brother">{t('options.Younger Brother')}</option>
                <option value="Elder Sister">{t('options.Elder Sister')}</option>
                <option value="Younger Sister">{t('options.Younger Sister')}</option>
              </select>
              <select value={sib.status} onChange={e => updateSibling(i, 'status', e.target.value)} className="flex-1 min-w-[150px] p-2 rounded-lg border border-slate-300">
                <option value="Unmarried">{t('options.Unmarried')}</option>
                <option value="Married">{t('options.Married')}</option>
              </select>
              <button type="button" onClick={() => removeSibling(i)} className="p-2 text-red-500 font-bold hover:bg-red-50 rounded-lg">{t('buttons.remove')}</button>
            </div>
          ))}
          {formData.siblings.length === 0 && <p className="text-xs text-slate-500">{t('labels.noSiblings')}</p>}
        </div>
      </div>

      <div>
        <h3 className="text-md font-bold text-slate-800 mb-3 border-b pb-1">{t('labels.careerIncome')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.workNature')}</label>
            <select value={formData.workNature} onChange={(e) => updateForm('workNature', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Job">{t('options.Job')}</option>
              <option value="Business">{t('options.Business')}</option>
              <option value="Not Working">{t('options.Not Working')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.salary')}</label>
            <input type="text" value={formData.salary} onChange={(e) => updateForm('salary', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.org')}</label>
            <input type="text" value={formData.organisation} onChange={(e) => updateForm('organisation', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.designation')}</label>
            <input type="text" value={formData.occupationDetails} onChange={(e) => updateForm('occupationDetails', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.workAddress')}</label>
            <input type="text" value={formData.workLocation} onChange={(e) => updateForm('workLocation', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-md font-bold text-slate-800 mb-3 border-b pb-1">{t('labels.property')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.houseType')}</label>
            <select value={formData.houseType} onChange={(e) => updateForm('houseType', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="">{t('options.Select House Type')}</option>
              <option value="RC Own">{t('options.RC Own')}</option>
              <option value="RC Rented">{t('options.RC Rented')}</option>
              <option value="Tiles Roof House">{t('options.Tiles Roof House')}</option>
              <option value="Standard Roof House">{t('options.Standard Roof House')}</option>
              <option value="Rented Roof House">{t('options.Rented Roof House')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.houseSqft')}</label>
            <input type="text" value={formData.houseSqFt} onChange={(e) => updateForm('houseSqFt', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.siteLand')}</label>
            <input type="text" value={formData.siteLand} onChange={(e) => updateForm('siteLand', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.thottam')}</label>
            <input type="text" value={formData.thottam} onChange={(e) => updateForm('thottam', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.vacantLand')}</label>
            <select value={formData.vacantLand} onChange={(e) => updateForm('vacantLand', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="No Vacant Land">{t('options.No Vacant Land')}</option>
              <option value="Residential Plot (in City / Town)">{t('options.Residential Plot (in City / Town)')}</option>
              <option value="Agricultural Land (under 5 Acres)">{t('options.Agricultural Land (under 5 Acres)')}</option>
              <option value="Agricultural Land (above 5 Acres)">{t('options.Agricultural Land (above 5 Acres)')}</option>
              <option value="Commercial Land / Industrial Plot">{t('options.Commercial Land / Industrial Plot')}</option>
              <option value="Other">{t('options.Other')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.totalAsset')}</label>
            <input type="text" value={formData.totalAssetValue} onChange={(e) => updateForm('totalAssetValue', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          {formData.gender === 'Female' && (
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.dowryDetails')}</label>
              <input type="text" value={formData.dowryDetails} onChange={(e) => updateForm('dowryDetails', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderExpectationsStep = () => (
    <div className="space-y-6 animate-fadeIn pb-24">
      <div>
        <h3 className="text-md font-bold text-slate-800 mb-3 border-b pb-1">{t('labels.basicExp')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.expHeight')}</label>
            <input type="text" value={formData.expectedHeight} onChange={(e) => updateForm('expectedHeight', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.colorPref')}</label>
            <select value={formData.colourPreference} onChange={(e) => updateForm('colourPreference', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Any">{t('options.Any')}</option>
              <option value="Fair">{t('options.Fair')}</option>
              <option value="Wheatish">{t('options.Wheatish')}</option>
              <option value="Dark">{t('options.Dark')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.maxAge')}</label>
            <input type="number" value={formData.maxAgeLimit} onChange={(e) => updateForm('maxAgeLimit', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.prefFamily')}</label>
            <select value={formData.preferredFamilyType} onChange={(e) => updateForm('preferredFamilyType', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Any">{t('options.Any')}</option>
              <option value="2 Girls">{t('options.2 Girls')}</option>
              <option value="2 Boys">{t('options.2 Boys')}</option>
              <option value="1 Boy 1 Girl">{t('options.1 Boy 1 Girl')}</option>
            </select>
          </div>
          {formData.gender === 'Male' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.dowryExp')}</label>
              <select value={formData.dowryExpectation} onChange={(e) => updateForm('dowryExpectation', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
                <option value="">{t('options.None')}</option>
                <option value="None">{t('options.None')}</option>
                <option value="Their Wish">{t('options.Their Wish')}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-md font-bold text-slate-800 mb-3 border-b pb-1">{t('labels.careerExp')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.prefCareerType')}</label>
            <select value={formData.preferredCareerType} onChange={(e) => updateForm('preferredCareerType', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Job">{t('options.Job')}</option>
              <option value="Business">{t('options.Business')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.expIncome')}</label>
            <select value={formData.expectedIncome} onChange={(e) => updateForm('expectedIncome', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Doesn't Matter / Any">{t('options.Doesn\'t Matter / Any')}</option>
              <option value="Less than 25,000 (<25k)">{t('options.Less than 25,000 (<25k)')}</option>
              <option value="25,000 - 50,000 (25k-50k)">{t('options.25,000 - 50,000 (25k-50k)')}</option>
              <option value="50,000 - 1,00,000 (50k-1L)">{t('options.50,000 - 1,00,000 (50k-1L)')}</option>
              <option value="1,00,000+ (1L+)">{t('options.1,00,000+ (1L+)')}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">{t('labels.prefSectors')}</label>
            <div className="flex flex-wrap gap-2">
              {(formData.preferredCareerType === 'Job' ? ['IT', 'Doctor', 'Govt', 'Private', 'Garment', 'Other (Job)'] : ['Farmer', 'Garments', 'Other (Business)']).map(sector => (
                <label key={sector} className="flex items-center gap-1 text-sm bg-white border px-2 py-1 rounded cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" checked={formData.preferredSectors.includes(sector)} onChange={() => toggleMultiSelect('preferredSectors', sector)} />
                  <span>{t(`constants.${sector}`)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">{t('labels.prefJobLoc')}</label>
            <div className="flex flex-wrap gap-2">
              {['Chennai', 'Bangalore', 'Coimbatore', 'Tiruppur', 'Erode', 'Foreign', 'Anywhere'].map(loc => (
                <label key={loc} className="flex items-center gap-1 text-sm bg-white border px-2 py-1 rounded cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" checked={formData.preferredLocations.includes(loc)} onChange={() => toggleMultiSelect('preferredLocations', loc)} />
                  <span>{t(`constants.${loc}`)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-md font-bold text-slate-800 mb-3 border-b pb-1">{t('labels.propertyLocExp')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex flex-wrap items-center gap-6 mb-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="exRent" checked={formData.expectsRentalIncome} onChange={(e) => updateForm('expectsRentalIncome', e.target.checked)} className="w-4 h-4" />
              <label htmlFor="exRent" className="text-sm font-bold text-slate-700">{t('labels.expRental')}</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="exThot" checked={formData.expectsThottam} onChange={(e) => updateForm('expectsThottam', e.target.checked)} className="w-4 h-4" />
              <label htmlFor="exThot" className="text-sm font-bold text-slate-700">{t('labels.expThottam')}</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="exVac" checked={formData.expectsVacantLand} onChange={(e) => updateForm('expectsVacantLand', e.target.checked)} className="w-4 h-4" />
              <label htmlFor="exVac" className="text-sm font-bold text-slate-700">{t('labels.expVacant')}</label>
            </div>
            {['DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE'].includes(formData.maritalStatus) && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="acDiv" checked={formData.acceptsDivorced} onChange={(e) => updateForm('acceptsDivorced', e.target.checked)} className="w-4 h-4" />
                <label htmlFor="acDiv" className="text-sm font-bold text-slate-700 text-red-600">{t('labels.acceptDivorced')}</label>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.distancePref')}</label>
            <select value={formData.preferredDistanceRadius} onChange={(e) => updateForm('preferredDistanceRadius', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Any Distance">{t('options.Any Distance')}</option>
              <option value="Within 50 km">{t('options.Within 50 km')}</option>
              <option value="Within 100 km">{t('options.Within 100 km')}</option>
              <option value="Within 250 km">{t('options.Within 250 km')}</option>
              <option value="Within 500 km">{t('options.Within 500 km')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.prefArea')}</label>
            <select value={formData.preferredResidentArea} onChange={(e) => updateForm('preferredResidentArea', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none">
              <option value="Any">{t('options.Any')}</option>
              <option value="North">{t('options.North')}</option>
              <option value="South">{t('options.South')}</option>
              <option value="East">{t('options.East')}</option>
              <option value="West">{t('options.West')}</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.prefCities')}</label>
            <input type="text" value={formData.preferredCities.join(', ')} onChange={(e) => updateForm('preferredCities', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.otherComments')}</label>
            <textarea rows={2} value={formData.expectationComments} onChange={(e) => updateForm('expectationComments', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('labels.aboutMe')}</label>
            <textarea rows={3} value={formData.aboutMe} onChange={(e) => updateForm('aboutMe', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none" />
          </div>

          <div className="sm:col-span-2">
            <h3 className="text-md font-bold text-slate-800 mb-3 border-b pb-1">Upload Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jathagam</label>
                <input type="file" accept=".pdf,image/*" onChange={(e) => setJathakamFile(e.target.files?.[0] || null)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-none text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      title={t('title')}
      subtitle={t('subtitle')}
      maxWidth="3xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <div>
            <span className="text-xs text-slate-500 font-semibold">
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={currentStep === 0 ? onClose : handleBack} disabled={isLoading}>
              {currentStep === 0 ? t('buttons.cancel') : t('buttons.back')}
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button variant="primary" onClick={handleNext}>
                {t('buttons.next')}
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit} isLoading={isLoading}>
                {t('buttons.submit')}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs sm:text-sm pt-2 overflow-y-auto max-h-[70vh] pr-2">
        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          {STEPS.map((step, idx) => (
            <div key={step} className={`flex items-center ${idx <= currentStep ? 'text-emerald-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 ${idx <= currentStep ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                {idx + 1}
              </div>
              <span className="hidden sm:inline font-semibold">{step}</span>
            </div>
          ))}
        </div>

        <form onSubmit={e => e.preventDefault()} className="min-h-[300px]">
          {currentStep === 0 && renderPersonalStep()}
          {currentStep === 1 && renderFamilyStep()}
          {currentStep === 2 && renderExpectationsStep()}
        </form>
      </div>
    </Modal>
  );
};

export default CreateProfileModal;
