'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/locales';
import { api } from '@/lib/api';
import { NavigationItem, SiteSettings } from '@/types';
import { MapPin, Phone, Mail, GraduationCap, Send, ExternalLink, Globe } from 'lucide-react';

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

  const siteTitle = lang === 'ru'
    ? (settings?.site_name_ru || "Андижанский институт сельского хозяйства и агротехнологий")
    : lang === 'oz'
    ? (settings?.site_name_oz || "Андижон қишлоқ хўжалиги ва агротехнологиялар институти")
    : (settings?.site_name_uz || "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti");

  const address = lang === 'ru'
    ? (settings?.contact_address_ru || "Андижанская область, Андижанский район, поселок Куйганёр, ул. Олийгох 1")
    : lang === 'oz'
    ? (settings?.contact_address_oz || "Андижон вилояти, Андижон тумани, Куйганёр қўрғони, Олийгоҳ кўчаси 1-уй")
    : (settings?.contact_address_uz || "Andijon viloyati, Andijon tumani, Kuyganyor qo'rg'oni, Oliygoh ko'chasi 1-uy");

  const copyright = settings?.footer_copyright_uz || "© 2026 Andijon qishloq xo'jaligi va agrotexnologiyalar instituti. Barcha huquqlar himoyalangan.";

  return (
    <footer className="bg-[#16324F] text-slate-300 border-t border-[#245B82]/50 mt-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 & 2: Institutional Identity & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#245B82] to-[#16324F] border border-[#80B4DB]/30 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6 text-[#80B4DB]" />
              </div>
              <div>
                <span className="font-bold text-white text-base leading-snug block">
                  {siteTitle}
                </span>
                <span className="text-[11px] text-[#80B4DB] tracking-wide block">
                  Ilmiy darajalar va malakaviy imtihonlar rasmiy portali
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
              O&apos;zbekiston Respublikasi Oliy attestatsiya komissiyasi (OAK) talablariga muvofiq chet tili (ingliz, nemis) va ixtisoslik fanlari bo&apos;yicha oliy ta&apos;limdan keyingi ta&apos;lim (PhD / DSc) malakaviy imtihonlarini tashkil etish, ro&apos;yxatdan o&apos;tkazish va elektron ruxsatnomalar berish tizimi.
            </p>

            {/* Social channels */}
            <div className="flex items-center gap-3 pt-2">
              {settings?.telegram_channel && (
                <a
                  href={settings.telegram_channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition"
                >
                  <Send className="w-3.5 h-3.5 text-[#80B4DB]" />
                  Telegram kanal
                </a>
              )}
              {settings?.official_website && (
                <a
                  href={settings.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition"
                >
                  <Globe className="w-3.5 h-3.5 text-[#80B4DB]" />
                  Rasmiy veb-sayt
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest text-[#80B4DB]">
              Tezkor havolalar
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {quickLinks.length > 0 ? (
                quickLinks.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url}
                      target={item.is_external ? '_blank' : undefined}
                      rel={item.is_external ? 'noopener noreferrer' : undefined}
                      className="text-slate-300 hover:text-white transition inline-flex items-center gap-1"
                    >
                      {item.title_uz}
                      {item.is_external && <ExternalLink className="w-3 h-3 text-slate-500" />}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/imtihonlar" className="hover:text-white transition">Imtihonlar jadvali</Link></li>
                  <li><Link href="/hujjatlar" className="hover:text-white transition">Hujjatlar talablari</Link></li>
                  <li><Link href="/faq" className="hover:text-white transition">Ko&apos;p so&apos;raladigan savollar</Link></li>
                  <li><Link href="/kabinet" className="hover:text-white transition">Talabgor kabineti</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Col 4: Institutional Contacts */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest text-[#80B4DB]">
              Institut bilan bog&apos;lanish
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#80B4DB] shrink-0 mt-0.5" />
                <span className="leading-snug">{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#80B4DB] shrink-0" />
                <span>{settings?.contact_phone || "+998 (74) 223-45-67"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#80B4DB] shrink-0" />
                <span>{settings?.contact_email || "ilm@aqxi.uz"}</span>
              </div>
              {settings?.work_hours && (
                <div className="text-[11px] text-slate-400 pt-1 border-t border-white/10">
                  Ish vaqti: <span className="text-slate-300">{settings.work_hours}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-700/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>{copyright}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {legalLinks.length > 0 ? (
              legalLinks.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.is_external ? '_blank' : undefined}
                  className="hover:text-white transition"
                >
                  {item.title_uz}
                </Link>
              ))
            ) : (
              <>
                <Link href="/hujjatlar" className="hover:text-white transition">Foydalanish qoidalari</Link>
                <Link href="/hujjatlar" className="hover:text-white transition">Maxfiylik siyosati</Link>
                <Link href="/aloqa" className="hover:text-white transition">Yordam markazi</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
