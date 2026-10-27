'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/locales';
import { api } from '@/lib/api';
import { RequiredDocumentType, ContentPage } from '@/types';
import { FileText, CheckCircle2, AlertCircle, ArrowRight, BookOpen, ShieldCheck, Download } from 'lucide-react';

export default function DocumentsGuidePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'docs' | 'rules' | 'privacy'>('docs');
  const [docTypes, setDocTypes] = useState<RequiredDocumentType[]>([]);
  const [pageContent, setPageContent] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDocumentTypes().catch(() => []),
      api.getContentPage('hujjatlar-yoriqnomasi').catch(() => null),
    ]).then(([docs, page]) => {
      if (docs && docs.length > 0) setDocTypes(docs);
      if (page) setPageContent(page);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <div className="text-xs uppercase tracking-widest text-[#245B82] font-bold mb-1">
          Yo&apos;riqnoma va talablar
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Hujjatlar va imtihon qoidalari
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          O&apos;zbekiston Respublikasi OAK va institut nizomiga muvofiq talab etiladigan hujjatlar
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('docs')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'docs'
              ? 'border-[#245B82] text-[#245B82]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          6 ta majburiy hujjat toifasi
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'rules'
              ? 'border-[#245B82] text-[#245B82]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          OAK Nizomi va talablari
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'privacy'
              ? 'border-[#245B82] text-[#245B82]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Xavfsizlik va maxfiylik
        </button>
      </div>

      {/* TAB 1: 6 DOCUMENTS */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          {docTypes.map((doc) => {
            const isDoc6 = doc.code === 'liaison_letter';
            return (
              <div
                key={doc.id}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2.5 hover:border-[#80B4DB] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#16324F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {doc.sort_order}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {doc.name_uz}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
                      isDoc6
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-50 text-[#245B82] border border-[#245B82]/20'
                    }`}
                  >
                    {isDoc6 ? "Shartli (boshqa OTMdan bo'lsa)" : "Majburiy"}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
                  {doc.description_uz || (isDoc6
                    ? "Talabgor Andijon qishloq xo'jaligi va agrotexnologiyalar institutidan boshqa tashkilotdan qatnashayotganda o'z muassasasi rahbariyati tomonidan yozilgan rasmiy aloqa xati yuklanishi shart."
                    : "Institut rektori nomiga yozilgan rasmiy ariza va tasdiqlangan hujjat nusxasi.")}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium pl-11 pt-1">
                  <span>Ruxsat etilgan format: <strong className="text-slate-700 uppercase">{doc.accepted_formats}</strong></span>
                  <span>|</span>
                  <span>Maksimal hajm: <strong className="text-slate-700">{doc.max_size_mb} MB</strong></span>
                </div>
              </div>
            );
          })}

          <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-[#16324F] text-sm">Hujjatlaringiz tayyormi?</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Hoziroq onlayn ariza shaklini to&apos;ldiring va ro&apos;yxatdan o&apos;ting.
              </p>
            </div>
            <Link
              href="/ariza/yangi"
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm inline-flex items-center gap-1.5 shrink-0"
            >
              Ariza topshirish
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: RULES */}
      {activeTab === 'rules' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-[#16324F] font-bold text-base">
            <BookOpen className="w-5 h-5 text-[#245B82]" />
            Malakaviy imtihonlarni tashkil etish qoidalari
          </div>

          <p>
            O&apos;zbekiston Respublikasi Oliy attestatsiya komissiyasi Rayosatining qarori bilan tasdiqlangan &quot;Malakaviy imtihonlarni o&apos;tkazish tartibi to&apos;g&apos;risidagi Nizom&quot;ga asosan:
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              Malakaviy imtihonlar oliy ta&apos;limdan keyingi ta&apos;lim institutlarida ilmiy darajalar beruvchi ilmiy kengashlar tuzilgan muassasalarda tashkil etiladi.
            </li>
            <li>
              Talabgor har bir chet tili (ingliz, nemis, fransuz) bo&apos;yicha kamida belgilangan muddatlarda tegishli test va og&apos;zaki sinovlardan muvaffaqiyatli o&apos;tishi shart.
            </li>
            <li>
              Imtihon sinovlariga kirishda talabgorning shaxsini tasdiqlovchi fuqarolik pasporti yoki ID-karta hamda portal orqali shakllantirilgan <strong>rasmiy ruxsatnoma varaqasi</strong> taqdim etilishi shart.
            </li>
            <li>
              Imtihon jarayonida texnik aloqa vositalari, konspektlar, lug&apos;atlar yoki ruxsat etilmagan boshqa manbalardan foydalanish qat&apos;iyan taqiqlanadi va chetlatishga sabab bo&apos;ladi.
            </li>
          </ul>
        </div>
      )}

      {/* TAB 3: PRIVACY & DATA POLICY */}
      {activeTab === 'privacy' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-[#16324F] font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-[#16803C]" />
            Shaxsiy ma&apos;lumotlar xavfsizligi va maxfiylik siyosati
          </div>

          <p>
            Andijon qishloq xo&apos;jaligi va agrotexnologiyalar instituti talabgorlar tomonidan taqdim etilgan barcha shaxsiy ma&apos;lumotlar (F.I.SH, pasport, JSHSHIR, aloqa ma&apos;lumotlari va ilmiy hujjatlar) xavfsizligini ta&apos;minlaydi:
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              Yuklangan barcha hujjatlar xavfsiz yopiq server kataloglarida shifrlangan holatda saqlanadi va umumiy internet tarmog&apos;iga ochiq berilmaydi.
            </li>
            <li>
              Hujjatlar faqatgina rasmiy tayinlangan Qabul komissiyasi a&apos;zolari va ilmiy bo&apos;lim ekspertlari tomonidan attestatsiya maqsadida ko&apos;rib chiqiladi.
            </li>
            <li>
              Uchinchi shaxslarga talabgorning ruxsatisiz shaxsiy ma&apos;lumotlarni uzatish qat&apos;iyan taqiqlanadi.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
