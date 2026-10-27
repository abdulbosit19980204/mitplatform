'use client';

import React from 'react';
import { useTranslation } from '@/lib/locales';
import { MapPin, Phone, Mail, Clock, Building2 } from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.nav.contact}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Andijon qishloq xo&apos;jaligi va agrotexnologiyalar instituti qabul komissiyasi aloqa ma&apos;lumotlari
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#245B82]" />
            Institut manzili
          </h3>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#245B82] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Manzil:</strong>
                <p className="text-slate-500 mt-0.5">
                  170600, O&apos;zbekiston Respublikasi, Andijon viloyati, Andijon tumani, Kuyganyor shaharchasi, Oliygoh ko&apos;chasi 1-uy.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#245B82] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Telefon:</strong>
                <p className="text-slate-500 mt-0.5">+998 74 223 45 67, +998 74 223 45 68</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#245B82] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Elektron pochta:</strong>
                <p className="text-slate-500 mt-0.5">qabul@aqxi.uz, info@aqxi.uz</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b pb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#245B82]" />
            Ish tartibi
          </h3>

          <div className="space-y-2 text-xs sm:text-sm text-slate-700">
            <div>
              <strong className="text-slate-900">Dushanba — Juma:</strong>
              <p className="text-slate-500">09:00 dan 18:00 gacha</p>
            </div>
            <div>
              <strong className="text-slate-900">Tushlik tanaffusi:</strong>
              <p className="text-slate-500">13:00 dan 14:00 gacha</p>
            </div>
            <div>
              <strong className="text-slate-900">Shanba — Yakshanba:</strong>
              <p className="text-slate-500">Dam olish kunlari</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
