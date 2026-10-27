'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SiteSettings } from '@/types';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  Shield,
  UploadCloud,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api
      .getSiteSettings()
      .then((data) => setSettings(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMsg(null);

    try {
      const updated = await api.updateAdminSettings(settings);
      setSettings(updated);
      setMsg({ type: 'success', text: "Institut sozlamalari muvaffaqiyatli saqlandi!" });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || err.message || "Saqlashda xatolik yuz berdi" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Sozlamalar yuklanmoqda...</div>;
  }

  if (!settings) {
    return <div className="p-12 text-center text-slate-500 text-xs">Sozlamalar topilmadi.</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#245B82]" />
          Institut umumiy sozlamalari
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Muassasa nomi, aloqa ma&apos;lumotlari, fayl yuklash cheklovlari va elektron ruxsatnoma formatini sozlash
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Identity & Name */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
            <Building2 className="w-4 h-4 text-[#245B82]" />
            Institut rasmiy nomi va shiori
          </h3>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Institut nomi (O&apos;zbek lotin) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.site_name_uz}
                onChange={(e) => setSettings({ ...settings, site_name_uz: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Institut nomi (Ўзбек кирилл)
                </label>
                <input
                  type="text"
                  value={settings.site_name_oz || ''}
                  onChange={(e) => setSettings({ ...settings, site_name_oz: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Institut nomi (Русский)
                </label>
                <input
                  type="text"
                  value={settings.site_name_ru || ''}
                  onChange={(e) => setSettings({ ...settings, site_name_ru: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tizim shiori / Kichik sarlavha (Motto)
              </label>
              <input
                type="text"
                value={settings.motto_uz || ''}
                onChange={(e) => setSettings({ ...settings, motto_uz: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* 2. Contacts */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
            <Phone className="w-4 h-4 text-[#245B82]" />
            Aloqa ma&apos;lumotlari va manzil
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Elektron pochta (Email) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Asosiy telefon raqami <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ish vaqti
              </label>
              <input
                type="text"
                value={settings.work_hours || ''}
                onChange={(e) => setSettings({ ...settings, work_hours: e.target.value })}
                placeholder="Dushanba - Shanba: 09:00 - 18:00"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Telegram kanali
              </label>
              <input
                type="text"
                value={settings.telegram_channel || ''}
                onChange={(e) => setSettings({ ...settings, telegram_channel: e.target.value })}
                placeholder="https://t.me/aqxi_rasmiy"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] focus:bg-white transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Manzil (O&apos;zbek)
              </label>
              <input
                type="text"
                value={settings.contact_address_uz}
                onChange={(e) => setSettings({ ...settings, contact_address_uz: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* 3. System Upload Limits & Prefixes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
            <UploadCloud className="w-4 h-4 text-[#245B82]" />
            Hujjat yuklash qoidalari va ariza formati
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Maksimal fayl hajmi (MB)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={settings.max_upload_size_mb}
                onChange={(e) => setSettings({ ...settings, max_upload_size_mb: Number(e.target.value) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ruxsat etilgan formatlar
              </label>
              <input
                type="text"
                value={settings.allowed_upload_formats}
                onChange={(e) => setSettings({ ...settings, allowed_upload_formats: e.target.value })}
                placeholder="pdf,jpg,jpeg,png"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ariza prefiksi (Format: PREF-YYYY-XXXXXX)
              </label>
              <input
                type="text"
                value={settings.application_reference_prefix}
                onChange={(e) => setSettings({ ...settings, application_reference_prefix: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saqlanmoqda..." : "Sozlamalarni saqlash"}
          </button>
        </div>
      </form>
    </div>
  );
}
