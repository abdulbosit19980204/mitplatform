'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation, Language } from '@/lib/locales';
import {
  Menu,
  X,
  Globe,
  User as UserIcon,
  LogOut,
  GraduationCap,
  ShieldCheck,
  FileText,
} from 'lucide-react';

function HeaderContent() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/imtihonlar', label: t.nav.examinations },
    { href: '/hujjatlar', label: t.documents.title },
    { href: '/faq', label: t.nav.faq },
    { href: '/aloqa', label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#16324F] text-white shadow-md">
      {/* Top institutional strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Logo & Institution name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-lg bg-[#245B82] border border-white/20 flex items-center justify-center text-white font-bold text-xl tracking-wider shadow-inner">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-300 font-semibold">
                Oliy ta&apos;lim platformasi
              </div>
              <div className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight line-clamp-1">
                {t.institution}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#245B82] text-white'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Language switcher + User Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white/10 hover:bg-white/20 transition text-slate-200"
                aria-label="Tilni tanlash"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase">{lang}</span>
              </button>

              {langMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg py-1 border border-slate-200 z-50 text-slate-800 text-xs"
                  onClick={() => setLangMenuOpen(false)}
                >
                  <button
                    onClick={() => setLang('uz')}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between ${
                      lang === 'uz' ? 'font-bold text-[#245B82]' : ''
                    }`}
                  >
                    O&apos;zbekcha (lotin)
                    {lang === 'uz' && '✓'}
                  </button>
                  <button
                    onClick={() => setLang('oz')}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between ${
                      lang === 'oz' ? 'font-bold text-[#245B82]' : ''
                    }`}
                  >
                    Ўзбекча (кирилл)
                    {lang === 'oz' && '✓'}
                  </button>
                  <button
                    onClick={() => setLang('ru')}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between ${
                      lang === 'ru' ? 'font-bold text-[#245B82]' : ''
                    }`}
                  >
                    Русский
                    {lang === 'ru' && '✓'}
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' || user.role === 'reviewer' ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t.nav.admin}
                  </Link>
                ) : (
                  <Link
                    href="/kabinet"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#245B82] hover:bg-[#1c4969] text-white transition"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    {t.nav.cabinet}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  title={t.nav.logout}
                  className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/kirish"
                  className="px-3 py-1.5 rounded-md text-xs font-medium border border-white/30 text-white hover:bg-white/10 transition"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/royxatdan-otish"
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#245B82] hover:bg-[#1c4969] text-white transition"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-white/10 text-white"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#16324F] px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:text-white hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setLang('uz')}
                className={`px-2.5 py-1 text-xs rounded ${lang === 'uz' ? 'bg-[#245B82] text-white' : 'text-slate-300'}`}
              >
                UZ
              </button>
              <button
                onClick={() => setLang('oz')}
                className={`px-2.5 py-1 text-xs rounded ${lang === 'oz' ? 'bg-[#245B82] text-white' : 'text-slate-300'}`}
              >
                ЎЗ
              </button>
              <button
                onClick={() => setLang('ru')}
                className={`px-2.5 py-1 text-xs rounded ${lang === 'ru' ? 'bg-[#245B82] text-white' : 'text-slate-300'}`}
              >
                RU
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={user.role === 'admin' ? '/admin' : '/kabinet'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-amber-300 underline"
                >
                  {user.role === 'admin' ? t.nav.admin : t.nav.cabinet}
                </Link>
                <button onClick={handleLogout} className="text-sm text-red-300">
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/kirish"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 text-xs rounded border border-white/30 text-white"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/royxatdan-otish"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 text-xs rounded bg-[#245B82] text-white font-medium"
                >
                  {t.nav.register}
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
    <Suspense fallback={<header className="bg-[#16324F] h-18 text-white" />}>
      <HeaderContent />
    </Suspense>
  );
};
