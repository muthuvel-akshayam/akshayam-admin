'use client';

// ==========================================
// BADGE PRIMITIVE
// ==========================================

import React from 'react';
import { STATUS_STYLES } from '../../../lib/admin/constants';
import { ProfileStatus } from '../../../types/admin';

export interface BadgeProps {
  status?: ProfileStatus | 'ACTIVE' | 'SUSPENDED' | 'DELETED' | string;
  variant?: 'emerald' | 'amber' | 'rose' | 'slate' | 'blue';
  children?: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  children,
  showDot = true,
  className = '',
}) => {
  if (status && status in STATUS_STYLES) {
    const style = STATUS_STYLES[status as keyof typeof STATUS_STYLES];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${className}`}
      >
        {showDot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />}
        {children || style.label || status}
      </span>
    );
  }

  const variants = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200   ',
    amber: 'bg-amber-50 text-amber-700 border-amber-200   ',
    rose: 'bg-rose-50 text-rose-700 border-rose-200   ',
    blue: 'bg-blue-50 text-blue-700 border-blue-200   ',
    slate: 'bg-slate-100 text-slate-700 border-slate-200   ',
  };

  const selectedVariant = variants[variant || 'slate'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${selectedVariant} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === 'emerald' ? 'bg-emerald-500' : variant === 'amber' ? 'bg-amber-500' : variant === 'rose' ? 'bg-rose-500' : 'bg-slate-500'
          }`}
        />
      )}
      {children || status}
    </span>
  );
};

export default Badge;
