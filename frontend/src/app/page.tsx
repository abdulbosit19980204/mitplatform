'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Examination, Announcement, HomepageSection, FAQItem } from '@/types';
import { api } from '@/lib/api';
import { useTranslation } from '@/lib/locales';
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  ChevronRight,
  Shield,
  ArrowRight,
  Bell,
  Search,
  Filter,
  Check,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Examination discovery filters
  const [examSearch, setExamSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');

  useEffect(() => {
    Promise.all([
      api.getExaminations().catch(() => []),
      api.getAnnouncements().catch(() => []),
      api.getHomepageSections().catch(() => []),
      api.getFAQs().catch(() => []),
    ]).then(([examsData, annData, secData, faqData]) => {
      setExaminations(examsData || []);
      setAnnouncements(annData || []);
      setSections(secData || []);
      setFaqs(faqData || []);
      setLoading(false);
    });
  }, []);

  // Find CMS section by key with fallback
  const heroSection = sections.find((s) => s.section_key === 'hero');
  const workflowSection = sections.find((s) => s.section_key === 'workflow');
  const docsSection = sections.find((s) => s.section_key === 'documents_overview');

  const filteredExams = examinations.filter((exam) => {
    const matchSearch = exam.title.toLowerCase().includes(examSearch.toLowerCase());
    const matchLang = selectedLang === 'all' || exam.language === selectedLang;
    return matchSearch && matchLang;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* 1. INSTITUTIONAL HERO SECTION (SEA Journal inspired, SaaS polished) */}
      <section className="bg-gradient-to-b from-[#16324F] to-[#12273d] text-white py-16 sm:py-24 border-b border-[#245B82]/30 relative overflow-hidden">
        {/* Subtle geometric academic background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#80B4DB_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#245B82]/60 border border-[#80B4DB]/30 text-xs font-semibold text-[#80B4DB] shadow-sm">
              <Shield className="w-3.5 h-3.5" />
              {heroSection?.badge_text_uz || "Rasmiy attestatsiya va ro'yxatdan o'tish portali"}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              {heroSection?.title_uz || "Imtihonlarga ro'yxatdan o'tish — sodda va qulay"}
            </h1>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
              {heroSection?.subtitle_uz || "Kerakli imtihonni tanlang, hujjatlaringizni yuboring va arizangiz holatini shaxsiy kabinetingiz orqali kuzatib boring."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#examinations"
                className="px-6 py-3.5 rounded-lg text-sm font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-md flex items-center gap-2"
              >
                {heroSection?.button_text_uz || "Imtihonlarni ko'rish"}
                <ChevronRight className="w-4 h-4" />
              </a>

              <Link
                href={heroSection?.secondary_button_url || "/ariza/yangi"}
                className="px-6 py-3.5 rounded-lg text-sm font-bold border border-white/30 text-white hover:bg-white/10 transition shadow-sm"
              >
                {heroSection?.secondary_button_text_uz || "Ro'yxatdan o'tish"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ANNOUNCEMENTS TICKER / BANNER (Dynamic from CMS) */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    Rasmiy e&apos;lon
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(announcements[0].published_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {announcements[0].title_uz}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                  {announcements[0].content_uz}
                </p>
              </div>
            </div>

            <Link
              href="/hujjatlar"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#245B82] hover:underline shrink-0"
            >
              Batafsil tanishish
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 3. EXAMINATION DISCOVERY (Live API Data with Search & Filter) */}
      <section id="examinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#245B82] font-bold mb-1">
              Malakaviy imtihonlar
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              E&apos;lon qilingan imtihonlar ro&apos;yxati
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              O&apos;zingizga mos imtihonni tanlang va belgilangan muddat ichida arizangizni topshiring.
            </p>
          </div>

          <Link
            href="/imtihonlar"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245B82] hover:underline"
          >
            Barcha imtihonlarni ko&apos;rish
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
              placeholder="Imtihon nomi bo'yicha qidiruv..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-[#245B82] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto self-end">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-semibold">Til bo&apos;yicha:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#245B82]"
            >
              <option value="all">Barcha tillar</option>
              <option value="en">Ingliz tili</option>
              <option value="de">Nemis tili</option>
              <option value="uz">O&apos;zbek tili</option>
            </select>
          </div>
        </div>

        {/* Examination cards grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Imtihonlar yuklanmoqda...
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
            <p className="text-slate-600 font-semibold text-sm">Hozirda tanlangan parametrlar bo&apos;yicha imtihonlar topilmadi.</p>
            <p className="text-xs text-slate-400">Tez orada yangi sessiya e&apos;lon qilinadi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredExams.map((exam) => {
              const isOpen = exam.is_registration_open;
              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-[#80B4DB] hover:shadow-md transition"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#245B82] border border-[#245B82]/20">
                        {exam.language === 'en' ? 'Ingliz tili' : exam.language === 'de' ? 'Nemis tili' : exam.language.toUpperCase()}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border ${
                          isOpen
                            ? 'bg-emerald-50 text-[#16803C] border-[#16803C]/30'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-[#16803C]' : 'bg-slate-400'}`} />
                        {isOpen ? "Ro'yxatga olish ochiq" : "Ro'yxatdan o'tish yopilgan"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {exam.title}
                      </h3>
                      {exam.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {exam.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#245B82] shrink-0" />
                        <span>Ro&apos;yxatdan o&apos;tish muddati: <strong>{new Date(exam.registration_end).toLocaleDateString()} gacha</strong></span>
                      </div>
                      {exam.exam_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#245B82] shrink-0" />
                          <span>Imtihon sanasi: <strong>{new Date(exam.exam_date).toLocaleDateString()}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/imtihonlar/${exam.id}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                    >
                      Batafsil talablar
                    </Link>

                    {isOpen ? (
                      <Link
                        href={`/ariza/yangi?exam=${exam.id}`}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm inline-flex items-center gap-1.5"
                      >
                        Ariza topshirish
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-400 cursor-not-allowed">
                        Qabul yopilgan
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. WORKFLOW SECTION (3-Step Registration Process) */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs uppercase tracking-widest text-[#245B82] font-bold mb-1">
              Qulay va shaffof jarayon
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {workflowSection?.title_uz || "Ro'yxatdan o'tish tartibi"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {workflowSection?.subtitle_uz || "Malakaviy imtihonga ariza topshirish 3 ta oddiy bosqichda amalga oshiriladi."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#16324F] text-white font-black text-sm flex items-center justify-center shadow-md">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Imtihon va ixtisoslikni tanlang
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tizimda e&apos;lon qilingan imtihonlar orasidan o&apos;zingizga tegishlisini tanlang. OTM va OAK ixtisoslik kodlari davlat klassifikatoridan avtomatik olinadi.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#245B82] text-white font-black text-sm flex items-center justify-center shadow-md">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Talab etilgan 6 ta hujjatni yuklang
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Belgilangan 6 ta hujjat toifasining sifatli nusxasini PDF shaklda biriktiring. Boshqa OTMdan qatnashuvchilar uchun 6-hujjat (Aloqa xati) yuklanishi shart.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#16803C] text-white font-black text-sm flex items-center justify-center shadow-md">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Holatni kuzatib boring va ruxsatnomani oling
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Komissiya a&apos;zolari hujjatlaringizni tekshiradi. Tasdiqlangach, shaxsiy kabinetingizdan rasmiy QR-kodli ruxsatnomani chop etib olasiz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 6 REQUIRED DOCUMENTS INSTITUTIONAL OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#16324F] to-[#245B82] text-white rounded-2xl p-8 sm:p-12 shadow-lg">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#80B4DB]">
              <BookOpen className="w-3.5 h-3.5" />
              OAK Nizomi talablari
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {docsSection?.title_uz || "Topshirilishi talab etiladigan 6 ta hujjat toifasi"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Chet tili (ingliz va nemis tili) malakaviy imtihonlari uchun barcha talabgorlardan quyidagi hujjatlar talab etiladi:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/10">
                <Check className="w-4 h-4 text-[#80B4DB] shrink-0 mt-0.5" />
                <span>1. Rektor nomiga yozilgan rasmiy ariza</span>
              </div>
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/10">
                <Check className="w-4 h-4 text-[#80B4DB] shrink-0 mt-0.5" />
                <span>2. Pasport / ID-karta nusxasi</span>
              </div>
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/10">
                <Check className="w-4 h-4 text-[#80B4DB] shrink-0 mt-0.5" />
                <span>3. Ma&apos;lumotnoma (obyektivka)</span>
              </div>
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/10">
                <Check className="w-4 h-4 text-[#80B4DB] shrink-0 mt-0.5" />
                <span>4. Oliy ma&apos;lumot diplomi va ilovasi</span>
              </div>
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/10">
                <Check className="w-4 h-4 text-[#80B4DB] shrink-0 mt-0.5" />
                <span>5. Ilmiy kengash bayonnomasi / OAK byulleteni</span>
              </div>
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/10">
                <Check className="w-4 h-4 text-[#80B4DB] shrink-0 mt-0.5" />
                <span>6. Aloqa xati (boshqa OTMdan bo&apos;lsa)</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/hujjatlar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-white text-[#16324F] hover:bg-slate-100 transition shadow-sm"
              >
                Hujjatlar talablarini batafsil o&apos;rganish
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ PREVIEW ACCORDION (Dynamic from CMS) */}
      {faqs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#245B82] font-bold mb-1">
                Yordam va maslahatlar
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Ko&apos;p so&apos;raladigan savollar
              </h2>
            </div>

            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245B82] hover:underline"
            >
              Barcha savollarni ko&apos;rish
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.slice(0, 4).map((faq) => (
              <div
                key={faq.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-[#80B4DB] transition"
              >
                <h3 className="font-bold text-slate-900 text-sm flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#245B82] shrink-0 mt-0.5" />
                  {faq.question_uz}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">
                  {faq.answer_uz}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. CONTACT / SUPPORT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Ariza topshirishda savollaringiz yoki qiyinchilik bormi?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Institut ilmiy bo&apos;limi mas&apos;ul xodimlari barcha texnik va akademik savollaringizga javob berishadi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/aloqa"
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#16324F] hover:bg-[#0f2035] text-white transition shadow-sm"
            >
              Biz bilan bog&apos;lanish
            </Link>
            <Link
              href="/faq"
              className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
            >
              FAQ bo&apos;limi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
