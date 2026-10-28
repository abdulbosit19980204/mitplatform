'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import {
  LogIn,
  AlertCircle,
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.user?.role === 'admin' || res.user?.role === 'reviewer') {
        router.push('/admin');
      } else {
        router.push('/kabinet');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.error?.details ||
        'Email yoki parol noto‘g‘ri.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-[#0F2036] rounded-3xl border border-slate-200 dark:border-[#263B55] shadow-xl overflow-hidden max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2">
        {/* 1. Left Column: Auth Form (Mockup 2 style) */}
        <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Tizimga kirish
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hisobingizga kirish uchun quyidagi ma&apos;lumotlarni kiriting
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Telefon raqam yoki email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+998 90 123 45 67 yoki talabgor@aqxi.uz"
                  className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Parol
                </label>
                <Link
                  href="/parol-tiklash"
                  className="text-[11px] font-bold text-[#2563EB] dark:text-[#3B82F6] hover:underline"
                >
                  Parolni unutdingizmi?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 dark:border-slate-700 bg-white dark:bg-[#11263E]"
              />
              <label
                htmlFor="remember"
                className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none"
              >
                Meni eslab qolish
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative text-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-[#263B55]" />
            </div>
            <span className="relative bg-white dark:bg-[#0F2036] px-3 text-[11px] text-slate-400 font-semibold uppercase">
              Yoki
            </span>
          </div>

          {/* Google Auth Button (Mockup 2 style) */}
          <button
            type="button"
            onClick={() => alert("Google tizimi orqali autentifikatsiya yaqin orada yoqiladi.")}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#263B55] hover:bg-slate-50 dark:hover:bg-[#11263E] text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google orqali kirish
          </button>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Hisobingiz yo&apos;qmi?{' '}
            <Link
              href="/royxatdan-otish"
              className="font-bold text-[#2563EB] dark:text-[#3B82F6] hover:underline"
            >
              Ro&apos;yxatdan o&apos;ting
            </Link>
          </div>
        </div>

        {/* 2. Right Column: Photo of university campus with institution seal logo (Screen 2 in Reference Board) */}
        <div className="hidden lg:relative lg:flex flex-col justify-between p-10 bg-[#071426] text-white overflow-hidden">
          <img
            src="/images/university_building.jpg"
            alt="Andijon Qishloq Xo'jaligi Instituti"
            className="absolute inset-0 w-full h-full object-cover opacity-75 scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061527] via-[#071426]/75 to-[#0A203B]/60" />

          {/* Top Seal Badge */}
          <div className="relative z-10 flex flex-col items-center text-center pt-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl mb-3">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="font-black text-base tracking-tight leading-tight">
              Andijon Qishloq Xo&apos;jaligi Instituti
            </div>
            <div className="text-[11px] text-blue-200 mt-1">
              Imtihon Platformasi
            </div>
          </div>

          {/* Bottom message matching Screen 2 quote */}
          <div className="relative z-10 text-center pb-4 space-y-2">
            <div className="text-base sm:text-lg font-black leading-snug text-white">
              &ldquo;Bilim, mehnat va innovatsiya — muvaffaqiyat kaliti.&rdquo;
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Ilmiy tadqiqotlar va malakaviy imtihonlar yagona elektron tizimi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
