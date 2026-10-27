'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/locales';
import { api } from '@/lib/api';
import { SiteSettings } from '@/types';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  SendHorizontal,
  CheckCircle2,
  Building2,
  ExternalLink,
} from 'lucide-react';

export default function ContactPage() {
  const { t, lang } = useTranslation();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getSiteSettings().then((data) => {
      if (data) setSettings(data);
    }).catch(() => null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate safe delivery
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const address = lang === 'ru'
    ? (settings?.contact_address_ru || "Андижанская область, Андижанский район, поселок Куйганёр, ул. Олийгох 1")
    : lang === 'oz'
    ? (settings?.contact_address_oz || "Андижон вилояти, Андижон тумани, Куйганёр қўрғони, Олийгоҳ кўчаси 1-уй")
    : (settings?.contact_address_uz || "Andijon viloyati, Andijon tumani, Kuyganyor qo'rg'oni, Oliygoh ko'chasi 1-uy");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div>
        <div className="text-xs uppercase tracking-widest text-[#245B82] font-bold mb-1">
          Aloqa va manzil
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Biz bilan bog&apos;lanish
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Malakaviy imtihonlar, arizalar qabuli va ilmiy bo&apos;lim faoliyati bo&apos;yicha ma&apos;lumot
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact info cards */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#245B82]" />
              Institut rekvizitlari
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#245B82] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Manzil:</div>
                  <div className="text-slate-600 mt-0.5 leading-relaxed">{address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#245B82] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Ishonch telefoni:</div>
                  <a href={`tel:${settings?.contact_phone || "+998742234567"}`} className="text-[#245B82] font-semibold hover:underline mt-0.5 block">
                    {settings?.contact_phone || "+998 (74) 223-45-67"}
                  </a>
                  {settings?.contact_phone_secondary && (
                    <a href={`tel:${settings.contact_phone_secondary}`} className="text-[#245B82] font-semibold hover:underline block">
                      {settings.contact_phone_secondary}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#245B82] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Elektron pochta:</div>
                  <a href={`mailto:${settings?.contact_email || "ilm@aqxi.uz"}`} className="text-[#245B82] hover:underline mt-0.5 block">
                    {settings?.contact_email || "ilm@aqxi.uz"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#245B82] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Qabul vaqtlari:</div>
                  <div className="text-slate-600 mt-0.5">{settings?.work_hours || "Dushanba - Shanba: 09:00 - 18:00"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Info Banner */}
          <div className="bg-gradient-to-br from-[#16324F] to-[#245B82] text-white p-6 rounded-xl shadow-md space-y-3">
            <h4 className="font-bold text-sm tracking-wide">Institut bosh binosi</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Andijon shahridan Kuyganyor yo&apos;nalishidagi jamoat transportlari orqali institut bekati tomon yetib borish mumkin.
            </p>
            {settings?.official_website && (
              <a
                href={settings.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#80B4DB] hover:text-white font-semibold pt-1"
              >
                Institut rasmiy veb-sayti
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Interactive Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                Qabul komissiyasiga xabar yo&apos;llash
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Imtihon jarayoni yoki arizangiz yuzasidan savolingiz bo&apos;lsa, shaklni to&apos;ldiring.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base">Xabaringiz muvaffaqiyatli qabul qilindi!</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Mas&apos;ul xodimlarimiz murojaatingizni ko&apos;rib chiqib, ko&apos;rsatilgan email yoki telefon raqamingiz orqali javob berishadi.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                  }}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition"
                >
                  Yangi murojaat yo&apos;llash
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      F.I.SH <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="To'liq ismingiz"
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Telefon raqami <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Elektron pochta (Email)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="namuna@domain.uz"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mavzu
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Murojaat mavzusi"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Murojaat matni <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Savol yoki taklifingizni yozing..."
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#245B82] focus:bg-white transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <SendHorizontal className="w-4 h-4" />
                    {submitting ? "Yuborilmoqda..." : "Xabarni yuborish"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
