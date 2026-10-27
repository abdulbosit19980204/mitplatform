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
  Search,
  Filter,
  Check,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  Globe,
  Plus,
  Minus,
  Laptop,
  CheckCircle,
  Headphones,
  Users,
  Award,
  Building,
  BarChart2,
  UserCheck,
  CloudUpload,
  BarChart3,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter bar states
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all');
  const [examSearch, setExamSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // FAQ open state
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

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

  const heroSection = sections.find((s) => s.section_key === 'hero');

  const filteredExams = examinations.filter((exam) => {
    const matchSearch =
      exam.title.toLowerCase().includes(examSearch.toLowerCase()) ||
      (exam.category && exam.category.toLowerCase().includes(examSearch.toLowerCase()));
    const matchLang = selectedLang === 'all' || exam.language === selectedLang;
    const matchType =
      selectedExamType === 'all' ||
      (selectedExamType === 'foreign' ? exam.is_foreign_language : !exam.is_foreign_language);
    return matchSearch && matchLang && matchType;
  });

  return (
    <div className="space-y-16 pb-20 bg-[var(--color-background)] transition-colors duration-150">
      {/* 1. HERO SECTION (Full Background Cover matching Mockup 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div
          className="relative overflow-hidden rounded-3xl min-h-[420px] sm:min-h-[460px] flex items-center p-6 sm:p-12 lg:p-16 shadow-2xl border border-slate-200/80 dark:border-[#263B55] bg-cover bg-center"
          style={{ backgroundImage: `url('/images/university_building.jpg')` }}
        >
          {/* Deep Navy/Atmospheric gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#061527]/95 via-[#0A203B]/80 to-[#0A203B]/25 dark:from-[#040C18]/95 dark:via-[#071629]/85 dark:to-transparent" />

          {/* Floating glass badge in top right */}
          <div className="hidden sm:flex absolute top-6 right-6 bg-white/15 dark:bg-[#0F2036]/80 backdrop-blur-md border border-white/20 dark:border-[#263B55] shadow-lg rounded-2xl px-4 py-2.5 items-center gap-2.5 text-white z-10">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-md">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Rasmiy tizim</div>
              <div className="text-xs font-bold text-white">Andijon Qishloq Xo&apos;jaligi Instituti</div>
            </div>
          </div>

          {/* Left Hero Content */}
          <div className="relative z-10 max-w-2xl space-y-5 text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-white shadow-sm">
              <GraduationCap className="w-4 h-4 text-blue-300" />
              <span>Andijon Qishloq Xo&apos;jaligi Instituti</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              {heroSection?.title_uz || "Kelajagingiz uchun to'g'ri tanlov!"}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl font-normal">
              {heroSection?.subtitle_uz ||
                "Andijon Qishloq Xo'jaligi Instituti imtihon platformasi orqali ilmiy attestatsiya va malakaviy imtihonlarga tezkor, shaffof va oson ro'yxatdan o'ting."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                href="/ariza/yangi"
                className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-lg inline-flex items-center gap-2"
              >
                Ro&apos;yxatdan o&apos;tish
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#examinations"
                className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 transition shadow-sm inline-flex items-center gap-2"
              >
                Imtihonlar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 BENEFIT CARDS (Mockup 1 in media_1793125960007_1630b4f6.jpg) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: FileText,
              title: "Qulay ro'yxatdan o'tish",
              desc: "Tez va oson ariza topshiring",
            },
            {
              icon: Laptop,
              title: "Onlayn ariza topshirish",
              desc: "Barcha amallar to'liq onlayn",
            },
            {
              icon: CheckCircle,
              title: "Natijalarni ko'rish",
              desc: "Natijalar tezda e'lon qilinadi",
            },
            {
              icon: Headphones,
              title: "24/7 qo'llab-quvvatlash",
              desc: "24/7 doimiy yordam",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] p-5 shadow-md hover:shadow-lg hover:border-[#2563EB]/40 dark:hover:border-[#3B82F6]/40 transition group flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#162B45] text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. STATISTICS BAR (Mockup 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/80 dark:border-[#263B55] p-6 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#2563EB] dark:text-[#3B82F6]">
                3,500+
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Talabgorlar
              </div>
            </div>

            <div className="space-y-1 pt-4 lg:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                12
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Ta&apos;lim yo&apos;nalishlari
              </div>
            </div>

            <div className="space-y-1 pt-4 lg:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                25+
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                OTM va filiallar
              </div>
            </div>

            <div className="space-y-1 pt-4 lg:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-[#10B981]">
                98%
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Muvaffaqiyat ko&apos;rsatkichi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAVJUD IMTIHONLAR (Mockup 1 & 7: Grid / Table View) */}
      <section id="examinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mavjud imtihonlar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Attestatsiya va chet tili malakaviy imtihonlari jadvali
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher: Table vs Cards */}
            <div className="bg-slate-100 dark:bg-[#162B45] p-1 rounded-xl flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#2563EB] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Jadval (Mockup 7)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#2563EB] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Kartalar
              </button>
            </div>

            <Link
              href="/imtihonlar"
              className="text-xs sm:text-sm font-bold text-[#2563EB] dark:text-[#3B82F6] hover:underline flex items-center gap-1"
            >
              Barchasi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar (Mockup 7 style) */}
        <div className="bg-white dark:bg-[#0F2036] p-4 rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
              placeholder="Imtihon nomi bo'yicha qidirish..."
              className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] rounded-xl pl-9 pr-3 py-2 outline-none text-slate-900 dark:text-white focus:border-[#2563EB]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#2563EB]"
            >
              <option value="all">Barcha tillar</option>
              <option value="en">Ingliz tili</option>
              <option value="de">Nemis tili</option>
              <option value="uz">O&apos;zbek tili</option>
            </select>

            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#2563EB]"
            >
              <option value="all">Barcha turlar</option>
              <option value="foreign">Chet tili malakaviy</option>
              <option value="standard">Attestatsiya sinovlari</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ) : filteredExams.length === 0 ? (
          <div className="bg-white dark:bg-[#0F2036] rounded-2xl p-10 text-center border border-slate-200 dark:border-[#263B55] text-slate-500 text-sm">
            Tanlangan parametrlar bo&apos;yicha imtihon topilmadi.
          </div>
        ) : viewMode === 'table' ? (
          /* Institutional Table Layout (Mockup 7 & Mockup 1) */
          <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#162B45] border-b border-slate-200 dark:border-[#263B55] text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3.5">№</th>
                    <th className="px-4 py-3.5">Imtihon nomi</th>
                    <th className="px-4 py-3.5">Til / Yo&apos;nalish</th>
                    <th className="px-4 py-3.5">Sana</th>
                    <th className="px-4 py-3.5">Davomiyligi</th>
                    <th className="px-4 py-3.5">Holat</th>
                    <th className="px-4 py-3.5 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#263B55]">
                  {filteredExams.map((exam, idx) => {
                    const isOpen = exam.is_registration_open;
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/70 dark:hover:bg-[#162B45]/50 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {exam.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {exam.location || "AQXI Bosh binosi"}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6]">
                            {exam.language === 'en' ? 'Ingliz tili' : exam.language === 'de' ? 'Nemis tili' : 'O‘zbek tili'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'E\'lon qilinadi'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          2 soat
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isOpen
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {isOpen ? 'Ochiq' : 'Yopiq'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {isOpen ? (
                            <Link
                              href={`/ariza/yangi?exam=${exam.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm"
                            >
                              Ro&apos;yxatdan o&apos;tish
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <Link
                              href={`/imtihonlar/${exam.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#162B45] text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
                            >
                              Batafsil
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination at bottom (Mockup 7) */}
            <div className="p-3 border-t border-slate-100 dark:border-[#263B55] flex items-center justify-end gap-1 text-xs">
              <span className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold">1</span>
              <span className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#162B45] flex items-center justify-center cursor-pointer">2</span>
              <span className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#162B45] flex items-center justify-center cursor-pointer">3</span>
              <span className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#162B45] flex items-center justify-center cursor-pointer">&gt;</span>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredExams.map((exam) => {
              const isOpen = exam.is_registration_open;
              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-[#0F2036] border border-slate-200/90 dark:border-[#263B55] hover:border-[#2563EB]/50 dark:hover:border-[#3B82F6]/50 hover:shadow-lg transition-all rounded-2xl p-5 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isOpen
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#10B981] border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOpen ? 'bg-[#10B981]' : 'bg-slate-400'
                          }`}
                        />
                        {isOpen ? "Ochiq" : 'Yopiq'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition" />
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                      <span className="uppercase">
                        {exam.language === 'en'
                          ? 'Ingliz tili'
                          : exam.language === 'de'
                          ? 'Nemis tili'
                          : 'O‘zbek tili'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition">
                      {exam.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Ro&apos;yxat: {new Date(exam.registration_start).toLocaleDateString()} —{' '}
                          {new Date(exam.registration_end).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Imtihon:{' '}
                          {exam.exam_date
                            ? new Date(exam.exam_date).toLocaleDateString()
                            : 'Belgilanmagan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/imtihonlar/${exam.id}`}
                      className="py-2 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      Batafsil
                    </Link>
                    <Link
                      href={isOpen ? `/ariza/yangi?exam=${exam.id}` : '#'}
                      className={`py-2 text-center text-xs font-bold rounded-xl text-white transition ${
                        isOpen
                          ? 'bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] shadow-sm'
                          : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      Ro&apos;yxatdan o&apos;tish
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. RO'YXATDAN O'TISH JARAYONI (5 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/80 dark:border-[#263B55] p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6]">
                QANDAY ISHLAYDI?
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Ro&apos;yxatdan o&apos;tish jarayoni
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Ariza topshirish jarayoni bir necha oddiy qadamdan iborat. Barcha bosqichlarda
                sizga qulay interfeys taqdim etiladi.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                Batafsil ma&apos;lumot <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                {
                  step: '01',
                  icon: FileText,
                  title: 'Imtihonni tanlang',
                  desc: "Mavjud imtihonlar ro'yxatidan keraklisini tanlang",
                },
                {
                  step: '02',
                  icon: UserCheck,
                  title: "Shaxsiy ma'lumotlar",
                  desc: "O'zingiz haqingizdagi ma'lumotlarni to'ldiring",
                },
                {
                  step: '03',
                  icon: CloudUpload,
                  title: 'Hujjatlarni yuklang',
                  desc: 'Kerakli 6 ta hujjatni tizimga yuklang',
                },
                {
                  step: '04',
                  icon: Shield,
                  title: 'Tekshirish va tasdiqlash',
                  desc: "Ma'lumotlarni tekshirib arizani yuboring",
                },
                {
                  step: '05',
                  icon: BarChart3,
                  title: 'Holatni kuzatish',
                  desc: 'Shaxsiy kabinetda arizangiz holatini kuzating',
                },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.step} className="space-y-2 text-center group">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-[#162B45] border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] group-hover:scale-110 transition shadow-sm">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="text-[10px] font-black text-[#2563EB] dark:text-[#3B82F6] uppercase tracking-wider">
                      {item.step}
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                      {item.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. KERAKLI HUJJATLAR (6 Required Documents + Passport Photo) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/80 dark:border-[#263B55] p-6 sm:p-10 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Kerakli hujjatlar
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] border border-blue-200 dark:border-blue-800">
                    Chet tillari uchun
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Ingliz va nemis tili bo&apos;yicha imtihonlarda quyidagi 6 ta hujjat talab etiladi:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { num: 1, title: 'Rektor nomiga ariza' },
                  { num: 2, title: 'Pasport nusxasi (JSHSHIR)' },
                  { num: 3, title: "Ma'lumotnoma (obyektivka)" },
                  { num: 4, title: 'Diplom nusxasi (ilova bilan)' },
                  {
                    num: 5,
                    title: "OTM ilmiy kengash bayonnomasi / OAK byulleteni nusxasi",
                  },
                  {
                    num: 6,
                    title: 'Aloqa xati (boshqa OTMdan qatnashuvchilar uchun)',
                  },
                ].map((doc) => (
                  <div key={doc.num} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-[#162B45] text-[#2563EB] dark:text-[#3B82F6] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                      {doc.num}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {doc.title}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/hujjatlar"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white transition shadow-sm"
                >
                  Batafsil ko&apos;rish <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden">
                <img
                  src="/images/passport_documents.jpg"
                  alt="Kerakli hujjatlar va O'zbekiston pasporti"
                  className="w-full h-full object-contain object-center"
                  style={{
                    maskImage:
                      'linear-gradient(to right, transparent 0%, black 15%, black 90%, transparent 100%), linear-gradient(to bottom, black 85%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to right, transparent 0%, black 15%, black 90%, transparent 100%), linear-gradient(to bottom, black 85%, transparent 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Tez-tez so&apos;raladigan savollar
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Sizni qiziqtirgan savollarga javoblarni shu yerda topishingiz mumkin.
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] dark:text-[#3B82F6] pt-2"
            >
              Barcha savollar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {[
              {
                id: 1,
                q: "Imtihonlarga ro'yxatdan o'tish muddati qancha?",
                a: "Har bir imtihon uchun ro'yxatdan o'tish muddati e'londa alohida ko'rsatiladi. Odatda imtihon o'tkazilishidan 15-20 kun oldin boshlanadi va 3 kun qolganda to'xtatiladi.",
              },
              {
                id: 2,
                q: 'Hujjatlarni qanday formatda yuklash mumkin?',
                a: "Hujjatlar PDF yoki yuqori sifatli JPG/PNG formatida yuklanishi shart. Har bir fayl hajmi 10 MB dan oshmasligi lozim.",
              },
              {
                id: 3,
                q: 'Arizani bekor qilish mumkinmi?',
                a: "Ariza komissiya tomonidan ko'rib chiqilish holatida bo'lsa yoki qoralama bo'lsa, shaxsiy kabinet orqali bekor qilish yoki ma'lumotlarni tahrirlash mumkin.",
              },
              {
                id: 4,
                q: "Imtihon natijalari qachon e'lon qilinadi?",
                a: "Malakaviy imtihon natijalari sinov yakunlangandan so'ng 3 ish kuni ichida platformadagi shaxsiy kabinetingizda aks ettiriladi.",
              },
            ].map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-[#0F2036] rounded-xl border border-slate-200/80 dark:border-[#263B55] overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-full bg-slate-100 dark:bg-[#162B45] text-slate-600 dark:text-slate-300">
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
