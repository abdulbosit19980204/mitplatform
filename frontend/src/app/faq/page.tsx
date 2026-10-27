'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/locales';
import { api } from '@/lib/api';
import { FAQItem } from '@/types';
import { HelpCircle, ChevronRight, Search, MessageSquare, ArrowRight } from 'lucide-react';

export default function FAQPage() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    api
      .getFAQs()
      .then((data) => setFaqs(data || []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: 'all', label: 'Barcha savollar' },
    { key: 'registration', label: "Ro'yxatdan o'tish" },
    { key: 'documents', label: 'Hujjatlar' },
    { key: 'exams', label: 'Imtihon qoidalari' },
    { key: 'results', label: 'Natijalar va ruxsatnomalar' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchSearch =
      faq.question_uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer_uz.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div>
        <div className="text-xs uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6] font-bold mb-1">
          Yordam markazi
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Ko&apos;p so&apos;raladigan savollar
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ro&apos;yxatdan o&apos;tish, talab etiladigan 6 ta hujjat va attestatsiya qoidalari bo&apos;yicha javoblar
        </p>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Savollar yoki kalit so'zlar bo'yicha qidiruv..."
            className="w-full text-xs sm:text-sm bg-white dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] shadow-sm transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat.key
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-white dark:bg-[#162B45] border border-slate-200 dark:border-[#263B55] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c3554]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Savollar yuklanmoqda...
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200 dark:border-[#263B55] p-12 text-center space-y-2">
          <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm">Savol topilmadi.</p>
          <p className="text-xs text-slate-400">Boshqa kalit so&apos;z bilan qidirib ko&apos;ring yoki yordam xizmati bilan bog&apos;laning.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-[#0F2036] p-6 rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm space-y-2 hover:border-[#2563EB]/40 dark:hover:border-[#3B82F6]/40 transition"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] shrink-0 mt-0.5" />
                {faq.question_uz}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-6.5">
                {faq.answer_uz}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Need More Help Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#11263E] dark:to-[#162B45] rounded-2xl border border-blue-200 dark:border-[#263B55] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Javobingizni topmadingizmi?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Institut mas&apos;ullari bilan bevosita bog&apos;laning yoki ariza yuboring.
            </p>
          </div>
        </div>

        <Link
          href="/aloqa"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm inline-flex items-center gap-1.5 shrink-0"
        >
          Bog&apos;lanish
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
