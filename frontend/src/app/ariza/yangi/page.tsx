'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RegistrationFormWizard } from '@/components/RegistrationFormWizard';

function WizardContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('exam');
  const appId = searchParams.get('app');

  return (
    <div className="py-6">
      <RegistrationFormWizard existingAppId={appId || undefined} />
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-slate-400">Yuklanmoqda...</div>}>
      <WizardContent />
    </Suspense>
  );
}
