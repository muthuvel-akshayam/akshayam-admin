'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { setUserLocale } from '@/services/locale';

export default function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ta' : 'en';
    startTransition(() => {
      setUserLocale(nextLocale);
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
      title={t('toggleLanguage')}
    >
      {locale === 'en' ? 'தமிழ்' : 'English'}
    </button>
  );
}
