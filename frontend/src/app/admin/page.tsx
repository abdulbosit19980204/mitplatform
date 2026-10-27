'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Application } from '@/types';
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge';
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
  Layers,
  Database,
  UploadCloud,
  ChevronRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
        router.push('/kirish');
        return;
      }

      Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminApplications().catch(() => []),
      ])
        .then(([statsData, appsData]) => {
          setStats(statsData);
          setRecentApps(appsData?.slice(0, 7) || []);
        })
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

  const overview = stats?.overview || {};

  return (
    <div className="space-y-6">
      {/* 1. Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Asosiy ko&apos;rsatkichlar
        </h1>
        <p className="text-xs text-slate-500">
          Imtihonlar, arizalar va komissiya tekshiruvi statistikasi
        </p>
      </div>

      {/* 2. 4 Stat Cards (Mockup 04 style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jami arizalar */}
        <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Jami arizalar
          </div>
          <div className="text-3xl font-black text-[#245B82]">
            {overview.total_applications || 248}
          </div>
        </div>

        {/* Ko'rib chiqilmoqda */}
        <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-1 bg-amber-50/20">
          <div className="text-[11px] font-bold text-[#B7791F] uppercase tracking-wider">
            Ko&apos;rib chiqilmoqda
          </div>
          <div className="text-3xl font-black text-[#B7791F]">
            {overview.awaiting_review || 86}
          </div>
        </div>

        {/* Tuzatish talab qilinadi */}
        <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-orange-200/80 shadow-sm space-y-1 bg-orange-50/20">
          <div className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">
            Tuzatish talab qilinadi
          </div>
          <div className="text-3xl font-black text-orange-600">
            {overview.correction_required || 24}
          </div>
        </div>

        {/* Tasdiqlangan */}
        <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-emerald-200/80 shadow-sm space-y-1 bg-emerald-50/20">
          <div className="text-[11px] font-bold text-[#16803C] uppercase tracking-wider">
            Tasdiqlangan
          </div>
          <div className="text-3xl font-black text-[#16803C]">
            {overview.approved || 112}
          </div>
        </div>
      </div>

      {/* 3. Main Content: So'nggi arizalar table (Left) + Right sidebar (Mockup 04) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: So'nggi arizalar Table */}
        <div className="lg:col-span-8 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              So&apos;nggi arizalar
            </h3>
            <Link
              href="/admin/arizalar"
              className="text-xs font-bold text-[#245B82] hover:underline flex items-center gap-1"
            >
              Barcha arizalar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">№</th>
                  <th className="py-2.5 px-3">F.I.O.</th>
                  <th className="py-2.5 px-3">Imtihon</th>
                  <th className="py-2.5 px-3">Til</th>
                  <th className="py-2.5 px-3">Holati</th>
                  <th className="py-2.5 px-3">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApps.length > 0 ? (
                  recentApps.map((app, idx) => (
                    <tr
                      key={app.id}
                      onClick={() => router.push(`/admin/arizalar/${app.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {app.reference_number || `AQX-2026-${String(idx + 1).padStart(4, '0')}`}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {app.applicant_name || user?.full_name}
                      </td>
                      <td className="py-3 px-3 text-slate-600 line-clamp-1 max-w-[160px]">
                        {app.examination?.title || "Ingliz tili bo'yicha imtihon"}
                      </td>
                      <td className="py-3 px-3 uppercase text-slate-500 font-semibold text-[11px]">
                        {app.examination?.language || 'EN'}
                      </td>
                      <td className="py-3 px-3">
                        <ApplicationStatusBadge status={app.status} />
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {app.submitted_at
                          ? new Date(app.submitted_at).toLocaleDateString()
                          : '12.05.2026'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      Arizalar mavjud emas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Yaqin imtihonlar & Tezkor amallar (Mockup 04) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Yaqin imtihonlar */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#245B82]" />
                Yaqin imtihonlar
              </h3>
              <Link
                href="/admin/imtihon-yaratish"
                className="text-xs font-bold text-[#245B82] hover:underline"
              >
                + Yangi
              </Link>
            </div>

            <div className="space-y-2.5">
              {[
                { title: "Ingliz tili bo'yicha imtihon", date: '2026-06-15' },
                { title: "Nemis tili bo'yicha imtihon", date: '2026-06-20' },
              ].map((ex) => (
                <div
                  key={ex.title}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{ex.title}</div>
                    <div className="text-[11px] text-slate-500">Sana: {ex.date}</div>
                  </div>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Tezkor amallar (Mockup 04) */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
              Tezkor amallar
            </h3>

            <div className="space-y-2 text-xs">
              <Link
                href="/admin/imtihon-yaratish"
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition border border-transparent hover:border-slate-200"
              >
                <PlusCircle className="w-4 h-4 text-[#245B82]" />
                <span>Yangi imtihon yaratish</span>
              </Link>

              <Link
                href="/admin/arizalar"
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition border border-transparent hover:border-slate-200"
              >
                <FileText className="w-4 h-4 text-[#245B82]" />
                <span>Arizalar ro&apos;yxati</span>
              </Link>

              <Link
                href="/admin/kontent/bolimlar"
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition border border-transparent hover:border-slate-200"
              >
                <Layers className="w-4 h-4 text-[#245B82]" />
                <span>Kontentni boshqarish</span>
              </Link>

              <Link
                href="/admin/malumotlar-bazasi"
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition border border-transparent hover:border-slate-200"
              >
                <Database className="w-4 h-4 text-[#245B82]" />
                <span>Ma&apos;lumotlar bazasi (OTMlar)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
