'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import { UserPlus, AlertCircle, GraduationCap } from 'lucide-react';

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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.password !== formData.password_confirm) {
      setErrorMsg('Kiritilgan parollar bir-biriga mos kelmadi.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      router.push('/kabinet');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.error?.details || 'Ro\'yxatdan o\'tishda xatolik yuz berdi.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#16324F] text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ro&apos;yxatdan o&apos;tish
          </h1>
          <p className="text-xs text-slate-500">
            Abituriyent sifatida ro&apos;yxatdan o&apos;ting va arizangizni topshiring
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              F.I.SH (To&apos;liq ismingiz)
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Karimov Anvar Rustamovich"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email manzil
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="anvar@example.uz"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Telefon raqami
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 90 123 45 67"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Parol
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Kamida 8 ta belgi"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Parolni tasdiqlang
            </label>
            <input
              type="password"
              required
              value={formData.password_confirm}
              onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
              placeholder="Parolni qayta kiriting"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Allaqachon hisobingiz bormi?{' '}
          <Link href="/kirish" className="text-[#245B82] font-semibold hover:underline">
            Tizimga kiring
          </Link>
        </div>
      </div>
    </div>
  );
}
