'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Examination } from '@/types';
import { api } from '@/lib/api';
import { useTranslation } from '@/lib/locales';
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  UserCheck,
  ChevronRight,
  Shield,
  ArrowRight,
  Building2,
  GraduationCap,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .getExaminations({ is_open: true })
      .then((data) => setExaminations(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section */}
      <section className="bg-[#16324F] text-white py-16 sm:py-20 border-b border-[#245B82]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#245B82]/60 border border-[#80B4DB]/30 text-xs font-semibold text-[#80B4DB]">
              <Shield className="w-3.5 h-3.5" />
              Rasmiy attestatsiya va ro&apos;yxatdan o&apos;tish tizimi
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {t.hero.headline}
            </h1>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
              {t.hero.subtext}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/imtihonlar"
                className="px-6 py-3 rounded-lg text-sm font-semibold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-md flex items-center gap-2"
              >
                {t.hero.primaryCta}
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ariza/yangi"
                className="px-6 py-3 rounded-lg text-sm font-semibold border border-white/40 text-white hover:bg-white/10 transition"
              >
                {t.hero.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How it works (3-step visual workflow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Ro&apos;yxatdan o&apos;tish bosqichlari
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Arizangizni bir necha oddiy qadamda topshiring va natijani onlayn kuzatib boring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#245B82]/10 text-[#245B82] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Imtihonni tanlang
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              O&apos;zingizga kerakli chet tili (ingliz, nemis) yoki ixtisoslik malakaviy imtihonini tanlang va talablar bilan tanishing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#245B82]/10 text-[#245B82] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Hujjatlarni yuklang
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Belgilangan 6 ta hujjat toifasining sifatli nusxasini PDF formatda biriktiring (6-hujjat faqat boshqa OTMlar uchun).
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#245B82]/10 text-[#245B82] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Holatni kuzatib boring
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Arizangiz qabul komissiyasi tomonidan ko&apos;rib chiqiladi va natijalar shaxsiy kabinetingizda e&apos;lon qilinadi.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Available Examinations (Live from database) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mavjud imtihonlar
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hozirda ro&apos;yxatdan o&apos;tish ochiq bo&apos;lgan sinovlar ro&apos;yxati
            </p>
          </div>
          <Link
            href="/imtihonlar"
            className="text-xs font-semibold text-[#245B82] hover:underline flex items-center gap-1"
          >
            Barchasini ko&apos;rish
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Yuklanmoqda...</div>
        ) : examinations.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
            Hozirda ochiq imtihonlar mavjud emas. Tez orada yangi sinovlar e&apos;lon qilinadi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {examinations.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-[#80B4DB] transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase bg-blue-50 text-[#245B82] border border-[#245B82]/20">
                      {exam.language === 'en' ? 'Ingliz tili' : exam.language === 'de' ? 'Nemis tili' : exam.language}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-[#16803C] border border-[#16803C]/30">
                      Ro&apos;yxatga olish ochiq
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {exam.description || "Oliy ta'limdan keyingi ta'lim malakaviy imtihoni."}
                  </p>

                  <div className="space-y-1.5 pt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Ro&apos;yxatdan o&apos;tish: {new Date(exam.registration_start).toLocaleDateString()} — {new Date(exam.registration_end).toLocaleDateString()}
                      </span>
                    </div>
                    {exam.exam_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Imtihon sanasi: {new Date(exam.exam_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    href={`/imtihonlar/${exam.id}`}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Batafsil
                  </Link>

                  <Link
                    href={`/ariza/yangi?exam=${exam.id}`}
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm"
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Required Documents Preview Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Kerakli hujjatlar ro&apos;yxati bilan tanishing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Chet tili bo&apos;yicha malakaviy imtihonlar uchun 6 ta asosiy hujjat toifasi belgilangan. Hujjat talablari, qabul qilish shartlari va 6-hujjat (aloqa xati) bo&apos;yicha batafsil yo&apos;riqnoma.
              </p>
            </div>
            <Link
              href="/hujjatlar"
              className="px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#16324F] hover:bg-[#0f2035] text-white transition shrink-0"
            >
              Hujjatlar yo&apos;riqnomasi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
