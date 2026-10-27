'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import {
  UserPlus,
  AlertCircle,
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    password_confirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.password !== formData.password_confirm) {
      setErrorMsg('Kiritilgan parollar bir-biriga mos kelmadi.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('Parol kamida 8 ta belgidan iborat bo‘lishi kerak.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Platformadan foydalanish qoidalariga rozilik bildirishingiz shart.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      router.push('/kabinet');
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.error?.details ||
        'Ro\'yxatdan o\'tishda xatolik yuz berdi.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-[#0F2036] rounded-3xl border border-slate-200 dark:border-[#263B55] shadow-xl overflow-hidden max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2">
        {/* 1. Left Column: Registration Form */}
        <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Ro&apos;yxatdan o&apos;tish
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Abituriyent shaxsiy kabinetini oching va imtihonlarga onlayn ariza topshiring
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                To&apos;liq ism-sharifingiz (F.I.SH)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Karimov Anvar Rustamovich"
                  className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email manzil
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="anvar@example.uz"
                  className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telefon raqam
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Parol
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Kamida 8 ta belgi"
                  className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] rounded-xl pl-10 pr-10 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.password_confirm}
                  onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                  placeholder="Parolni qayta kiriting"
                  className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] rounded-xl pl-10 pr-10 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-[#2563EB] rounded border-slate-300 dark:border-[#263B55] focus:ring-[#2563EB] mt-0.5"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  Tizimdan foydalanish shartlari va shaxsiy ma&apos;lumotlarni qayta ishlashga rozilik bildiraman.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-[#263B55] text-center text-xs text-slate-500 dark:text-slate-400">
            Allaqachon hisobingiz bormi?{' '}
            <Link
              href="/kirish"
              className="font-bold text-[#2563EB] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1"
            >
              Tizimga kiring
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Right Column: Institutional Identity Graphic */}
        <div className="hidden lg:flex relative bg-[#071426] flex-col justify-between p-12 text-white overflow-hidden">
          {/* Subtle institutional pattern backdrop */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-black text-sm tracking-wide">AQXI IMTIHON</div>
              <div className="text-[10px] text-slate-300">Andijon Qishloq Xo&apos;jaligi Instituti</div>
            </div>
          </div>

          <div className="relative z-10 space-y-4 my-auto py-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Rasmiy qabul va imtihon tizimi
            </div>
            <h2 className="text-2xl font-bold leading-snug">
              Ilmiy faoliyatingiz sari ishonchli qadam tashlang
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Chet tili malakaviy imtihonlari va ilmiy attestatsiya sinovlariga onlayn ro&apos;yxatdan o&apos;ting, arizangiz ko&apos;rib chiqilish holatini kuzatib boring.
            </p>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 border-t border-white/10 pt-4 flex items-center justify-between">
            <span>Andijon, O&apos;zbekiston</span>
            <span>aqxi.uz</span>
          </div>
        </div>
      </div>
    </div>
  );
}
