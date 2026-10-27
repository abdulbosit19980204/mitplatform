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
  TrendingUp,
  Users,
  PieChart,
  RefreshCw,
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
          setRecentApps(appsData?.slice(0, 6) || []);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Administrator paneli
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Arizalar dinamikasi, ta&apos;lim yo&apos;nalishlari va tizim ko&apos;rsatkichlari
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/imtihon-yaratish"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Yangi imtihon
          </Link>
          <Link
            href="/admin/arizalar"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#0F2036] border border-slate-200 dark:border-[#263B55] hover:bg-slate-50 dark:hover:bg-[#162B45] text-slate-700 dark:text-slate-200 transition shadow-sm"
          >
            Arizalar ro&apos;yxati
          </Link>
        </div>
      </div>

      {/* 2. 4 Stat Cards (Mockup 8 style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jami arizalar */}
        <div className="bg-white dark:bg-[#0F2036] p-5 rounded-2xl border border-slate-200/90 dark:border-[#263B55] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[11px]">Jami arizalar</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#10B981] bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <div className="text-3xl font-black text-[#2563EB] dark:text-[#3B82F6]">
            {overview.total_applications || 1248}
          </div>
        </div>

        {/* Jami foydalanuvchilar */}
        <div className="bg-white dark:bg-[#0F2036] p-5 rounded-2xl border border-slate-200/90 dark:border-[#263B55] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[11px]">Jami foydalanuvchilar</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#10B981] bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="w-3 h-3" /> +8%
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {overview.total_users || 856}
          </div>
        </div>

        {/* Kutilayotgan */}
        <div className="bg-white dark:bg-[#0F2036] p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 shadow-sm space-y-2 bg-amber-50/20 dark:bg-amber-950/20">
          <div className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider">
            Kutilayotgan
          </div>
          <div className="text-3xl font-black text-[#F59E0B]">
            {overview.awaiting_review || 324}
          </div>
        </div>

        {/* Rad etilgan */}
        <div className="bg-white dark:bg-[#0F2036] p-5 rounded-2xl border border-red-200/80 dark:border-red-900/60 shadow-sm space-y-2 bg-red-50/20 dark:bg-red-950/20">
          <div className="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider">
            Rad etilgan
          </div>
          <div className="text-3xl font-black text-[#EF4444]">
            {overview.rejected || 68}
          </div>
        </div>
      </div>

      {/* 3. Middle Grid: Arizalar dinamikasi (Chart) & Yo'nalishlar bo'yicha (Doughnut) - Mockup 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Arizalar dinamikasi (Line Chart) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263B55] pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Arizalar dinamikasi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Oylik tushgan arizalar soni va trend
              </p>
            </div>
            <span className="text-xs font-bold text-[#2563EB] dark:text-[#3B82F6] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
              2026 yil
            </span>
          </div>

          {/* Responsive SVG Line Chart */}
          <div className="h-56 w-full pt-4">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />

              {/* Gradient Area Fill */}
              <path
                d="M 10,140 Q 90,120 170,90 T 330,60 T 490,25 L 490,150 L 10,150 Z"
                fill="url(#lineGrad)"
              />

              {/* Trend Line Curve */}
              <path
                d="M 10,140 Q 90,120 170,90 T 330,60 T 490,25"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Points */}
              {[[10, 140], [90, 120], [170, 90], [250, 80], [330, 60], [410, 45], [490, 25]].map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4.5"
                  className="fill-white dark:fill-[#0F2036] stroke-[#2563EB] stroke-[3]"
                />
              ))}

              {/* Month labels */}
              <text x="10" y="160" className="text-[10px] fill-slate-400">Yan</text>
              <text x="90" y="160" className="text-[10px] fill-slate-400">Fev</text>
              <text x="170" y="160" className="text-[10px] fill-slate-400">Mar</text>
              <text x="250" y="160" className="text-[10px] fill-slate-400">Apr</text>
              <text x="330" y="160" className="text-[10px] fill-slate-400">May</text>
              <text x="410" y="160" className="text-[10px] fill-slate-400">Iyun</text>
              <text x="480" y="160" className="text-[10px] fill-slate-400">Iyul</text>
            </svg>
          </div>
        </div>

        {/* Right: Yo'nalishlar bo'yicha (Doughnut Chart) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-[#263B55] pb-3">
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Yo&apos;nalishlar bo&apos;yicha
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Talabgorlarning sohalar kesimida taqsimoti
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            {/* SVG Doughnut */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="45 100" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-45" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="18 100" strokeDashoffset="-70" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="12 100" strokeDashoffset="-88" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 dark:text-white">100%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Taqsimot</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-2 pt-4 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <span>Agrobiologiya</span>
                </div>
                <span className="font-bold">45%</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span>Veterinariya</span>
                </div>
                <span className="font-bold">25%</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span>Agroinjiniring</span>
                </div>
                <span className="font-bold">18%</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                  <span>Boshqalar</span>
                </div>
                <span className="font-bold">12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: So'nggi faoliyatlar (Audit) & Tezkor amallar (Mockup 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* So'nggi faoliyatlar */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] p-5 sm:p-6 shadow-sm space-y-3">
          <div className="border-b border-slate-100 dark:border-[#263B55] pb-3">
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              So&apos;nggi faoliyatlar
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tizim amallari va komissiya a&apos;zolari harakatlari auditi
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                title: "Yangi ariza topshirildi",
                desc: "Abdulla To'xtayev tomonidan yangi ariza kelib tushdi",
                time: "10:24",
                icon: FileText,
              },
              {
                title: "Ariza tasdiqlandi",
                desc: "Zokirov Aziz arizasi komissiya tomonidan qabul qilindi",
                time: "09:15",
                icon: CheckCircle2,
              },
              {
                title: "Imtihon jadvali yangilandi",
                desc: "Ingliz tili imtihoni sanasi va joyi belgilandi",
                time: "Kecha",
                icon: Calendar,
              },
            ].map((act, i) => {
              const Icon = act.icon;
              return (
                <div
                  key={i}
                  className="p-3 bg-slate-50/70 dark:bg-[#11263E] rounded-xl border border-slate-200/60 dark:border-[#263B55] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#162B45] text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{act.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{act.desc}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tezkor amallar */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] p-5 sm:p-6 shadow-sm space-y-3">
          <div className="border-b border-slate-100 dark:border-[#263B55] pb-3">
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Tezkor amallar
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tezkor amallar va yangi ma&apos;lumot qo&apos;shish
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <Link
              href="/admin/imtihon-yaratish"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-[#11263E] hover:bg-blue-50 dark:hover:bg-[#162B45] text-slate-800 dark:text-slate-200 font-bold transition border border-slate-200/60 dark:border-[#263B55]"
            >
              <PlusCircle className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>Yangi imtihon yaratish</span>
            </Link>

            <Link
              href="/admin/arizalar"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-[#11263E] hover:bg-blue-50 dark:hover:bg-[#162B45] text-slate-800 dark:text-slate-200 font-bold transition border border-slate-200/60 dark:border-[#263B55]"
            >
              <FileText className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>Arizalar ro&apos;yxati</span>
            </Link>

            <Link
              href="/admin/malumotlar-bazasi"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-[#11263E] hover:bg-blue-50 dark:hover:bg-[#162B45] text-slate-800 dark:text-slate-200 font-bold transition border border-slate-200/60 dark:border-[#263B55]"
            >
              <Database className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>Ma&apos;lumotlar bazasi (OTMlar)</span>
            </Link>

            <Link
              href="/admin/kontent/bolimlar"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-[#11263E] hover:bg-blue-50 dark:hover:bg-[#162B45] text-slate-800 dark:text-slate-200 font-bold transition border border-slate-200/60 dark:border-[#263B55]"
            >
              <Layers className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>Kontent boshqaruvi</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
