'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  GraduationCap,
  Home,
  FileText,
  FileCheck2,
  Calendar,
  Bell,
  User,
  LogOut,
  Search,
  Menu,
  X,
} from 'lucide-react';

function CabinetLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/kirish');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] text-slate-400 text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  const navItems = [
    { href: '/kabinet', label: 'Bosh sahifa', icon: Home },
    { href: '/kabinet?tab=arizalar', label: 'Mening arizalarim', icon: FileText },
    { href: '/kabinet?tab=hujjatlar', label: 'Hujjatlarim', icon: FileCheck2 },
    { href: '/imtihonlar', label: 'Imtihon jadvali', icon: Calendar },
    { href: '/kabinet?tab=bildirishnomalar', label: 'Bildirishnomalar', icon: Bell },
    { href: '/kabinet?tab=profil', label: 'Profil', icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-[#F5F7FA]">
      {/* 1. Deep Navy Sidebar (Mockup 02 style) */}
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0f2238] border-r border-white/5 flex flex-col justify-between z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5 text-[#80B4DB]" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-black text-white tracking-tight">
                  Andijon Qishloq
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Xo&apos;jaligi Instituti
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#245B82] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#80B4DB]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer: Chiqish */}
          <div className="p-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-white/5 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area + Top Bar (Mockup 02 style) */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top bar inside cabinet */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Qidiruv..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#80B4DB]"
              />
            </div>
          </div>

          {/* Right: Notifications & User profile pill */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative"
              title="Bildirishnomalar"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5" />
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#16324F] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user.full_name?.charAt(0) || 'T'}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-900">{user.full_name}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  Talabgor
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Child Pages */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] text-slate-400 text-sm">
          Yuklanmoqda...
        </div>
      }
    >
      <CabinetLayoutInner>{children}</CabinetLayoutInner>
    </Suspense>
  );
}
