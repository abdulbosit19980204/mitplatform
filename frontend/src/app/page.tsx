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
  BookOpen,
  MapPin,
  ChevronLeft,
  Phone,
  Mail,
  Send,
  Eye,
  CheckSquare,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'register' | 'direction' | 'application' | 'stats'>('register');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [selectedLang, setSelectedLang] = useState('all');
  const [examSearch, setExamSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);

  // FAQ accordion
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // Fallback initial academic examinations matching Screen 7 & Mockup 7
  const fallbackExams: Examination[] = [
    {
      id: 1,
      title: 'Matematika',
      description: 'Matematik modellashtirish va umumiy matematika kursi bo‘yicha malakaviy imtihon.',
      category: 'Aniq fanlar',
      language: 'uz',
      registration_start: '2025-06-01T00:00:00Z',
      registration_end: '2025-07-10T23:59:59Z',
      exam_date: '2025-07-15T09:00:00Z',
      location: '1-o‘quv binosi, 204-auditoriya',
      capacity: 50,
      eligibility_rules: 'Talabgor tegishli taʼlim yo‘nalishi diplomiga ega bo‘lishi lozim.',
      status: 'published',
      is_foreign_language: false,
      require_liaison_letter: false,
      is_registration_open: true,
      registered_count: 24,
      created_at: '2025-05-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Biologiya',
      description: 'O‘simliklar fiziologiyasi va umumiy biologiya fanidan malakaviy imtihon.',
      category: 'Tabiiy fanlar',
      language: 'uz',
      registration_start: '2025-06-01T00:00:00Z',
      registration_end: '2025-07-12T23:59:59Z',
      exam_date: '2025-07-16T10:00:00Z',
      location: 'Biotexnologiya binosi, 102-auditoriya',
      capacity: 40,
      eligibility_rules: 'Bakalavr yoki magistr diplomi talab etiladi.',
      status: 'published',
      is_foreign_language: false,
      require_liaison_letter: false,
      is_registration_open: true,
      registered_count: 18,
      created_at: '2025-05-01T00:00:00Z',
    },
    {
      id: 3,
      title: 'Kimyo',
      description: 'Agrokimyo va organik kimyo yo‘nalishlari bo‘yicha imtihon.',
      category: 'Tabiiy fanlar',
      language: 'uz',
      registration_start: '2025-05-01T00:00:00Z',
      registration_end: '2025-06-30T23:59:59Z',
      exam_date: '2025-07-17T09:00:00Z',
      location: 'Laboratoriya majmuasi, 3-xona',
      capacity: 35,
      eligibility_rules: 'Mavzu OTM ilmiy kengashida tasdiqlangan bo‘lishi shart.',
      status: 'registration_closed',
      is_foreign_language: false,
      require_liaison_letter: false,
      is_registration_open: false,
      registered_count: 35,
      created_at: '2025-05-01T00:00:00Z',
    },
    {
      id: 4,
      title: 'Ingliz tili (Chet tili)',
      description: 'Ilmiy izlanuvchilar uchun chet tili (ingliz tili) attestatsiya imtihoni.',
      category: 'Chet tillari',
      language: 'en',
      registration_start: '2025-06-01T00:00:00Z',
      registration_end: '2025-07-14T23:59:59Z',
      exam_date: '2025-07-18T14:00:00Z',
      location: 'Axborot-resurs markazi, 401-auditoriya',
      capacity: 60,
      eligibility_rules: '6 ta to‘liq hujjat taqdim etilishi shart.',
      status: 'published',
      is_foreign_language: true,
      require_liaison_letter: false,
      is_registration_open: true,
      registered_count: 42,
      created_at: '2025-05-01T00:00:00Z',
    },
    {
      id: 5,
      title: 'Qishloq xo‘jaligi asoslari',
      description: 'Umumiy dehqonchilik va agrotexnologiyalar fani bo‘yicha imtihon.',
      category: 'Qishloq xo‘jaligi',
      language: 'uz',
      registration_start: '2025-06-05T00:00:00Z',
      registration_end: '2025-07-15T23:59:59Z',
      exam_date: '2025-07-20T09:30:00Z',
      location: 'Bosh bino, Ilmiy kengash zali',
      capacity: 45,
      eligibility_rules: 'OAK talablari asosida.',
      status: 'published',
      is_foreign_language: false,
      require_liaison_letter: false,
      is_registration_open: true,
      registered_count: 29,
      created_at: '2025-05-01T00:00:00Z',
    },
    {
      id: 6,
      title: 'Agrokimyo va tuproqshunoslik',
      description: 'Tuproq unumdorligini oshirish va agrokimyoviy tahlillar imtihoni.',
      category: 'Qishloq xo‘jaligi',
      language: 'uz',
      registration_start: '2025-06-05T00:00:00Z',
      registration_end: '2025-07-17T23:59:59Z',
      exam_date: '2025-07-22T11:00:00Z',
      location: 'Agrobiologiya laboratoriyasi',
      capacity: 30,
      eligibility_rules: 'OAK ixtisoslik shifri bo‘yicha talabgorlar.',
      status: 'published',
      is_foreign_language: false,
      require_liaison_letter: false,
      is_registration_open: true,
      registered_count: 15,
      created_at: '2025-05-01T00:00:00Z',
    },
  ];

  useEffect(() => {
    Promise.all([
      api.getExaminations().catch(() => []),
      api.getAnnouncements().catch(() => []),
      api.getHomepageSections().catch(() => []),
      api.getFAQs().catch(() => []),
    ]).then(([examsData, annData, secData, faqData]) => {
      if (examsData && examsData.length > 0) {
        setExaminations(examsData);
      } else {
        setExaminations(fallbackExams);
      }
      setAnnouncements(annData || []);
      setSections(secData || []);
      setFaqs(faqData || []);
      setLoading(false);
    });
  }, []);

  const activeExamList = examinations.length > 0 ? examinations : fallbackExams;

  const filteredExams = activeExamList.filter((exam) => {
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
    <div className="space-y-12 sm:space-y-16 pb-24 bg-[#F8FAFC] dark:bg-[#071426] text-slate-800 dark:text-slate-100 transition-colors duration-150">
      
      {/* =========================================================================
          1. HERO SECTION (Screen 1 & Mockup 1: Contained Full Campus Photo Hero)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div
          className="relative overflow-hidden rounded-3xl min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex items-center p-6 sm:p-12 lg:p-16 shadow-[0_10px_30px_-5px_rgba(10,32,59,0.12)] border border-slate-200/80 dark:border-[#1E3A5F] bg-cover bg-right sm:bg-center"
          style={{ backgroundImage: `url('/images/university_building.jpg')` }}
        >
          {/* Deep Navy/Atmospheric Academic Overlay tailored for razor-sharp readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#061527]/98 via-[#0A203B]/85 to-[#0A203B]/30 dark:from-[#030A14]/98 dark:via-[#07172B]/90 dark:to-transparent" />
          
          {/* Subtle Ambient Radial Light */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_50%)]" />

          {/* Floating glass institutional badge in top right */}
          <div className="hidden md:flex absolute top-6 right-6 bg-white/15 dark:bg-[#0F2036]/80 backdrop-blur-md border border-white/20 dark:border-[#263B55] shadow-lg rounded-2xl px-4 py-2.5 items-center gap-3 text-white z-10">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Rasmiy tizim</div>
              <div className="text-xs font-black text-white">Andijon Qishloq Xo&apos;jaligi Instituti</div>
            </div>
          </div>

          {/* Left Hero Content */}
          <div className="relative z-10 max-w-2xl space-y-6 text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-white shadow-sm">
              <GraduationCap className="w-4 h-4 text-blue-300" />
              <span>Andijon Qishloq Xo&apos;jaligi Instituti</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-white leading-[1.12]">
              Kelajagingiz uchun to&apos;g&apos;ri tanlov!
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl font-normal">
              Andijon Qishloq xo&apos;jaligi instituti imtihon platformasi orqali o&apos;zingizning kelajagingizni belgilang. Qulay ro&apos;yxatdan o&apos;tish, imtihonlar jadvali va shaffof baholash tizimi.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/ariza/yangi"
                className="px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                Ro&apos;yxatdan o&apos;tish
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#examinations"
                className="px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 transition shadow-sm inline-flex items-center gap-2"
              >
                Imtihonlar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. 4 FEATURE CARDS (Screen 1 & Mockup 1)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: FileText,
              title: "Qulay ro'yxatdan o'tish",
              desc: 'Tez va oson ariza topshiring',
            },
            {
              icon: Calendar,
              title: 'Imtihon jadvali',
              desc: 'Aniq vaqt va muddatlar',
            },
            {
              icon: CheckCircle2,
              title: 'Natijalarni kuzatish',
              desc: 'Shaxsiy kabinet orqali',
            },
            {
              icon: Headphones,
              title: "24/7 Qo'llab-quvvatlash",
              desc: '24/7 doimiy yordam',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-[#2563EB]/40 dark:hover:border-[#3B82F6]/50 transition group flex flex-col justify-between"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-[#162E4A] text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center mb-3 group-hover:scale-105 transition">
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

      {/* =========================================================================
          3. STATISTICS BAR (Screen 1 & Mockup 1: 4 Metrics in a Slim Horizontal Pill)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200/80 dark:border-[#1E3A5F] p-6 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-[#1E3A5F]">
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
                90%
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Muvaffaqiyat ko&apos;rsatkichi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. 4 CATEGORY FILTER PILLS (Screen 1 in Reference Board)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { id: 'register', label: "Ro'yxatdan o'tish", count: 'Faol' },
            { id: 'direction', label: "Ta'lim yo'nalishi", count: '12 ta' },
            { id: 'application', label: 'Abituriyent arizasi', count: 'Onlayn' },
            { id: 'stats', label: 'Imtihon ko‘rsatkichlari', count: '100%' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-[#2563EB]/25'
                    : 'bg-white dark:bg-[#0D223A] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-[#1E3A5F] hover:bg-slate-50 dark:hover:bg-[#152E4D]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-[#162E4A] text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. IMTIHONLAR RO'YXATI (Screen 7 & Mockup 7: Responsive Academic Table)
         ========================================================================= */}
      <section id="examinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Imtihonlar ro&apos;yxati
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Malakaviy va attestatsiya imtihonlari rasmiy jadvali
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher: Table vs Grid */}
            <div className="bg-white dark:bg-[#0D223A] border border-slate-200/80 dark:border-[#1E3A5F] p-1 rounded-xl flex items-center text-xs font-bold shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Jadval
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Kartochka
              </button>
            </div>

            <Link
              href="/ariza/yangi"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi ariza topshirish</span>
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Qidiring (Masalan: Matematika, Biologiya)..."
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200/80 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200/80 dark:border-[#1E3A5F] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">Barcha tillar</option>
              <option value="uz">O‘zbek tili</option>
              <option value="en">Ingliz tili</option>
              <option value="ru">Rus tili</option>
            </select>

            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200/80 dark:border-[#1E3A5F] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">Barcha turlar</option>
              <option value="specialty">Mutaxassislik</option>
              <option value="foreign">Chet tili</option>
            </select>
          </div>
        </div>

        {/* 5.A TABLE VIEW (Screen 7 in Mockup Reference) */}
        {viewMode === 'table' ? (
          <div className="bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-[#122A46] text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-[#1E3A5F]">
                    <th className="py-3.5 px-4 font-bold w-12 text-center">№</th>
                    <th className="py-3.5 px-4 font-bold">Imtihon nomi</th>
                    <th className="py-3.5 px-4 font-bold">Sana</th>
                    <th className="py-3.5 px-4 font-bold">Davomiyligi</th>
                    <th className="py-3.5 px-4 font-bold text-center">Holat</th>
                    <th className="py-3.5 px-4 font-bold text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E3A5F]">
                  {filteredExams.map((exam, idx) => {
                    const isOpen =
                      exam.is_registration_open !== false && exam.status === 'published';
                    const examDateStr = exam.exam_date
                      ? new Date(exam.exam_date).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
                      : '2025-07-15';

                    return (
                      <tr
                        key={exam.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-[#122A46]/50 transition"
                      >
                        <td className="py-4 px-4 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#162E4A] text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center font-bold text-xs shrink-0">
                              {exam.title.charAt(0)}
                            </div>
                            <div>
                              <div>{exam.title}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {exam.category || 'Malakaviy imtihon'} • {exam.language.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                          <div className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{examDateStr}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                          <div className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>2 soat</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {isOpen ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
                              Ochiq
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800">
                              Yopiq
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={isOpen ? `/ariza/yangi?exam=${exam.id}` : '#'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 ${
                              isOpen
                                ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed pointer-events-none'
                            }`}
                          >
                            <span>{isOpen ? "Ro'yxatdan o'tish" : 'Yopilgan'}</span>
                            {isOpen && <ChevronRight className="w-3.5 h-3.5" />}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination matching Screen 7 (< 1 2 3 >) */}
            <div className="p-4 border-t border-slate-200/80 dark:border-[#1E3A5F] flex items-center justify-between text-xs text-slate-500">
              <div>Jami: {filteredExams.length} ta imtihon mavjud</div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#152E4D]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-bold flex items-center justify-center"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#152E4D]"
                >
                  2
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#152E4D]"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 5.B GRID CARDS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExams.map((exam) => {
              const isOpen =
                exam.is_registration_open !== false && exam.status === 'published';
              const examDateStr = exam.exam_date
                ? new Date(exam.exam_date).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '15-iyul, 2025';

              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-[#162E4A] text-[#2563EB] dark:text-[#3B82F6]">
                        {exam.category || 'Malakaviy imtihon'}
                      </span>
                      {isOpen ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/80">
                          Ochiq
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200/80">
                          Yopiq
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {exam.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-[#1E3A5F] space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sana: {examDateStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Davomiyligi: 2 soat</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
                    <Link
                      href={`/imtihonlar/${exam.id}`}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    >
                      Batafsil
                    </Link>
                    <Link
                      href={isOpen ? `/ariza/yangi?exam=${exam.id}` : '#'}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        isOpen
                          ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed pointer-events-none'
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

      {/* =========================================================================
          6. 5-BOSQICHLI RO'YXATDAN O'TISH JARAYONI (Screen 4 Stepper Alignment)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] p-6 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6]">
              QANDAY ISHLAYDI?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Ro&apos;yxatdan o&apos;tish jarayoni
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Ariza topshirishdan imtihon ruxsatnomasini olishgacha bo&apos;lgan 5 ta oddiy bosqich
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              {
                num: '1',
                title: "Shaxsiy ma'lumotlar",
                desc: 'Pasport va shaxsiy maʼlumotlarni to‘ldirish',
                icon: UserCheck,
              },
              {
                num: '2',
                title: "Ta'lim ma'lumotlari",
                desc: 'OTM, diplom va mutaxassislikni kiritish',
                icon: BookOpen,
              },
              {
                num: '3',
                title: 'Imtihonni tanlash',
                desc: 'Kerakli fan yoki chet tilini tanlash',
                icon: CheckSquare,
              },
              {
                num: '4',
                title: 'Hujjatlarni yuklash',
                desc: 'Talab etiladigan 6 ta hujjatni ilova qilish',
                icon: CloudUpload,
              },
              {
                num: '5',
                title: 'QR Ruxsatnoma',
                desc: 'Arizani tasdiqlash va ruxsatnomani olish',
                icon: Award,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-slate-50 dark:bg-[#071426] rounded-2xl border border-slate-200/80 dark:border-[#1E3A5F] p-5 flex flex-col items-center text-center space-y-3 relative group hover:border-[#2563EB]/50 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition">
                    {step.num}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/ariza/yangi"
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm inline-flex items-center gap-2"
            >
              Hoziroq ariza topshirish
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. INSTITUT VA ILMIY SALOHIYAT (Real Academic Visual Environment)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6]">
              ANDIJON QISHLOQ XO‘JALIGI VA AGROTEXNOLOGIYALAR INSTITUTI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Zamonaviy ilmiy laboratoriyalar va xalqaro attestatsiya standartlari
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Institutimizda qishloq xo‘jaligi, agrotexnologiyalar, seleksiya, tuproqshunoslik va o‘simliklar himoyasi sohalarida oliy malakali ilmiy-pedagogik kadrlar tayyorlanmoqda. Barcha imtihonlar shaffof va adolatli tashkil etilgan.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white dark:bg-[#0D223A] p-4 rounded-xl border border-slate-200/80 dark:border-[#1E3A5F]">
                <div className="text-xl font-black text-[#2563EB]">100%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Elektron va shaffof</div>
              </div>
              <div className="bg-white dark:bg-[#0D223A] p-4 rounded-xl border border-slate-200/80 dark:border-[#1E3A5F]">
                <div className="text-xl font-black text-[#10B981]">OAK</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Rasmiy ro‘yxatga olingan</div>
              </div>
            </div>
          </div>

          <div
            className="rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[340px] bg-cover bg-center border border-slate-200/80 dark:border-[#1E3A5F] shadow-lg relative p-8 flex items-end"
            style={{ backgroundImage: `url('/images/agriculture_field.jpg')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#061527]/90 via-[#0A203B]/40 to-transparent" />
            <div className="relative z-10 text-white">
              <div className="text-xs font-bold text-blue-300">Ilmiy agropark va tajriba dalalari</div>
              <div className="text-base sm:text-lg font-black text-white mt-1">
                Innovatsion agrotexnologiyalar markazi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. KO'P BERILADIGAN SAVOLLAR (FAQ)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6]">
              SAVOL-JAVOBLAR
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Ko‘p beriladigan savollar
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {[
              {
                id: 1,
                q: "Imtihon topshirish uchun qanday hujjatlar talab etiladi?",
                a: "OAK talablari bo‘yicha: Rektor nomiga ariza, Pasport nusxasi, Obyektivka (ma'lumotnoma), Diplom nusxasi, Ilmiy kengash bayonnomasi yoki OAK byulleteni nusxasi hamda boshqa OTMdan bo‘lsa aloqa xati.",
              },
              {
                id: 2,
                q: "Arizam holatini qanday tekshirishim mumkin?",
                a: "Abituriyent kabinetiga kirib 'Mening arizalarim' bo‘limi orqali arizangiz tekshiruv, qabul qilingan yoki ruxsatnoma berilgan holatini real vaqt rejimida kuzatishingiz mumkin.",
              },
              {
                id: 3,
                q: "QR-kodli ruxsatnoma qachon taqdim etiladi?",
                a: "Arizangiz mas'ul komissiya tomonidan to‘liq tekshirilib tasdiqlangandan so‘ng, shaxsiy kabinetingizda QR-kodli elektron ruxsatnoma avtomatik tarzda shakllanadi.",
              },
            ].map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-200/80 dark:border-[#1E3A5F] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between bg-slate-50/50 dark:bg-[#071426]/50 hover:bg-slate-50 dark:hover:bg-[#122A46] transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <Minus className="w-4 h-4 text-[#2563EB]" /> : <Plus className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white dark:bg-[#0D223A] text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/80 dark:border-[#1E3A5F]">
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
