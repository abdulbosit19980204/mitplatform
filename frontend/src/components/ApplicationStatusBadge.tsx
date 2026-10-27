'use client';

import React from 'react';
import { ApplicationStatus } from '@/types';
import { useTranslation } from '@/lib/locales';

interface Props {
  status: ApplicationStatus | string;
  className?: string;
}

export const ApplicationStatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case 'submitted':
        return {
          label: t.status.submitted,
          bg: 'bg-blue-50 text-[#245B82] border-[#245B82]/20',
          dot: 'bg-[#245B82]',
        };
      case 'under_review':
        return {
          label: t.status.under_review,
          bg: 'bg-amber-50 text-[#B7791F] border-[#B7791F]/30',
          dot: 'bg-[#B7791F]',
        };
      case 'correction_required':
        return {
          label: t.status.correction_required,
          bg: 'bg-orange-50 text-[#B7791F] border-[#B7791F]/40 font-semibold',
          dot: 'bg-[#B7791F] animate-pulse',
        };
      case 'approved':
        return {
          label: t.status.approved,
          bg: 'bg-emerald-50 text-[#16803C] border-[#16803C]/30 font-medium',
          dot: 'bg-[#16803C]',
        };
      case 'rejected':
        return {
          label: t.status.rejected,
          bg: 'bg-red-50 text-[#C0392B] border-[#C0392B]/30',
          dot: 'bg-[#C0392B]',
        };
      case 'completed':
        return {
          label: t.status.completed,
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-600',
        };
      case 'draft':
      default:
        return {
          label: t.status.draft,
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
