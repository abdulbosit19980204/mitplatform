'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import {
  ArrowLeft,
  Calendar,
  Save,
  Send,
  AlertCircle,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

export default function AdminExamCreatePage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    title_oz: '',
    title_ru: '',
    description: '',
    category: 'Malakaviy imtihon',
    language: 'en',
    registration_start: '',
    registration_end: '',
    exam_date: '',
    location: "AQXI Bosh binosi, 204-xona",
    capacity: 100,
    eligibility_rules: "Oliy ta'limdan keyingi ta'lim (PhD / DSc) izlanuvchilari va talabgorlari.",
    is_foreign_language: true,
    require_liaison_letter: false,
    status: 'published',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (publishNow: boolean) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.title || !formData.registration_start || !formData.registration_end) {
      setErrorMsg("Imtihon nomi, ro'yxatga olish boshlanish va tugash vaqtlari kiritilishi shart.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        status: publishNow ? 'published' : 'draft',
      };

      await api.createExamination(payload);
      setSuccessMsg("Imtihon muvaffaqiyatli yaratildi!");
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.error?.details || err.message;
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245B82] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Boshqaruv paneliga qaytish
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Imtihon yaratish
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Yangi attestatsiya yoki malakaviy imtihon sinovini sozlash va e&apos;lon qilish
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Sarlavha (title) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Imtihon nomi (O&apos;zbek lotin) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masalan: Ingliz tili bo'yicha malakaviy imtihon"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            />
          </div>

          {/* Sarlavha (Kirill) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Imtihon nomi (Ўзбек кирилл)
            </label>
            <input
              type="text"
              value={formData.title_oz}
              onChange={(e) => setFormData({ ...formData, title_oz: e.target.value })}
              placeholder="Инглиз тили бўйича малакавий имтиҳон"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            />
          </div>

          {/* Sarlavha (Rus) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Imtihon nomi (Русский)
            </label>
            <input
              type="text"
              value={formData.title_ru}
              onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
              placeholder="Квалификационный экзамен по английскому языку"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            />
          </div>

          {/* Kategoriya */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Kategoriya
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            />
          </div>

          {/* Imtihon tili */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Imtihon tili
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            >
              <option value="en">Ingliz tili</option>
              <option value="de">Nemis tili</option>
              <option value="uz">O&apos;zbek tili</option>
              <option value="ru">Rus tili</option>
            </select>
          </div>

          {/* Ro'yxatdan o'tish boshlanishi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Ro&apos;yxatdan o&apos;tish boshlanishi <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.registration_start}
              onChange={(e) => setFormData({ ...formData, registration_start: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            />
          </div>

          {/* Ro'yxatdan o'tish tugashi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Ro&apos;yxatdan o&apos;tish tugashi <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.registration_end}
              onChange={(e) => setFormData({ ...formData, registration_end: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            />
          </div>

          {/* Imtihon o'tkazilish sanasi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Imtihon o&apos;tkazilish sanasi
            </label>
            <input
              type="datetime-local"
              value={formData.exam_date}
              onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            />
          </div>

          {/* Sig'im */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Imtihon sig&apos;imi (Qabul soni)
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            />
          </div>

          {/* Manzil */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              O&apos;tkazilish joyi (Bino / Auditoriya)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            />
          </div>

          {/* Chet tili (6 ta hujjat qoidasi) */}
          <div className="md:col-span-2 p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_foreign_language}
                onChange={(e) => setFormData({ ...formData, is_foreign_language: e.target.checked })}
                className="w-4 h-4 text-[#245B82] rounded"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                Chet tili malakaviy imtihoni (6 ta standart hujjat toifasini biriktirish)
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6">
              Avtomatik ravishda 6 ta hujjat talab qilinadi. 6-hujjat (Aloqa xati) faqat boshqa OTM talabgorlari uchun shartli etib belgilanadi.
            </p>
          </div>

          {/* Tavsif */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Imtihon tavsifi va ko&apos;rsatmalari
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Talabgorlar uchun imtihon qoidalari va batafsil ko'rsatmalar..."
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-[#245B82]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
          >
            Qoralama sifatida saqlash
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? "Saqlanmoqda..." : "Imtihonni nashr etish"}
          </button>
        </div>
      </div>
    </div>
  );
}
