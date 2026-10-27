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
  Search,
  User as UserIcon,
  LogOut,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
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

  // Default institutional links matching Image 2 mockup
  const defaultLinks = [
    { href: '/', label: 'Bosh sahifa' },
    { href: '/imtihonlar', label: 'Imtihonlar' },
    { href: '/ariza/yangi', label: "Ro'yxatdan o'tish" },
    { href: '/hujjatlar', label: 'Hujjatlar' },
    { href: '/faq', label: 'FAQ' },
    { href: '/#yangiliklar', label: 'Yangiliklar' },
    { href: '/aloqa', label: 'Aloqa' },
  ];

  const renderedLinks =
    navItems.length > 0
      ? navItems.map((item) => ({
          href: item.url,
          label:
            lang === 'ru'
              ? item.title_ru || item.title_uz
              : lang === 'oz'
              ? item.title_oz || item.title_uz
              : item.title_uz,
          isExternal: item.is_external,
        }))
      : defaultLinks.map((d) => ({ ...d, isExternal: false }));

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/70 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 1. Institutional Emblem & Title (Image 2 style) */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-[#16324F] text-white flex items-center justify-center shadow-sm group-hover:bg-[#214768] transition">
              <GraduationCap className="w-6 h-6 text-[#80B4DB]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm sm:text-base font-extrabold text-[#16324F] tracking-tight">
                Andijon Qishloq
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                Xo&apos;jaligi Instituti
              </span>
            </div>
          </Link>

          {/* 2. Desktop Navigation Menu (Horizontal, Centered) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {renderedLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href.replace('/#', ''));

              return (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  target={link.isExternal ? '_blank' : undefined}
                  rel={link.isExternal ? 'noopener noreferrer' : undefined}
                  className={`text-xs sm:text-sm font-semibold transition-colors py-1 relative ${
                    isActive
                      ? 'text-[#245B82] font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#245B82] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right Side: Language Switcher, Search Icon, Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector (Image 2: UZ v) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition border border-transparent"
                aria-label="Tilni tanlash"
              >
                <span className="uppercase">{lang}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-md rounded-xl shadow-xl py-1 border border-slate-200/80 z-50 text-slate-800 text-xs"
                  onClick={() => setLangMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setLang('uz')}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                      lang === 'uz' ? 'font-bold text-[#16324F] bg-blue-50/50' : ''
                    }`}
                  >
                    <span>O&apos;zbekcha</span>
                    {lang === 'uz' && <span className="text-[#16803C] font-bold">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('oz')}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                      lang === 'oz' ? 'font-bold text-[#16324F] bg-blue-50/50' : ''
                    }`}
                  >
                    <span>Ўзбекча</span>
                    {lang === 'oz' && <span className="text-[#16803C] font-bold">✓</span>}
                  </button>
                  <button
                    type="button"
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

            {/* Search Icon Button */}
            <Link
              href="/imtihonlar"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition"
              title="Qidiruv"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  href={user.role === 'admin' || user.role === 'reviewer' ? '/admin' : '/kabinet'}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#16324F] hover:bg-[#214768] text-white transition shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] uppercase font-black">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <span>{user.role === 'admin' ? 'Boshqaruv' : 'Kabinet'}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title={t.nav.logout}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <Link
                  href="/kirish"
                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
                >
                  Kirish
                </Link>
                <Link
                  href="/royxatdan-otish"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#16324F] hover:bg-[#214768] text-white transition shadow-sm"
                >
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 border border-slate-200"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-3">
          {renderedLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#16324F] hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Tilni tanlang:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setLang('uz')}
                  className={`px-2.5 py-1 text-xs rounded-md font-bold ${
                    lang === 'uz' ? 'bg-[#16324F] text-white' : 'text-slate-600 bg-slate-100'
                  }`}
                >
                  UZ
                </button>
                <button
                  type="button"
                  onClick={() => setLang('oz')}
                  className={`px-2.5 py-1 text-xs rounded-md font-bold ${
                    lang === 'oz' ? 'bg-[#16324F] text-white' : 'text-slate-600 bg-slate-100'
                  }`}
                >
                  ЎЗ
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ru')}
                  className={`px-2.5 py-1 text-xs rounded-md font-bold ${
                    lang === 'ru' ? 'bg-[#16324F] text-white' : 'text-slate-600 bg-slate-100'
                  }`}
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
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#16324F] text-white"
                >
                  {user.role === 'admin' ? 'Boshqaruv paneli' : 'Shaxsiy kabinet'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  Chiqish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/kirish"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-center text-xs font-bold rounded-lg border border-slate-200 text-slate-800"
                >
                  Kirish
                </Link>
                <Link
                  href="/royxatdan-otish"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-center text-xs font-bold rounded-lg bg-[#16324F] text-white"
                >
                  Ro&apos;yxatdan o&apos;tish
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
    <Suspense fallback={<header className="bg-white/80 backdrop-blur-md h-20 border-b border-slate-200/60" />}>
      <HeaderContent />
    </Suspense>
  );
};
