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
  GraduationCap,
  Globe,
  Plus,
  Minus,
  Sparkles,
  UserCheck,
  CloudUpload,
  BarChart3,
  ExternalLink,
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

  // Find CMS section by key with fallback
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
    <div className="space-y-16 pb-20 bg-[#F5F7FA]">
      {/* 1. HERO SECTION (Image 2 style with integrated architecture photo & glass card) */}
      <section className="relative pt-12 pb-24 sm:pt-16 sm:pb-32 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 z-10">
              <div className="text-xs sm:text-sm font-bold tracking-wider text-slate-500 uppercase">
                {heroSection?.badge_text_uz || "ANDIJON QIShLOQ XO'JALIGI INSTITUTI"}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#16324F] leading-[1.15]">
                {heroSection?.title_uz || "Imtihonlarga ro'yxatdan o'tish — sodda va qulay"}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                {heroSection?.subtitle_uz ||
                  "Kerakli imtihonni tanlang, hujjatlaringizni yuboring va arizangiz holatini shaxsiy kabinetingiz orqali kuzatib boring."}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#examinations"
                  className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#16324F] hover:bg-[#214768] text-white transition shadow-sm inline-flex items-center gap-2"
                >
                  {heroSection?.button_text_uz || "Imtihonlarni ko'rish"}
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href={heroSection?.secondary_button_url || "/ariza/yangi"}
                  className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition shadow-sm inline-flex items-center gap-2"
                >
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </div>
            </div>

            {/* Right Architectural Image with soft background blend */}
            <div className="lg:col-span-6 relative">
              <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[430px] rounded-2xl overflow-hidden shadow-xl">
                {/* Image blending into canvas */}
                <img
                  src="/images/university_building.jpg"
                  alt="Andijon Qishloq Xo'jaligi Instituti"
                  className="w-full h-full object-cover object-center"
                  style={{
                    maskImage:
                      'linear-gradient(to right, transparent 0%, black 15%, black 95%, transparent 100%), linear-gradient(to bottom, black 80%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to right, transparent 0%, black 15%, black 95%, transparent 100%), linear-gradient(to bottom, black 80%, transparent 100%)',
                  }}
                />

                {/* Floating Glass Badge (Image 2) */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-white/80 shadow-lg rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#16324F] text-white flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-[#80B4DB]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Kelajagingiz uchun birinchi qadam
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING GLASS FILTER BAR (Image 2 style) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-30">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/60 rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-center">
            {/* Exam Type Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-xs text-slate-700">
                <GraduationCap className="w-4 h-4 text-[#245B82] shrink-0" />
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="bg-transparent w-full text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Imtihon turini tanlang</option>
                  <option value="foreign">Chet tili imtihonlari</option>
                  <option value="specialty">Mutaxassislik fanlari</option>
                </select>
              </div>
            </div>

            {/* Language Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-xs text-slate-700">
                <Globe className="w-4 h-4 text-[#245B82] shrink-0" />
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-transparent w-full text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Tilni tanlang</option>
                  <option value="en">Ingliz tili</option>
                  <option value="de">Nemis tili</option>
                  <option value="uz">O&apos;zbek tili</option>
                  <option value="ru">Rus tili</option>
                </select>
              </div>
            </div>

            {/* Session / Date Filter */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-xs text-slate-700">
                <Calendar className="w-4 h-4 text-[#245B82] shrink-0" />
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="bg-transparent w-full text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Sessiyani tanlang</option>
                  <option value="2026-1">1-sessiya (09:00 - 10:00)</option>
                  <option value="2026-2">2-sessiya (11:00 - 12:00)</option>
                  <option value="2026-3">3-sessiya (14:00 - 15:00)</option>
                </select>
              </div>
            </div>

            {/* Search Action Button */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('examinations');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#16324F] hover:bg-[#214768] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Qidirish</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAVJUD IMTIHONLAR (Available Exams Grid - Image 2) */}
      <section id="examinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[#16324F] tracking-tight">
            Mavjud imtihonlar
          </h2>
          <Link
            href="/imtihonlar"
            className="text-xs sm:text-sm font-bold text-[#245B82] hover:underline flex items-center gap-1"
          >
            Barcha imtihonlar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-white/70 rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 text-center border border-slate-200 text-slate-500 text-sm">
            Tanlangan parametrlar bo&apos;yicha imtihon topilmadi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredExams.map((exam) => {
              const isOpen = exam.is_registration_open;
              return (
                <div
                  key={exam.id}
                  className="bg-white/90 backdrop-blur-sm border border-slate-200/80 hover:border-[#245B82]/50 hover:shadow-lg transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Top Badge & Arrow */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isOpen
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOpen ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {isOpen ? "Ro'yxat ochiq" : 'Yakunlangan'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#245B82] group-hover:translate-x-0.5 transition" />
                    </div>

                    {/* Language tag */}
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#245B82]" />
                      <span className="uppercase">
                        {exam.language === 'en'
                          ? 'Ingliz tili'
                          : exam.language === 'de'
                          ? 'Nemis tili'
                          : exam.language}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#16324F] transition">
                      {exam.title}
                    </h3>

                    {/* Dates */}
                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
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

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        Bakalavriat / Magistratura
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-[#245B82]">
                        OAK talabgorlari
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/imtihonlar/${exam.id}`}
                      className="py-2 text-center text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                    >
                      Batafsil
                    </Link>
                    <Link
                      href={isOpen ? `/ariza/yangi?exam=${exam.id}` : '#'}
                      className={`py-2 text-center text-xs font-bold rounded-xl text-white transition ${
                        isOpen
                          ? 'bg-[#16324F] hover:bg-[#214768] shadow-sm'
                          : 'bg-slate-400 cursor-not-allowed pointer-events-none'
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

      {/* 4. RO'YXATDAN O'TISH JARAYONI (Image 2: QANDAY ISHLAYDI? 5-Step Process) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Header */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#245B82]">
                QANDAY ISHLAYDI?
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Ro&apos;yxatdan o&apos;tish jarayoni
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ariza topshirish jarayoni bir necha oddiy qadamdan iborat. Barcha bosqichlarda
                sizga qulay interfeys taqdim etiladi.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#16324F] hover:bg-[#214768] px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                Batafsil ma&apos;lumot <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Right 5 Process Steps */}
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
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.step} className="space-y-2 text-center group">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#16324F] group-hover:bg-[#16324F] group-hover:text-white transition duration-300 shadow-sm">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="text-[10px] font-black text-[#245B82] uppercase tracking-wider">
                      {item.step}
                    </div>
                    <div className="font-bold text-xs text-slate-900 leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                      {item.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. KERAKLI HUJJATLAR (Image 2: 6 Required Documents + Passport Graphic) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Documents List */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Kerakli hujjatlar
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#245B82] border border-blue-200">
                    Chet tillari uchun
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Ingliz va nemis tili bo&apos;yicha imtihonlarda quyidagi 6 ta hujjat talab etiladi:
                </p>
              </div>

              {/* Numbered 1..6 list in 2 columns */}
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
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-[#16324F] font-bold text-xs flex items-center justify-center shrink-0">
                      {doc.num}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 leading-snug">
                      {doc.title}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/hujjatlar"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#16324F] hover:bg-[#214768] text-white transition shadow-sm"
                >
                  Batafsil ko&apos;rish <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Passport & Documents Photo with Smooth Background Blend */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden">
                <img
                  src="/images/passport_documents.jpg"
                  alt="Kerakli hujjatlar va O'zbekiston pasporti"
                  className="w-full h-full object-contain object-center"
                  style={{
                    maskImage:
                      'linear-gradient(to right, transparent 0%, black 15%, black 90%, transparent 100%), linear-gradient(to bottom, black 80%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to right, transparent 0%, black 15%, black 90%, transparent 100%), linear-gradient(to bottom, black 80%, transparent 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. YANGILIKLAR VA E'LONLAR (Image 2: 3 Cards + Agro Photo Card) */}
      <section id="yangiliklar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[#16324F] tracking-tight">
            Yangiliklar va e&apos;lonlar
          </h2>
          <Link
            href="/#yangiliklar"
            className="text-xs sm:text-sm font-bold text-[#245B82] hover:underline flex items-center gap-1"
          >
            Barchasi <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>12.05.2026</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#245B82]">
                  E&apos;lon
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                2026–2027 o&apos;quv yili uchun qabul bo&apos;yicha ma&apos;lumot
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3">
                Institutda 2026-o&apos;quv yili uchun malakaviy imtihonlar ro&apos;yxatdan o&apos;tish boshlandi.
              </p>
            </div>
            <Link
              href="/hujjatlar"
              className="text-xs font-bold text-[#245B82] hover:underline inline-flex items-center gap-1"
            >
              Batafsil <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>05.05.2026</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                  Imtihonlar
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                Ingliz tili imtihoni sanasi aniqlandi
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3">
                Ingliz tili bo&apos;yicha O&apos;zbekiston OAK talablari asosidagi imtihon sanalari rasmiy tasdiqlandi.
              </p>
            </div>
            <Link
              href="/imtihonlar"
              className="text-xs font-bold text-[#245B82] hover:underline inline-flex items-center gap-1"
            >
              Batafsil <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>20.04.2026</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800">
                  E&apos;lon
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                Hujjatlarni tayyorlash bo&apos;yicha yo&apos;riqnoma
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3">
                Ariza topshirish uchun zarur bo&apos;lgan hujjatlar ro&apos;yxati va ularni tayyorlash tartibi.
              </p>
            </div>
            <Link
              href="/hujjatlar"
              className="text-xs font-bold text-[#245B82] hover:underline inline-flex items-center gap-1"
            >
              Batafsil <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Featured Agro Photo Card (Image 2) */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md group min-h-[260px] flex flex-col justify-end p-6">
            <img
              src="/images/agriculture_field.jpg"
              alt="Qishloq xo'jaligi maydoni"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16324F] via-[#16324F]/80 to-transparent" />
            <div className="relative z-10 space-y-2 text-white">
              <h3 className="text-base font-black leading-snug">
                Bizning maqsadimiz — sizning muvaffaqiyatingiz!
              </h3>
              <p className="text-xs text-slate-200">
                Andijon qishloq xo&apos;jaligi instituti sizni o&apos;z bag&apos;riga chorlaydi.
              </p>
              <Link
                href="/aloqa"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/30 transition mt-2"
              >
                Institut haqida <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDIONS (Image 2 style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Title */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tez-tez so&apos;raladigan savollar
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Sizni qiziqtirgan savollarga javoblarni shu yerda topishingiz mumkin.
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16324F] hover:text-[#245B82] pt-2"
            >
              Barcha savollar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Right Accordions */}
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
                  className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/80 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-[#245B82] transition"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-full bg-slate-100 text-slate-600">
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
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
