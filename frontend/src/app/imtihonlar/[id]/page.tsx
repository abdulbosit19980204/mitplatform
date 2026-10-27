'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Examination } from '@/types';
import { api } from '@/lib/api';
import { useTranslation } from '@/lib/locales';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileCheck,
  ChevronRight,
  Shield,
  ArrowLeft,
} from 'lucide-react';

function ExaminationDetailContent() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [exam, setExam] = useState<Examination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      api
        .getExamination(String(id))
        .then((data) => setExam(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Imtihon topilmadi.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link
        href="/imtihonlar"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Barcha imtihonlarga qaytish
      </Link>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-[#263B55] pb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#2563EB]/20">
            {exam.language === 'en' ? 'Ingliz tili' : exam.language === 'de' ? 'Nemis tili' : exam.language}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
              exam.is_registration_open
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {exam.is_registration_open ? "Ro'yxatga olish ochiq" : "Ro'yxatga olish yopilgan"}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {exam.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            {exam.description || "Oliy ta'limdan keyingi ta'lim instituti uchun malakaviy imtihon sinovi."}
          </p>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 dark:bg-[#11263E]/60 rounded-xl border border-slate-200 dark:border-[#263B55] space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Ro&apos;yxatdan o&apos;tish muddati
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {new Date(exam.registration_start).toLocaleDateString()} — {new Date(exam.registration_end).toLocaleDateString()}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#11263E]/60 rounded-xl border border-slate-200 dark:border-[#263B55] space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Imtihon o&apos;tkaziladigan vaqt
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {exam.exam_date ? new Date(exam.exam_date).toLocaleString() : "E'lon qilinadi"}
            </div>
          </div>

          {exam.location && (
            <div className="p-4 bg-slate-50 dark:bg-[#11263E]/60 rounded-xl border border-slate-200 dark:border-[#263B55] space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                Manzil / Auditoriya
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {exam.location}
              </div>
            </div>
          )}

          {exam.capacity && (
            <div className="p-4 bg-slate-50 dark:bg-[#11263E]/60 rounded-xl border border-slate-200 dark:border-[#263B55] space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                Umumiy sig&apos;im
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {exam.capacity} kishi ({exam.registered_count} ta ro&apos;yxatdan o&apos;tgan)
              </div>
            </div>
          )}
        </div>

        {/* Required Documents Section */}
        {exam.required_documents && exam.required_documents.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#263B55]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
              Talab qilinadigan hujjatlar
            </h3>
            <div className="space-y-2">
              {exam.required_documents.map((reqDoc) => (
                <div
                  key={reqDoc.id}
                  className="p-3 bg-slate-50 dark:bg-[#11263E]/60 rounded-xl border border-slate-200 dark:border-[#263B55] text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {reqDoc.document_type.sort_order}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {reqDoc.document_type.name_uz}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {reqDoc.document_type.description_uz}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-6 border-t border-slate-100 dark:border-[#263B55] flex items-center justify-end">
          {exam.is_registration_open ? (
            <Link
              href={`/ariza/yangi?exam=${exam.id}`}
              className="px-8 py-3 rounded-xl text-sm font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-md flex items-center gap-2"
            >
              Ro&apos;yxatdan o&apos;tishni boshlash
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Ushbu imtihonga ro&apos;yxatga olish yopilgan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExaminationDetailPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">Yuklanmoqda...</div>}>
      <ExaminationDetailContent />
    </Suspense>
  );
}
