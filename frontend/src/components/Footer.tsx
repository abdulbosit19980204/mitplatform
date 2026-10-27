'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/locales';
import { MapPin, Phone, Mail, GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#16324F] text-slate-300 border-t border-slate-700/50 mt-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#245B82] flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-bold text-white text-base">
                {t.institution}
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
              Oliy attestatsiya komissiyasi (OAK) va oliy ta&apos;limdan keyingi ta&apos;lim institutlari talablariga muvofiq malakaviy imtihonlarni tashkil etish va ro&apos;yxatga olish rasmiy tizimi.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Havolalar
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/imtihonlar" className="hover:text-white transition">
                  {t.nav.examinations}
                </Link>
              </li>
              <li>
                <Link href="/hujjatlar" className="hover:text-white transition">
                  {t.documents.title}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  {t.nav.faq}
                </Link>
              </li>
              <li>
                <Link href="/aloqa" className="hover:text-white transition">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact details */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              {t.nav.contact}
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#80B4DB] shrink-0 mt-0.5" />
                <span>Andijon viloyati, Andijon tumani, Kuyganyor shaharchasi</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#80B4DB] shrink-0" />
                <span>+998 74 223 45 67</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#80B4DB] shrink-0" />
                <span>qabul@aqxi.uz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-700/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 {t.institution}. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-4">
            <Link href="/aloqa" className="hover:text-white transition">Maxfiylik siyosati</Link>
            <Link href="/aloqa" className="hover:text-white transition">Foydalanish qoidalari</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
