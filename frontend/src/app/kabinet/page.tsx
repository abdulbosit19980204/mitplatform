'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Application } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge';
import {
  FileText,
  PlusCircle,
  AlertCircle,
  Calendar,
  Clock,
  ChevronRight,
  RefreshCw,
  Printer,
  User as UserIcon,
  CheckCircle,
} from 'lucide-react';

export default function CabinetPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/kirish');
      return;
    }

    if (user) {
      api
        .getApplications()
        .then((data) => setApplications(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.nav.cabinet}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Xush kelibsiz, <strong>{user?.full_name}</strong> ({user?.email})
          </p>
        </div>

        <Link
          href="/ariza/yangi"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Yangi ariza topshirish
        </Link>
      </div>

      {/* Applications list */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          {t.nav.myApplications}
        </h2>

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Hali arizalar mavjud emas</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kerakli imtihonga ro&apos;yxatdan o&apos;tish uchun yangi ariza yarating.
              </p>
            </div>
            <Link
              href="/ariza/yangi"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-[#245B82] text-white"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Ariza yaratish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4 hover:border-[#80B4DB] transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#16324F] bg-slate-100 px-2 py-0.5 rounded tracking-wide">
                        {app.reference_number}
                      </span>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-1">
                      {app.examination?.title || (app as any).examination_title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* If correction required, direct link to edit/resubmit */}
                    {app.status === 'correction_required' && (
                      <Link
                        href={`/ariza/yangi?app=${app.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm animate-pulse"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Tuzatish kiritish
                      </Link>
                    )}

                    {app.status === 'approved' && (
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Ruxsatnomani chop etish
                      </button>
                    )}

                    <Link
                      href={`/ariza/yangi?app=${app.id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-[#245B82] hover:bg-blue-50 transition"
                    >
                      Batafsil
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Reviewer comment alert if correction_required */}
                {app.status === 'correction_required' && app.correction_notes && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Qabul komissiyasi eslatmasi:</div>
                      <div className="mt-0.5">{app.correction_notes}</div>
                    </div>
                  </div>
                )}

                {/* Rejection reason if rejected */}
                {app.status === 'rejected' && app.rejection_reason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Rad etish sababi:</div>
                      <div className="mt-0.5">{app.rejection_reason}</div>
                    </div>
                  </div>
                )}

                {/* Details Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-4">
                    <span>
                      Topshirilgan sana: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Topshirilmagan (Qoralama)'}
                    </span>
                    {app.documents_count && (
                      <span>
                        Hujjatlar: {app.documents_count.approved}/{app.documents_count.total} tasdiqlangan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
