'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ContentPage } from '@/types';
import {
  FileCode,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Save,
  Globe,
} from 'lucide-react';

export default function AdminContentPagesPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminContentPages();
      setPages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingPage({
      id: 0,
      slug: '',
      title_uz: '',
      lead_uz: '',
      body_html_uz: '',
      is_published: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setSaveLoading(true);
    setMsg(null);

    try {
      if (isNew) {
        await api.createContentPage(editingPage);
        setMsg({ type: 'success', text: "Yangi sahifa yaratildi!" });
      } else {
        await api.updateContentPage(editingPage.slug, editingPage);
        setMsg({ type: 'success', text: "Sahifa yangilandi!" });
      }
      setEditingPage(null);
      await fetchPages();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || err.message || "Xatolik" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Ushbu sahifani o'chirmoqchimisiz?")) return;
    try {
      await api.deleteContentPage(slug);
      await fetchPages();
    } catch (err: any) {
      alert(err.message || "Xatolik");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCode className="w-6 h-6 text-[#245B82]" />
            Statik sahifalar matni boshqaruvi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Yo&apos;riqnomalar, OAK qoidalari, maxfiylik siyosati va boshqa axborot sahifalari matnini boshqarish
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi sahifa yaratish
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

      {/* Pages Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">Sahifalar mavjud emas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Slug (Identifikator)</th>
                  <th className="py-3 px-4">Sarlavha</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pages.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#245B82]">
                      /{p.slug}
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-bold text-slate-900 line-clamp-1">{p.title_uz}</div>
                      {p.lead_uz && <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{p.lead_uz}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {p.is_published ? "Nashr etilgan" : "Qoralama"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setIsNew(false);
                          setEditingPage(p);
                        }}
                        className="p-1.5 rounded text-[#245B82] hover:bg-blue-50 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.slug)}
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
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {isNew ? "Yangi statik sahifa yaratish" : `Sahifani tahrirlash: /${editingPage.slug}`}
              </h3>
              <button onClick={() => setEditingPage(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Slug identifikatori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isNew}
                    value={editingPage.slug}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                    placeholder="masalan: qoidalar"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Sahifa sarlavhasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPage.title_uz}
                    onChange={(e) => setEditingPage({ ...editingPage, title_uz: e.target.value })}
                    placeholder="Sahifaning to'liq sarlavhasi"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Kirish qismi / Qisqacha ta&apos;rif (Lead)
                </label>
                <textarea
                  rows={2}
                  value={editingPage.lead_uz || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, lead_uz: e.target.value })}
                  placeholder="Sahifa boshidagi ta'rif matni..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Sahifa asosiy matni (HTML yoki formatlangan matn) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={7}
                  required
                  value={editingPage.body_html_uz}
                  onChange={(e) => setEditingPage({ ...editingPage, body_html_uz: e.target.value })}
                  placeholder="Sahifaning to'liq matni va bandlari..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pagePublished"
                  checked={editingPage.is_published}
                  onChange={(e) => setEditingPage({ ...editingPage, is_published: e.target.checked })}
                  className="w-4 h-4 text-[#245B82] rounded"
                />
                <label htmlFor="pagePublished" className="font-semibold text-slate-700">
                  Ushbu sahifa saytda faol ko&apos;rsatilsin
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
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
