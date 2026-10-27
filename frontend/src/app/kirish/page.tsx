'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import { LogIn, AlertCircle, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.user?.role === 'admin' || res.user?.role === 'reviewer') {
        router.push('/admin');
      } else {
        router.push('/kabinet');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.error?.details || 'Email yoki parol noto\'g\'ri.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#16324F] text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tizimga kirish
          </h1>
          <p className="text-xs text-slate-500">
            Shaxsiy kabinetingizga kirish uchun email va parolingizni kiriting
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
              Email manzil
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="talabgor@aqxi.uz"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Parol
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800">Demo hisoblar:</div>
          <div>• <strong>Admin:</strong> admin@aqxi.uz / Admin123!</div>
          <div>• <strong>Ko&apos;rib chiquvchi:</strong> reviewer@aqxi.uz / Reviewer123!</div>
          <div>• <strong>Abituriyent:</strong> talabgor@aqxi.uz / Talabgor123!</div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Hisobingiz yo&apos;qmi?{' '}
          <Link href="/royxatdan-otish" className="text-[#245B82] font-semibold hover:underline">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </div>
      </div>
    </div>
  );
}
