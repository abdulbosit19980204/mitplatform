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

  const navGroups = [
    {
      title: "Asosiy",
      items: [
        { href: '/admin', label: "Dashboard", icon: LayoutDashboard },
        { href: '/admin/arizalar', label: "Arizalar", icon: FileText },
        { href: '/admin/imtihon-yaratish', label: "Imtihon yaratish", icon: PlusCircle },
      ],
    },
    {
      title: "Tarkib boshqaruvi (CMS)",
      items: [
        { href: '/admin/kontent/bolimlar', label: "Bosh sahifa bo'limlari", icon: Layers },
        { href: '/admin/kontent/navigatsiya', label: "Navigatsiya menyusi", icon: Compass },
        { href: '/admin/kontent/elonlar', label: "E'lonlar", icon: Bell },
        { href: '/admin/kontent/faq', label: "Ko'p so'raladigan savollar", icon: HelpCircle },
        { href: '/admin/kontent/sahifalar', label: "Statik sahifalar matni", icon: FileCode },
      ],
    },
    {
      title: "Tizim",
      items: [
        { href: '/admin/sozlamalar', label: "Institut sozlamalari", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#16324F] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-[#80B4DB]" />
          <span className="font-bold text-sm tracking-tight">AQXI Administrator</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Persistent Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#16324F] text-slate-200 flex flex-col justify-between shrink-0 shadow-xl border-r border-[#245B82]/30 md:min-h-screen`}
      >
        <div className="p-5 space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#245B82] to-[#16324F] border border-[#80B4DB]/40 flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-6 h-6 text-[#80B4DB]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#80B4DB]">
                Boshqaruv markazi
              </div>
              <div className="text-sm font-black text-white leading-tight">
                AQXI Platformasi
              </div>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#80B4DB]/80 px-3">
                  {group.title}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
                          isActive
                            ? 'bg-[#245B82] text-white shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#80B4DB]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-white/10 bg-[#0f2338]">
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
      </aside>

      {/* Main Administrative Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10">
        {children}
      </main>
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
