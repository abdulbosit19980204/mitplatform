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
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.nav.examinations}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Barcha e&apos;lon qilingan va ro&apos;yxatdan o&apos;tish ochiq bo&apos;lgan imtihonlar ro&apos;yxati
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Imtihon nomi bo'yicha qidirish..."
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-[#245B82]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Til:</span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#245B82]"
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
        <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
          Hech qanday imtihon topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-[#80B4DB] transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase bg-blue-50 text-[#245B82] border border-[#245B82]/20">
                    {exam.language === 'en' ? 'Ingliz tili' : exam.language === 'de' ? 'Nemis tili' : exam.language}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium border ${
                      exam.is_registration_open
                        ? 'bg-emerald-50 text-[#16803C] border-[#16803C]/30'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {exam.is_registration_open ? "Ro'yxatga olish ochiq" : "Ro'yxatga olish yopilgan"}
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

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  href={`/imtihonlar/${exam.id}`}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Batafsil ma&apos;lumot
                </Link>

                {exam.is_registration_open ? (
                  <Link
                    href={`/ariza/yangi?exam=${exam.id}`}
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm"
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
