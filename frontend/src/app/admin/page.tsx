'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Users,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
        router.push('/kirish');
        return;
      }

      api
        .getAdminStats()
        .then((data) => setStats(data))
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

  const overview = stats?.overview || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            {user?.role === 'admin' ? 'Administrator' : 'Komissiya a\'zosi'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.admin.dashboard}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Imtihonlar, arizalar va hujjatlarni tasdiqlash boshqaruv markazi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/imtihon-yaratish"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Yangi imtihon yaratish
          </Link>
          <Link
            href="/admin/arizalar"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 transition shadow-sm"
          >
            Arizalarni ko&apos;rish
          </Link>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" />
            {t.admin.totalApplications}
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview.total_applications || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200/80 shadow-sm space-y-1 bg-amber-50/20">
          <div className="text-xs text-[#B7791F] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#B7791F]" />
            {t.admin.awaitingReview}
          </div>
          <div className="text-2xl font-black text-[#B7791F]">
            {overview.awaiting_review || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm space-y-1 bg-orange-50/20">
          <div className="text-xs text-orange-700 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            {t.admin.correctionRequired}
          </div>
          <div className="text-2xl font-black text-orange-700">
            {overview.correction_required || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm space-y-1 bg-emerald-50/20">
          <div className="text-xs text-[#16803C] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16803C]" />
            {t.admin.approved}
          </div>
          <div className="text-2xl font-black text-[#16803C]">
            {overview.approved || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm space-y-1 bg-red-50/20">
          <div className="text-xs text-[#C0392B] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-[#C0392B]" />
            {t.admin.rejected}
          </div>
          <div className="text-2xl font-black text-[#C0392B]">
            {overview.rejected || 0}
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Examinations + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Examinations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#245B82]" />
              Yaqinlashib kelayotgan imtihonlar
            </h3>
            <Link
              href="/admin/imtihon-yaratish"
              className="text-xs font-semibold text-[#245B82] hover:underline"
            >
              + Yangi qo&apos;shish
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.upcoming_examinations?.map((ex: any) => (
              <div
                key={ex.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{ex.title}</div>
                  <div className="text-slate-500 mt-0.5">
                    Til: <strong className="uppercase">{ex.language}</strong> | Qabul:{' '}
                    {new Date(ex.registration_end).toLocaleDateString()} gacha
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-[#245B82]">
                  {ex.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              So&apos;nggi amallar (Audit)
            </h3>
          </div>

          <div className="space-y-3">
            {stats?.recent_activity?.slice(0, 6).map((log: any) => (
              <div
                key={log.id}
                className="p-2.5 border-b border-slate-100 last:border-0 text-xs flex items-start justify-between gap-2"
              >
                <div>
                  <div className="font-medium text-slate-900">{log.description}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {log.user_name || 'Tizim'} ({log.user_email || '-'})
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
