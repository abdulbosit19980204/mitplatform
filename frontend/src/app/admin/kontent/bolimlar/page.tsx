'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { HomepageSection } from '@/types';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  Save,
  ArrowUpDown,
} from 'lucide-react';

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminHomepageSections();
      setSections(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingSection({
      id: 0,
      section_key: '',
      title_uz: '',
      subtitle_uz: '',
      content_uz: '',
      button_text_uz: '',
      button_url: '',
      badge_text_uz: '',
      sort_order: sections.length + 1,
      is_active: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    setSaveLoading(true);
    setMsg(null);

    try {
      if (isNew) {
        await api.createHomepageSection(editingSection);
        setMsg({ type: 'success', text: "Bo'lim muvaffaqiyatli yaratildi!" });
      } else {
        await api.updateHomepageSection(editingSection.id, editingSection);
        setMsg({ type: 'success', text: "Bo'lim muvaffaqiyatli saqlandi!" });
      }
      setEditingSection(null);
      await fetchSections();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || err.message || "Saqlashda xatolik" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu bo'limni o'chirmoqchimisiz?")) return;
    try {
      await api.deleteHomepageSection(id);
      await fetchSections();
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik");
    }
  };

  const handleToggleActive = async (sec: HomepageSection) => {
    try {
      await api.updateHomepageSection(sec.id, { is_active: !sec.is_active });
      await fetchSections();
    } catch (err: any) {
      alert("Holatni o'zgartirib bo'lmadi");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#245B82]" />
            Bosh sahifa bo&apos;limlari boshqaruvi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bosh sahifadagi bloklar, sarlavhalar, matnlar va tugmalarni dasturchisiz to&apos;g&apos;ridan-to&apos;g&apos;ri tahrirlash
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi bo&apos;lim qo&apos;shish
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

      {/* Sections Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
        ) : sections.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">Bo&apos;limlar mavjud emas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tartib</th>
                  <th className="py-3 px-4">Bo&apos;lim kaliti (Key)</th>
                  <th className="py-3 px-4">Sarlavha (O&apos;zbek)</th>
                  <th className="py-3 px-4">Tugma / Havola</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sections.map((sec) => (
                  <tr key={sec.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      #{sec.sort_order}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {sec.section_key}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sec.title_uz}</div>
                      {sec.subtitle_uz && (
                        <div className="text-[11px] text-slate-400 line-clamp-1">{sec.subtitle_uz}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {sec.button_text_uz ? (
                        <span>{sec.button_text_uz} ({sec.button_url})</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(sec)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sec.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {sec.is_active ? "Faol" : "Nofaol"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setIsNew(false);
                          setEditingSection(sec);
                        }}
                        className="p-1.5 rounded text-[#245B82] hover:bg-blue-50 transition"
                        title="Tahrirlash"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sec.id)}
                        className="p-1.5 rounded text-red-600 hover:bg-red-50 transition"
                        title="O'chirish"
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

      {/* Edit / Create Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {isNew ? "Yangi bosh sahifa bo'limi yaratish" : `Bo'limni tahrirlash: ${editingSection.section_key}`}
              </h3>
              <button
                onClick={() => setEditingSection(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Bo&apos;lim kaliti (key) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isNew}
                    value={editingSection.section_key}
                    onChange={(e) => setEditingSection({ ...editingSection, section_key: e.target.value })}
                    placeholder="masalan: hero, workflow, stats"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tartib raqami (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={editingSection.sort_order}
                    onChange={(e) => setEditingSection({ ...editingSection, sort_order: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Sarlavha (O&apos;zbek) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingSection.title_uz}
                  onChange={(e) => setEditingSection({ ...editingSection, title_uz: e.target.value })}
                  placeholder="Asosiy sarlavha"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Kichik sarlavha / Ta&apos;rif (Subtitle)
                </label>
                <textarea
                  rows={2}
                  value={editingSection.subtitle_uz || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, subtitle_uz: e.target.value })}
                  placeholder="Bo'lim ostidagi tushuntirish matni"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tugma matni (Button text)
                  </label>
                  <input
                    type="text"
                    value={editingSection.button_text_uz || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, button_text_uz: e.target.value })}
                    placeholder="Masalan: Imtihonlarni ko'rish"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tugma havolasi (Button URL)
                  </label>
                  <input
                    type="text"
                    value={editingSection.button_url || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, button_url: e.target.value })}
                    placeholder="/imtihonlar yoki https://..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingSection.is_active}
                  onChange={(e) => setEditingSection({ ...editingSection, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#245B82] rounded"
                />
                <label htmlFor="isActive" className="font-semibold text-slate-700">
                  Ushbu bo&apos;lim bosh sahifada faol ko&apos;rsatilsin
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
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
