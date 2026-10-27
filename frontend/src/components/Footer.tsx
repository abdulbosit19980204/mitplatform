'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/locales';
import { api } from '@/lib/api';
import { NavigationItem, SiteSettings } from '@/types';
import { MapPin, Phone, Mail, GraduationCap, Send, Globe, Share2, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, lang } = useTranslation();
  const [quickLinks, setQuickLinks] = useState<NavigationItem[]>([]);
  const [legalLinks, setLegalLinks] = useState<NavigationItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    Promise.all([
      api.getNavigation('footer_quick').catch(() => []),
      api.getNavigation('footer_legal').catch(() => []),
      api.getSiteSettings().catch(() => null),
    ]).then(([quick, legal, s]) => {
      if (quick && quick.length > 0) setQuickLinks(quick);
      if (legal && legal.length > 0) setLegalLinks(legal);
      if (s) setSettings(s);
    });
  }, []);

  const copyright =
    settings?.footer_copyright_uz ||
    "© 2026 Andijon qishloq xo'jaligi instituti. Barcha huquqlar himoyalangan.";

  return (
    <footer className="bg-[#16324F] text-slate-300 border-t border-slate-700/60 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 & 2: Institutional Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6 text-[#80B4DB]" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-extrabold text-white tracking-tight">
                  Andijon Qishloq
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  Xo&apos;jaligi Instituti
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Oliy ta&apos;limdan keyingi ta&apos;lim (PhD / DSc) izlanuvchilari va talabgorlari uchun
              malakaviy imtihonlarni tashkil etish, arizalarni qabul qilish va elektron ruxsatnomalar
              berish tizimi.
            </p>
          </div>

          {/* Col 3: Asosiy sahifalar */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Asosiy sahifalar
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link href="/imtihonlar" className="hover:text-white transition">
                  Imtihonlar
                </Link>
              </li>
              <li>
                <Link href="/ariza/yangi" className="hover:text-white transition">
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </li>
              <li>
                <Link href="/hujjatlar" className="hover:text-white transition">
                  Hujjatlar
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Ma'lumot */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Ma&apos;lumot
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/#yangiliklar" className="hover:text-white transition">
                  Yangiliklar
                </Link>
              </li>
              <li>
                <Link href="/aloqa" className="hover:text-white transition">
                  Aloqa
                </Link>
              </li>
              <li>
                <Link href="/aloqa" className="hover:text-white transition">
                  Institut haqida
                </Link>
              </li>
              <li>
                <Link href="/hujjatlar" className="hover:text-white transition">
                  Maxfiylik siyosati
                </Link>
              </li>
              <li>
                <Link href="/hujjatlar" className="hover:text-white transition">
                  Foydalanish shartlari
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Biz bilan bog'laning */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Biz bilan bog&apos;laning
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#80B4DB] shrink-0" />
                <a href="mailto:info@institut.uz" className="hover:text-white transition">
                  {settings?.contact_email || 'info@institut.uz'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#80B4DB] shrink-0" />
                <a href="tel:+998742234567" className="hover:text-white transition">
                  {settings?.contact_phone || '+998 74 223 45 67'}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#80B4DB] shrink-0 mt-0.5" />
                <span>
                  {settings?.contact_address_uz || 'Andijon viloyati, Andijon shahri'}
                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings?.telegram_channel || 'https://t.me'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Telegram"
              >
                <Send className="w-3.5 h-3.5" />
              </a>
              <a
                href={settings?.official_website || 'https://aqxi.uz'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Veb-sayt"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Ijtimoiy tarmoq"
              >
                <Share2 className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-700/60 mt-10 pt-6 text-center text-xs text-slate-500">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};
