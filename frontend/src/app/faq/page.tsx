'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/locales';
import { HelpCircle, ChevronRight } from 'lucide-react';

export default function FAQPage() {
  const { t } = useTranslation();

  const faqs = [
    {
      q: "Malakaviy imtihonlarga kimlar ro'yxatdan o'tishi mumkin?",
      a: "Oliy attestatsiya komissiyasi (OAK) talablariga muvofiq oliy ta'limdan keyingi ta'lim institutlariga kirish va malakaviy imtihon sinovlariga tayyorlanayotgan ilmiy izlanuvchilar, tayanch doktorantlar, doktorantlar va mustaqil izlanuvchilar.",
    },
    {
      q: "Hujjatlar qanday formatda qabul qilinadi?",
      a: "Barcha hujjatlar asosan sifatli PDF formatida qabul qilinadi. Pasport nusxasi uchun JPG, JPEG va PNG formatlariga ham ruxsat berilgan. Har bir fayl hajmi 10 MB dan oshmasligi shart.",
    },
    {
      q: "Aloqa xati (6-hujjat) kimlar uchun majburiy?",
      a: "Aloqa xati faqat Andijon qishloq xo'jaligi va agrotexnologiyalar institutidan boshqa oliy ta'lim muassasasi yoki ilmiy-tadqiqot institutidan qatnashayotgan talabgorlar uchun majburiydir. Agar siz mazkur institutning o'zida tahsil olayotgan yoki faoliyat yuritayotgan bo'lsangiz, ushbu hujjat talab etilmaydi.",
    },
    {
      q: "Arizam holati 'Tuzatish talab qilinadi' bo'lsa nima qilishim kerak?",
      a: "Shaxsiy kabinetingizga kiring, qabul komissiyasi tomonidan ko'rsatilgan izohni o'qing, talab qilingan hujjat yoki ma'lumotni to'g'irlab yuklang va 'Qayta topshirish' tugmasini bosing.",
    },
    {
      q: "Imtihon qanday shaklda o'tkaziladi?",
      a: "Institut tomonidan e'lon qilingan jadval va auditoriyalarda an'anaviy (in-person) yozma va og'zaki sinov tarzida o'tkaziladi.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.nav.faq}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ro&apos;yxatdan o&apos;tish, hujjat topshirish va imtihon qoidalari bo&apos;yicha asosiy javoblar
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-[#80B4DB] transition"
          >
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#245B82] shrink-0 mt-0.5" />
              {faq.q}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
