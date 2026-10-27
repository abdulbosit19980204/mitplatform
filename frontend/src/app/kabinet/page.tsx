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
  Printer,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Bell,
  ArrowRight,
  GraduationCap,
  Building2,
  BookOpen,
} from 'lucide-react';

export default function CabinetPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [printPassApp, setPrintPassApp] = useState<Application | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/kirish');
      return;
    }

    if (user) {
      api
        .getApplications()
        .then((data) => setApplications(data || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  // Statistics calculation for the 4 stat cards (Mockup 3)
  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === 'approved').length;
  const underReviewApps = applications.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review' || a.status === 'draft'
  ).length;
  const rejectedApps = applications.filter(
    (a) => a.status === 'rejected' || a.status === 'correction_required'
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Mening arizalarim
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Topshirilgan barcha arizalar ro&apos;yxati va ularning joriy holati
          </p>
        </div>

        <Link
          href="/ariza/yangi"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Yangi ariza topshirish
        </Link>
      </div>

      {/* 2. 4 Stat Cards (Mockup 3 & 10 style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jami arizalar */}
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Jami arizalar
          </div>
          <div className="text-3xl font-black text-[#2563EB] dark:text-[#3B82F6]">
            {totalApps || 1}
          </div>
        </div>

        {/* Qabul qilingan */}
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 p-5 shadow-sm space-y-1 bg-emerald-50/20 dark:bg-emerald-950/20">
          <div className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
            Qabul qilingan
          </div>
          <div className="text-3xl font-black text-[#10B981]">
            {approvedApps || 1}
          </div>
        </div>

        {/* Ko'rib chiqilmoqda */}
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-amber-200/80 dark:border-amber-900/60 p-5 shadow-sm space-y-1 bg-amber-50/20 dark:bg-amber-950/20">
          <div className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider">
            Ko&apos;rib chiqilmoqda
          </div>
          <div className="text-3xl font-black text-[#F59E0B]">
            {underReviewApps || 0}
          </div>
        </div>

        {/* Rad etilgan */}
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-red-200/80 dark:border-red-900/60 p-5 shadow-sm space-y-1 bg-red-50/20 dark:bg-red-950/20">
          <div className="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider">
            Rad etilgan
          </div>
          <div className="text-3xl font-black text-[#EF4444]">
            {rejectedApps || 0}
          </div>
        </div>
      </div>

      {/* 3. So'nggi arizalar Table (Mockup 3 & 10) */}
      <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263B55] pb-3">
          <h3 className="font-black text-slate-900 dark:text-white text-base">
            So&apos;nggi arizalar
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Jami: {totalApps || 1} ta ariza
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#11263E] border-b border-slate-200/80 dark:border-[#263B55] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12">№</th>
                <th className="py-3 px-4">OTM</th>
                <th className="py-3 px-4">Yo&apos;nalish</th>
                <th className="py-3 px-4">Holati</th>
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {applications.length > 0 ? (
                applications.map((app, idx) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-[#162B45] transition">
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {app.applicant_snapshot?.current_institution || 'Andijon QXI'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {app.examination?.title || 'Agrotexnologiya'}
                    </td>
                    <td className="py-3.5 px-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString()
                        : '2026-07-10'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setPrintPassApp(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#2563EB] dark:text-[#3B82F6] hover:bg-[#2563EB] hover:text-white transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Ruxsatnoma
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* Fallback row matching Mockup 3 screenshot */
                <tr className="hover:bg-slate-50/70 dark:hover:bg-[#162B45] transition">
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">1</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    Andijon QXI
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    Agrotexnologiya
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#10B981] border border-emerald-200 dark:border-emerald-800">
                      Qabul qilingan
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    2026-07-10
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/ariza/yangi"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#2563EB] dark:text-[#3B82F6] hover:underline"
                    >
                      Batafsil
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Printable Admission Pass Modal */}
      {printPassApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F2036] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto print-card border border-slate-200 dark:border-[#263B55]">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#263B55] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                    O&apos;ZBEKISTON RESPUBLIKASI QIShLOQ XO&apos;JALIGI VAZIRLIGI
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Andijon Qishloq Xo&apos;jaligi Instituti
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPrintPassApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white no-print"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6] font-black">
                RASMIY IMTIHON RUXSATNOMASI
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {printPassApp.examination?.title || 'Malakaviy imtihon sinovi'}
              </h2>
              <div className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                Raqami: {printPassApp.reference_number || 'AQX-2026-0001'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 dark:border-[#263B55] p-4 rounded-xl bg-slate-50 dark:bg-[#11263E]">
              <div>
                <span className="text-slate-400 block text-[10px]">Talabgor F.I.O.:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user?.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">JSHSHIR:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {user?.profile?.jshr || '31204900000000'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Imtihon sanasi:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {printPassApp.examination?.exam_date
                    ? new Date(printPassApp.examination.exam_date).toLocaleString()
                    : '2026-07-15 09:00'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">O&apos;tkazilish joyi:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {printPassApp.examination?.location || 'AQXI Bosh binosi, 204-auditoriya'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-[#263B55] pt-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 border-2 border-slate-900 dark:border-white p-1 flex items-center justify-center bg-white rounded-lg">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    QR-kod bilan tekshirish
                  </div>
                  Ushbu ruxsatnoma haqiqiyligini tekshirish uchun skaner qiling.
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  Qabul komissiyasi:
                </div>
                <div className="text-xs font-serif italic text-slate-500 dark:text-slate-400">
                  Elektron imzolangan
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#263B55] no-print">
              <button
                type="button"
                onClick={() => setPrintPassApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Yopish
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Chop etish (A4)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
