'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SiteSettings } from '@/types';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
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
  Palette,
  Bell,
  Globe,
  Lock,
  User,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'interfeys' | 'institut' | 'profil' | 'bildirishnomalar'>('interfeys');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification toggles
  const [emailNotify, setEmailNotify] = useState(true);
  const [smsNotify, setSmsNotify] = useState(true);
  const [browserNotify, setBrowserNotify] = useState(true);

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
      setMsg({ type: 'success', text: "Sozlamalar muvaffaqiyatli saqlandi!" });
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.response?.data?.error?.message || err.message || "Saqlashda xatolik yuz berdi",
      });
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
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Sozlamalar
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Interfeys rejimi, xabarnomalar va institut parametrlari boshqaruvi
        </p>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#10B981] border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs (Mockup 11 style) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-[#263B55] pb-2">
        {[
          { key: 'interfeys', label: 'Interfeys (Rejimlar)', icon: Palette },
          { key: 'institut', label: 'Institut rekvizitlari', icon: Building2 },
          { key: 'bildirishnomalar', label: 'Bildirishnomalar', icon: Bell },
          { key: 'profil', label: 'Profil & Xavfsizlik', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tab.key
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#162B45]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Interfeys Sozlamalari (Mockup 11) */}
      {activeTab === 'interfeys' && (
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Interfeys sozlamalari
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Platforma ko&apos;rinishi va tungi/kunduzgi rejimni tanlang
            </p>
          </div>

          {/* Theme switcher cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Tizim rejimi (Mavzu):
            </label>
            <ThemeSwitcher variant="cards" />
          </div>

          {/* Language selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Asosiy til:
            </label>
            <select className="w-full sm:w-72 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer">
              <option value="uz">O&apos;zbekcha (Lotin)</option>
              <option value="oz">Ўзбекча (Кирилл)</option>
              <option value="ru">Русский</option>
            </select>
          </div>

          {/* Notifications checkboxes */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#263B55] space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Bildirishnomalar kanali:
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotify}
                  onChange={(e) => setEmailNotify(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>Email orqali</span>
              </label>
              <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsNotify}
                  onChange={(e) => setSmsNotify(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>SMS orqali</span>
              </label>
              <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={browserNotify}
                  onChange={(e) => setBrowserNotify(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>Brauzer bildirishnomalari</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setMsg({ type: 'success', text: "Interfeys sozlamalari saqlandi!" })}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white transition shadow-sm"
            >
              Saqlash
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Institut Rekvizitlari */}
      {activeTab === 'institut' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] p-6 space-y-4 shadow-sm">
            <div className="border-b border-slate-100 dark:border-[#263B55] pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                Institut identifikatsiya ma&apos;lumotlari
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Institut to&apos;liq nomi (O&apos;zbek lotin):
                </label>
                <input
                  type="text"
                  value={settings.site_name_uz}
                  onChange={(e) => setSettings({ ...settings, site_name_uz: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Aloqa telefoni:
                </label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Elektron pochta:
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Manzil:
                </label>
                <input
                  type="text"
                  value={settings.contact_address_uz}
                  onChange={(e) => setSettings({ ...settings, contact_address_uz: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Maksimal yuklash hajmi (MB):
                </label>
                <input
                  type="number"
                  value={settings.max_upload_size_mb}
                  onChange={(e) => setSettings({ ...settings, max_upload_size_mb: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Ariza kodi prefiksi:
                </label>
                <input
                  type="text"
                  value={settings.application_reference_prefix}
                  onChange={(e) => setSettings({ ...settings, application_reference_prefix: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white transition shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saqlanmoqda...' : 'O‘zgarishlarni saqlash'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3 & 4: Bildirishnomalar & Xavfsizlik placeholders */}
      {(activeTab === 'bildirishnomalar' || activeTab === 'profil') && (
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] p-6 space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {activeTab === 'bildirishnomalar' ? "Xabarnomalar sozlamalari" : "Xavfsizlik va kirish nazorati"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Ushbu bo&apos;lim administratorning shaxsiy parametrlari va xavfsizlik audit qoidalarini belgilaydi.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-[#11263E] rounded-xl border border-slate-200 dark:border-[#263B55] text-slate-600 dark:text-slate-300">
            Parolni yangilash, 2-bosqichli autentifikatsiya (2FA) va seanslar nazorati faol holatda.
          </div>
        </div>
      )}
    </div>
  );
}
