'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import { api } from '@/lib/api';
import { NavigationItem, SiteSettings } from '@/types';
import {
  Menu,
  X,
  Globe,
  User as UserIcon,
  LogOut,
  GraduationCap,
  ShieldCheck,
  Phone,
  FileCheck2,
} from 'lucide-react';

function HeaderContent() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Dynamic Navigation & Settings
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    Promise.all([
      api.getNavigation('header').catch(() => []),
      api.getSiteSettings().catch(() => null),
    ]).then(([navData, settingsData]) => {
      if (navData && navData.length > 0) {
        setNavItems(navData);
      }
      if (settingsData) {
        setSiteSettings(settingsData);
      }
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Fallback links if CMS is empty or loading
  const defaultLinks = [
    { href: '/imtihonlar', label: t.nav.examinations },
    { href: '/hujjatlar', label: t.documents.title },
    { href: '/faq', label: t.nav.faq },
    { href: '/aloqa', label: t.nav.contact },
  ];

  const renderedLinks = navItems.length > 0
    ? navItems.map((item) => ({
        href: item.url,
        label: lang === 'ru' ? (item.title_ru || item.title_uz) : lang === 'oz' ? (item.title_oz || item.title_uz) : item.title_uz,
        isExternal: item.is_external,
      }))
    : defaultLinks.map((d) => ({ href: d.href, label: d.label, isExternal: false }));

  const siteTitle = lang === 'ru'
    ? (siteSettings?.site_name_ru || "Андижанский институт сельского хозяйства и агротехнологий")
    : lang === 'oz'
    ? (siteSettings?.site_name_oz || "Андижон қишлоқ хўжалиги ва агротехнологиялар институти")
    : (siteSettings?.site_name_uz || "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti");

  const siteMotto = lang === 'ru'
    ? (siteSettings?.motto_ru || "Портал высшей аттестации и квалификационных экзаменов")
    : lang === 'oz'
    ? (siteSettings?.motto_oz || "Олий аттестация ва малакавий имтиҳонлар расмий портали")
    : (siteSettings?.motto_uz || "Oliy attestatsiya va malakaviy imtihonlar rasmiy portali");

  return (
    <header className="sticky top-0 z-50 bg-[#16324F] text-white shadow-md border-b border-[#245B82]/40">
      {/* 1. Top Institutional Editorial Bar (SEA Journal inspired) */}
      <div className="bg-[#0f2338] text-slate-300 border-b border-white/5 text-[11px] py-1 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200 uppercase tracking-widest text-[10px]">
              O&apos;zbekiston Respublikasi Qishloq xo&apos;jaligi vazirligi
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">
              OAK ro&apos;yxatidagi malakaviy imtihon markazi
            </span>
          </div>

          <div className="flex items-center gap-4">
            {siteSettings?.contact_phone && (
              <a
                href={`tel:${siteSettings.contact_phone}`}
                className="hover:text-white transition flex items-center gap-1.5"
              >
                <Phone className="w-3 h-3 text-[#80B4DB]" />
                <span className="hidden sm:inline">{siteSettings.contact_phone}</span>
              </a>
            )}
            <span className="text-slate-500">|</span>
            <span className="text-[#80B4DB] font-semibold">2026 Sessiya</span>
          </div>
        </div>
      </div>

      {/* 2. Main Institutional Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Institutional Crest & Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#245B82] to-[#16324F] border border-[#80B4DB]/30 flex items-center justify-center text-white shadow-md group-hover:border-[#80B4DB] transition">
              <GraduationCap className="w-7 h-7 text-[#80B4DB]" />
            </div>
            <div className="max-w-md">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#80B4DB] line-clamp-1">
                {siteMotto}
              </div>
              <div className="text-sm sm:text-base font-black text-white tracking-tight leading-tight line-clamp-1">
                {siteTitle}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                pathname === '/'
                  ? 'bg-[#245B82] text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.nav.home}
            </Link>

            {renderedLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.isExternal ? '_blank' : undefined}
                  rel={link.isExternal ? 'noopener noreferrer' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                    isActive
                      ? 'bg-[#245B82] text-white shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Language switcher + User Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/10 transition text-slate-200"
                aria-label="Tilni tanlash"
              >
                <Globe className="w-3.5 h-3.5 text-[#80B4DB]" />
                <span className="uppercase">{lang}</span>
              </button>

              {langMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl py-1.5 border border-slate-200 z-50 text-slate-800 text-xs"
                  onClick={() => setLangMenuOpen(false)}
                >
                  <button
                    onClick={() => setLang('uz')}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                      lang === 'uz' ? 'font-bold text-[#16324F] bg-blue-50/50' : ''
                    }`}
                  >
                    <span>O&apos;zbekcha (lotin)</span>
                    {lang === 'uz' && <span className="text-[#16803C] font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => setLang('oz')}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                      lang === 'oz' ? 'font-bold text-[#16324F] bg-blue-50/50' : ''
                    }`}
                  >
                    <span>Ўзбекча (кирилл)</span>
                    {lang === 'oz' && <span className="text-[#16803C] font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => setLang('ru')}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                      lang === 'ru' ? 'font-bold text-[#16324F] bg-blue-50/50' : ''
                    }`}
                  >
                    <span>Русский</span>
                    {lang === 'ru' && <span className="text-[#16803C] font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/15">
                {user.role === 'admin' || user.role === 'reviewer' ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {user.role === 'admin' ? 'Boshqaruv paneli' : 'Ekspert paneli'}
                  </Link>
                ) : (
                  <Link
                    href="/kabinet"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1f4e70] text-white transition shadow-sm"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#80B4DB]" />
                    {t.nav.cabinet}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  title={t.nav.logout}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-white/15">
                <Link
                  href="/kirish"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-white/20 text-white hover:bg-white/10 transition"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/ariza/yangi"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-[#80B4DB]" />
                  Ariza topshirish
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 text-white border border-white/10"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#16324F] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10"
          >
            {t.nav.home}
          </Link>

          {renderedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Tilni tanlang:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setLang('uz')}
                  className={`px-2.5 py-1 text-xs rounded-md font-bold ${lang === 'uz' ? 'bg-[#245B82] text-white' : 'text-slate-300 bg-white/5'}`}
                >
                  UZ
                </button>
                <button
                  onClick={() => setLang('oz')}
                  className={`px-2.5 py-1 text-xs rounded-md font-bold ${lang === 'oz' ? 'bg-[#245B82] text-white' : 'text-slate-300 bg-white/5'}`}
                >
                  ЎЗ
                </button>
                <button
                  onClick={() => setLang('ru')}
                  className={`px-2.5 py-1 text-xs rounded-md font-bold ${lang === 'ru' ? 'bg-[#245B82] text-white' : 'text-slate-300 bg-white/5'}`}
                >
                  RU
                </button>
              </div>
            </div>

            {user ? (
              <div className="flex items-center justify-between pt-2">
                <Link
                  href={user.role === 'admin' ? '/admin' : '/kabinet'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#245B82] text-white"
                >
                  {user.role === 'admin' ? 'Boshqaruv paneli' : t.nav.cabinet}
                </Link>
                <button onClick={handleLogout} className="text-xs text-red-300 font-semibold hover:underline">
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/kirish"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-center text-xs font-bold rounded-lg border border-white/20 text-white"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/ariza/yangi"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-center text-xs font-bold rounded-lg bg-[#245B82] text-white"
                >
                  Ariza topshirish
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export const Header: React.FC = () => {
  return (
    <Suspense fallback={<header className="bg-[#16324F] h-20 text-white" />}>
      <HeaderContent />
    </Suspense>
  );
};
