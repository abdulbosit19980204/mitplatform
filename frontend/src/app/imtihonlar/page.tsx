'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Examination } from '@/types';
import { api } from '@/lib/api';
import { useTranslation } from '@/lib/locales';
import { Calendar, Clock, Search, Filter } from 'lucide-react';

export default function ExaminationsPage() {
  const { t } = useTranslation();
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchExams();
  }, [selectedLang]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedLang !== 'all') params.language = selectedLang;
      const data = await api.getExaminations(params);
      setExaminations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = examinations.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.nav.examinations}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Barcha e&apos;lon qilingan va ro&apos;yxatdan o&apos;tish ochiq bo&apos;lgan imtihonlar ro&apos;yxati
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-[#0F2036] p-4 rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Imtihon nomi bo'yicha qidirish..."
            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-xl pl-9 pr-3 py-2 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Til:</span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-slate-800 dark:text-slate-100 rounded-xl px-3 py-1.5 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
          >
            <option value="all">Barcha tillar</option>
            <option value="en">Ingliz tili</option>
            <option value="de">Nemis tili</option>
            <option value="uz">O&apos;zbek tili</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Yuklanmoqda...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0F2036] p-10 rounded-2xl border border-slate-200 dark:border-[#263B55] text-center text-slate-500 dark:text-slate-400 text-sm">
          Hech qanday imtihon topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((exam) => (
            <div
              key={exam.id}
              className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm p-6 flex flex-col justify-between hover:border-[#2563EB]/40 dark:hover:border-[#3B82F6]/40 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#2563EB]/20">
                    {exam.language === 'en' ? 'Ingliz tili' : exam.language === 'de' ? 'Nemis tili' : exam.language}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      exam.is_registration_open
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {exam.is_registration_open ? "Ro'yxatga olish ochiq" : "Ro'yxatga olish yopilgan"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition">
                  {exam.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {exam.description || "Oliy ta'limdan keyingi ta'lim malakaviy imtihoni."}
                </p>

                <div className="space-y-1.5 pt-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Qabul muddati: {new Date(exam.registration_start).toLocaleDateString()} — {new Date(exam.registration_end).toLocaleDateString()}
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

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-[#263B55] flex items-center justify-between gap-3">
                <Link
                  href={`/imtihonlar/${exam.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#162B45] hover:bg-slate-200 dark:hover:bg-[#1f385a] transition"
                >
                  Batafsil ma&apos;lumot
                </Link>

                {exam.is_registration_open ? (
                  <Link
                    href={`/ariza/yangi?exam=${exam.id}`}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm"
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-xs text-slate-400 font-medium">
                    Muddati tugagan
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
