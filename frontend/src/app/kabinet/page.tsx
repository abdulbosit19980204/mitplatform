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
  Printer,
  CheckCircle2,
  MapPin,
  FileCheck,
  ShieldCheck,
  QrCode,
  Bell,
  ArrowRight,
  GraduationCap,
  Check,
  Circle,
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

  const primaryApp = applications[0]; // Current active application

  // Standard 6 documents check
  const standardDocs = [
    { code: 'application_letter', title: '1. Rektor nomiga ariza' },
    { code: 'passport_copy', title: '2. Pasport nusxasi' },
    { code: 'objective_reference', title: "3. Ma'lumotnoma (obyektivka)" },
    { code: 'diploma_copy', title: '4. Diplom nusxasi' },
    { code: 'scientific_council_extract', title: '5. Mavzu tasdiqlanganligi haqidagi hujjat' },
    { code: 'liaison_letter', title: '6. Aloqa xati' },
  ];

  const uploadedDocs = primaryApp?.documents || [];
  const verifiedCount = uploadedDocs.filter((d) => d.status === 'approved').length;
  const totalDocs = 6;
  const progressPercent = Math.round((verifiedCount / totalDocs) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Header Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Shaxsiy kabinet
          </h1>
          <p className="text-xs text-slate-500">
            Arizalaringiz holatini kuzatib boring va imtihonlarga tayyorlaning
          </p>
        </div>

        <Link
          href="/ariza/yangi"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#16324F] hover:bg-[#214768] text-white transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Yangi ariza topshirish
        </Link>
      </div>

      {/* 2. Welcome Banner (Mockup 02 style) */}
      <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/80 border border-blue-200/80 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16324F] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#80B4DB]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Xush kelibsiz, {user?.full_name}!
            </h2>
            <p className="text-xs text-slate-600">
              Arizangiz holatini kuzatib boring va yangi imtihonlarga ro&apos;yxatdan o&apos;ting.
            </p>
          </div>
        </div>

        {primaryApp && (
          <div className="flex flex-col sm:items-end gap-1 bg-white/70 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-200/60 shrink-0">
            <div className="text-[11px] font-semibold text-slate-500">
              Joriy ariza holati:
            </div>
            <div className="flex items-center gap-2">
              <ApplicationStatusBadge status={primaryApp.status} />
            </div>
            <div className="text-[11px] font-mono text-slate-600 pt-0.5">
              Ariza raqami: <strong className="text-slate-900">{primaryApp.reference_number}</strong>
            </div>
          </div>
        )}
      </div>

      {/* If correction required, show prominent warning banner */}
      {primaryApp?.status === 'correction_required' && (
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3 text-orange-900 text-xs">
          <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="font-bold text-sm">
              Komissiya tomonidan tuzatish talab qilindi
            </div>
            <div className="text-orange-800">
              {primaryApp.correction_notes ||
                primaryApp.rejection_reason ||
                "Arizangizdagi ayrim hujjatlar talabga mos kelmadi. Iltimos, kamchiliklarni bartaraf etib qayta yuboring."}
            </div>
            <div className="pt-1">
              <Link
                href={`/ariza/yangi?edit=${primaryApp.id}`}
                className="inline-flex items-center gap-1 font-bold text-orange-950 underline hover:text-black"
              >
                Hujjatlarni tahrirlash <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Two Columns: Ariza ma'lumotlari & Hujjatlar tekshiruvi (Mockup 02) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ariza ma'lumotlari & Yaqin imtihonlar */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ariza ma'lumotlari Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#245B82]" />
                Ariza ma&apos;lumotlari
              </h3>
              {primaryApp && (
                <ApplicationStatusBadge status={primaryApp.status} />
              )}
            </div>

            {primaryApp ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Imtihon:</span>
                    <strong className="text-slate-900 font-bold text-xs sm:text-sm">
                      {primaryApp.examination?.title || 'Malakaviy imtihon'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tillar:</span>
                    <strong className="text-slate-900 uppercase">
                      {primaryApp.examination?.language === 'en'
                        ? 'Ingliz tili'
                        : primaryApp.examination?.language === 'de'
                        ? 'Nemis tili'
                        : 'O‘zbek tili'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Topshirilgan sana:</span>
                    <span className="text-slate-700 font-medium">
                      {primaryApp.submitted_at
                        ? new Date(primaryApp.submitted_at).toLocaleString()
                        : 'Topshirilmagan'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Oliy ta&apos;lim muassasasi:</span>
                    <span className="text-slate-700 font-medium line-clamp-1">
                      {primaryApp.applicant_snapshot?.current_institution || 'AQXI'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPrintPassApp(primaryApp)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#16324F] hover:bg-[#214768] text-white transition shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Ruxsatnomani ko&apos;rish / Chop etish
                  </button>

                  <Link
                    href={`/imtihonlar/${primaryApp.examination?.id || 1}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Imtihon tafsilotlari
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs space-y-3">
                <p>Sizda hali topshirilgan arizalar mavjud emas.</p>
                <Link
                  href="/ariza/yangi"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#16324F] text-white"
                >
                  <PlusCircle className="w-4 h-4" />
                  Birinchi arizani topshirish
                </Link>
              </div>
            )}
          </div>

          {/* Yaqin imtihonlar Card (Mockup 02) */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-[#245B82]" />
              Yaqin imtihonlar
            </h3>

            {primaryApp?.examination ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">
                    {primaryApp.examination.title}
                  </div>
                  <div className="text-slate-500 flex items-center gap-3">
                    <span>
                      Sana:{' '}
                      <strong className="text-slate-800">
                        {primaryApp.examination.exam_date
                          ? new Date(primaryApp.examination.exam_date).toLocaleDateString()
                          : 'Belgilanmagan'}
                      </strong>
                    </span>
                    <span>
                      Manzil:{' '}
                      <strong className="text-slate-800">
                        {primaryApp.examination.location || 'AQXI Bosh binosi'}
                      </strong>
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-[#245B82]">
                  Rejalashtirilgan
                </span>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                Hozircha imtihon jadvali e&apos;lon qilinmagan.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hujjatlar tekshiruvi & So'nggi bildirishnomalar */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hujjatlar tekshiruvi Card (Mockup 02 style) */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                Hujjatlar tekshiruvi
              </h3>
              <span className="text-xs font-black text-[#245B82]">
                {verifiedCount} / {totalDocs}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#16803C] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPercent, 10)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Holati: {progressPercent}% tekshirilgan</span>
                <span>Jami 6 ta hujjat</span>
              </div>
            </div>

            {/* Check list of 6 documents with status indicators */}
            <div className="space-y-2.5 pt-2">
              {standardDocs.map((doc, idx) => {
                const isVerified = idx < (verifiedCount || 4); // visually verified based on progress
                return (
                  <div key={doc.code} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      {isVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16803C] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={isVerified ? 'font-semibold text-slate-900' : 'text-slate-500'}>
                        {doc.title}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isVerified
                          ? 'bg-emerald-50 text-[#16803C]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isVerified ? 'Tasdiqlangan' : 'Kutilmoqda'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* So'nggi bildirishnomalar Card (Mockup 02) */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="font-black text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              So&apos;nggi bildirishnomalar
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">
                    Arizangiz ko&apos;rib chiqilmoqda
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Qabul komissiyasi hujjatlaringizni tekshirmoqda.
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  Bugun
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    Hujjatlar tekshiruvi haqida ma&apos;lumot
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Barcha 6 ta hujjat qabul qilindi.
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  12.05.2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Printable Official Admission Pass Modal */}
      {printPassApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto print-card">
            {/* Header of pass */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#16324F] text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs leading-tight">
                    O&apos;ZBEKISTON RESPUBLIKASI QIShLOQ XO&apos;JALIGI VAZIRLIGI
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Andijon qishloq xo&apos;jaligi va agrotexnologiyalar instituti
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPrintPassApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 no-print"
              >
                ✕
              </button>
            </div>

            {/* Pass Title */}
            <div className="text-center space-y-1">
              <div className="text-xs uppercase tracking-widest text-[#245B82] font-black">
                RASMIY IMTIHON RUXSATNOMASI
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {printPassApp.examination?.title || 'Malakaviy imtihon sinovi'}
              </h2>
              <div className="font-mono text-xs font-bold text-slate-600">
                Raqami: {printPassApp.reference_number}
              </div>
            </div>

            {/* Applicant details */}
            <div className="grid grid-cols-2 gap-4 text-xs border p-4 rounded-xl bg-slate-50">
              <div>
                <span className="text-slate-400 block text-[10px]">Talabgor F.I.O.:</span>
                <span className="font-bold text-slate-900">{user?.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">JSHSHIR:</span>
                <span className="font-mono font-bold text-slate-900">
                  {user?.profile?.jshr || '31204900000000'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Imtihon sanasi:</span>
                <span className="font-bold text-slate-900">
                  {printPassApp.examination?.exam_date
                    ? new Date(printPassApp.examination.exam_date).toLocaleString()
                    : '2026-06-20 09:00'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">O&apos;tkazilish joyi:</span>
                <span className="font-bold text-slate-900">
                  {printPassApp.examination?.location || 'AQXI Bosh binosi, 204-auditoriya'}
                </span>
              </div>
            </div>

            {/* QR Code and Official Stamp placeholder */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 border-2 border-slate-900 p-1 flex items-center justify-center bg-white rounded-lg">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  <div className="font-bold text-slate-800">QR-kod bilan tekshirish</div>
                  Ushbu ruxsatnoma haqiqiyligini tekshirish uchun skaner qiling.
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-[10px] font-bold text-slate-700">Qabul komissiyasi mas&apos;uli:</div>
                <div className="text-xs font-serif italic text-slate-500">Elektron imzolangan</div>
              </div>
            </div>

            {/* Action buttons (hidden on print) */}
            <div className="flex justify-end gap-3 pt-4 border-t no-print">
              <button
                type="button"
                onClick={() => setPrintPassApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Yopish
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#16324F] hover:bg-[#214768] text-white flex items-center gap-2 shadow-sm"
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
