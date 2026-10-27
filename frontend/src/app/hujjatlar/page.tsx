'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/locales';
import { FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function DocumentsGuidePage() {
  const { t } = useTranslation();

  const docList = [
    {
      num: 1,
      title: "Rektor nomiga ariza",
      desc: "Institut rektori nomiga yozilgan, belgilangan namunadagi rasmiy ariza. Arizada talabgorning shaxsiy ma'lumotlari, ixtisoslik shifri va imtihon turi aniq ko'rsatilishi shart.",
      format: "PDF (maksimal 10 MB)",
      mandatory: "Majburiy",
    },
    {
      num: 2,
      title: "Pasport nusxasi",
      desc: "Fuqarolik pasporti yoki identifikatsiya ID-kartasining barcha sahifalari yoki ikki tomonlama nusxasi.",
      format: "PDF, JPG, PNG (maksimal 10 MB)",
      mandatory: "Majburiy",
    },
    {
      num: 3,
      title: "Ma'lumotnoma (obyektivka)",
      desc: "Belgilangan davlat andozasidagi ma'lumotnoma (obyektivka) shakli, joriy ish yoki o'qish joyidan tasdiqlangan nusxasi.",
      format: "PDF (maksimal 10 MB)",
      mandatory: "Majburiy",
    },
    {
      num: 4,
      title: "Diplom nusxasi",
      desc: "Bakalavriat va magistratura oliy ma'lumot to'g'risidagi diplomlar hamda ularning baholar ilovasi nusxasi.",
      format: "PDF (maksimal 10 MB)",
      mandatory: "Majburiy",
    },
    {
      num: 5,
      title: "Mavzu tasdiqlanganligi haqidagi OTM ilmiy kengash bayonnomasidan ko'chirma yoki OAK byulletenida chop etilgan bo'lsa, uning nusxasi",
      desc: "Talabgor o'z holatiga muvofiq tegishli dalilni topshiradi: yoki OTM ilmiy kengashi qarori bayonnomasidan ko'chirma, yoki OAKning 'OAK Byulleteni' rasmiy nashrida dissertatsiya mavzusi e'lon qilingan sahifa nusxasi.",
      format: "PDF (maksimal 10 MB)",
      mandatory: "Majburiy",
    },
    {
      num: 6,
      title: "Aloqa xati — talabgor mazkur institutdan boshqa OTMdan qatnashsa",
      desc: "MUHIM SHARTLI QOIDA: Ushbu hujjat FAQAT talabgor Andijon qishloq xo'jaligi va agrotexnologiyalar institutidan boshqa oliy ta'lim yoki ilmiy-tadqiqot muassasasidan qatnashayotgan holatda majburiydir. Agar talabgor mazkur institutning o'zidan bo'lsa, ushbu hujjat talab etilmaydi.",
      format: "PDF (maksimal 10 MB)",
      mandatory: "Shartli (Faqat boshqa OTMdan qatnashuvchilar uchun)",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.documents.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Chet tili (ingliz va nemis tili) malakaviy imtihonlari uchun talab etiladigan 6 ta majburiy hujjat toifasi
        </p>
      </div>

      <div className="space-y-4">
        {docList.map((doc) => (
          <div
            key={doc.num}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-[#80B4DB] transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#16324F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {doc.num}
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {doc.title}
                </h3>
              </div>

              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${
                  doc.num === 6
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-blue-50 text-[#245B82] border border-[#245B82]/20'
                }`}
              >
                {doc.mandatory}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
              {doc.desc}
            </p>

            <div className="text-[11px] text-slate-400 font-medium pl-11 pt-1">
              Fayl formati: <span className="text-slate-700">{doc.format}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#16324F] text-white p-8 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">Hujjatlaringiz tayyormi?</h3>
          <p className="text-xs text-slate-300 mt-1">
            Imtihonni tanlang va qisqa vaqt ichida arizangizni topshiring.
          </p>
        </div>
        <Link
          href="/ariza/yangi"
          className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-[#245B82] hover:bg-[#1c4969] text-white transition shrink-0 flex items-center gap-1.5"
        >
          Ro&apos;yxatdan o&apos;tish
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
