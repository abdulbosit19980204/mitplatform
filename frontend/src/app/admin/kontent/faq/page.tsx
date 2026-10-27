'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FAQItem } from '@/types';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Save,
} from 'lucide-react';

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminFAQs();
      setFaqs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingFaq({
      id: 0,
      category: 'general',
      question_uz: '',
      answer_uz: '',
      sort_order: faqs.length + 1,
      is_published: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    setSaveLoading(true);
    setMsg(null);

    try {
      if (isNew) {
        await api.createFAQ(editingFaq);
        setMsg({ type: 'success', text: "Yangi savol muvaffaqiyatli qo'shildi!" });
      } else {
        await api.updateFAQ(editingFaq.id, editingFaq);
        setMsg({ type: 'success', text: "Savol muvaffaqiyatli yangilandi!" });
      }
      setEditingFaq(null);
      await fetchFaqs();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || err.message || "Xatolik" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ushbu savol-javobni o'chirmoqchimisiz?")) return;
    try {
      await api.deleteFAQ(id);
      await fetchFaqs();
    } catch (err: any) {
      alert(err.message || "Xatolik");
    }
  };

  const handleTogglePublish = async (faq: FAQItem) => {
    try {
      await api.updateFAQ(faq.id, { is_published: !faq.is_published });
      await fetchFaqs();
    } catch (err: any) {
      alert("Holatni o'zgartirib bo'lmadi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#245B82]" />
            FAQ (Ko&apos;p so&apos;raladigan savollar) boshqaruvi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Talabgorlar uchun ro&apos;yxatdan o&apos;tish, hujjatlar va imtihon savol-javoblarini kiritish va tahrirlash
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi savol qo&apos;shish
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* FAQs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">Savollar mavjud emas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tartib</th>
                  <th className="py-3 px-4">Savol matni</th>
                  <th className="py-3 px-4">Kategoriya</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      #{faq.sort_order}
                    </td>
                    <td className="py-3 px-4 max-w-lg">
                      <div className="font-bold text-slate-900 line-clamp-1">{faq.question_uz}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{faq.answer_uz}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {faq.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(faq)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          faq.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {faq.is_published ? "Faol" : "Yashirilgan"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setIsNew(false);
                          setEditingFaq(faq);
                        }}
                        className="p-1.5 rounded text-[#245B82] hover:bg-blue-50 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-1.5 rounded text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {isNew ? "Yangi savol-javob qo'shish" : "Savolni tahrirlash"}
              </h3>
              <button onClick={() => setEditingFaq(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Savol matni (O&apos;zbek) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.question_uz}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question_uz: e.target.value })}
                  placeholder="Masalan: Qanday ro'yxatdan o'tiladi?"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Javob matni (O&apos;zbek) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.answer_uz}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer_uz: e.target.value })}
                  placeholder="Batafsil tushuntirish va javob matni..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={editingFaq.category}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                  >
                    <option value="registration">Ro&apos;yxatdan o&apos;tish</option>
                    <option value="documents">Hujjatlar</option>
                    <option value="exams">Imtihon qoidalari</option>
                    <option value="results">Natijalar va ruxsatnomalar</option>
                    <option value="general">Umumiy savollar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tartibi (Sort order)
                  </label>
                  <input
                    type="number"
                    value={editingFaq.sort_order}
                    onChange={(e) => setEditingFaq({ ...editingFaq, sort_order: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="faqPublished"
                  checked={editingFaq.is_published}
                  onChange={(e) => setEditingFaq({ ...editingFaq, is_published: e.target.checked })}
                  className="w-4 h-4 text-[#245B82] rounded"
                />
                <label htmlFor="faqPublished" className="font-semibold text-slate-700">
                  Ushbu savol saytda faol ko&apos;rsatilsin
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2 text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white rounded-lg transition shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveLoading ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
