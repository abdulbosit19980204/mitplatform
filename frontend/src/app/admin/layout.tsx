'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  PlusCircle,
  Settings,
  Bell,
  HelpCircle,
  Menu,
  X,
  GraduationCap,
  LogOut,
  Layers,
  Compass,
  FileCode,
  ShieldCheck,
  Activity,
  ChevronRight,
  Database,
  Building2,
  Search,
} from 'lucide-react';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
        router.push('/kirish');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] text-slate-400 text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  // Exact navigation from Mockup 04 & 06
  const primaryNavItems = [
    { href: '/admin', label: 'Bosh sahifa', icon: LayoutDashboard },
    { href: '/admin/imtihon-yaratish', label: 'Imtihonlar', icon: Calendar },
    { href: '/admin/arizalar', label: 'Arizalar', icon: FileText },
    { href: '/admin/arizalar', label: 'Hujjatlar tekshiruvi', icon: ShieldCheck },
    { href: '/imtihonlar', label: 'Imtihon jadvali', icon: Activity },
    { href: '/admin/malumotlar-bazasi', label: "Ma'lumotlar bazasi", icon: Database },
  ];

  const cmsNavItems = [
    { href: '/admin/kontent/bolimlar', label: "Bosh sahifa bo'limlari", icon: Layers },
    { href: '/admin/kontent/navigatsiya', label: 'Navigatsiya', icon: Compass },
    { href: '/admin/kontent/elonlar', label: "E'lonlar", icon: Bell },
    { href: '/admin/kontent/faq', label: 'FAQ', icon: HelpCircle },
    { href: '/admin/kontent/sahifalar', label: 'Sahifalar matni', icon: FileCode },
    { href: '/admin/sozlamalar', label: 'Institut sozlamalari', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* 1. Deep Navy Sidebar (Mockup 04 style) */}
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0f2238] border-r border-white/5 flex flex-col justify-between z-50 shrink-0 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Brand */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5 text-[#80B4DB]" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-black text-white tracking-tight">
                  Administrator paneli
                </span>
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  AQXI Boshqaruv
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

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
            {/* Primary group */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Asosiy
              </div>
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
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
            </div>

            {/* CMS & Settings group */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Kontent va Sozlamalar
              </div>
              {cmsNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
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
            </div>
          </nav>

          {/* User profile card & logout */}
          <div className="p-4 border-t border-white/10 bg-[#0c1c2e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  {user.full_name?.charAt(0) || 'A'}
                </div>
                <div className="truncate text-xs">
                  <div className="font-bold text-white truncate">{user.full_name}</div>
                  <div className="text-[10px] text-amber-300 font-semibold uppercase">
                    {user.role === 'admin' ? 'Administrator' : 'Komissiya a\'zosi'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                title="Chiqish"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content + Top Bar (Mockup 04 style) */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top bar inside Admin */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input (Mockup 04) */}
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Qidiruv..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#80B4DB]"
              />
            </div>
          </div>

          {/* Right: Notification Bell + Admin Avatar (Mockup 04) */}
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
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user.full_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-900">{user.full_name}</span>
                <span className="text-[10px] text-amber-700 font-semibold uppercase">
                  {user.role === 'admin' ? 'Administrator' : 'Komissiya a\'zosi'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] text-slate-400 text-sm">
          Yuklanmoqda...
        </div>
      }
    >
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
