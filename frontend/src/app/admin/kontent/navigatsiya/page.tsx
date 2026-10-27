'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavigationItem } from '@/types';
import {
  Compass,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Save,
  ExternalLink,
} from 'lucide-react';

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchNav();
  }, []);

  const fetchNav = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminNavigation();
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingItem({
      id: 0,
      title_uz: '',
      title_oz: '',
      title_ru: '',
      url: '/',
      location: 'header',
      sort_order: items.length + 1,
      is_external: false,
      is_active: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaveLoading(true);
    setMsg(null);

    try {
      if (isNew) {
        await api.createNavigationItem(editingItem);
        setMsg({ type: 'success', text: "Menyu elementi yaratildi!" });
      } else {
        await api.updateNavigationItem(editingItem.id, editingItem);
        setMsg({ type: 'success', text: "Menyu elementi yangilandi!" });
      }
      setEditingItem(null);
      await fetchNav();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || err.message || "Xatolik" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ushbu menyu elementini o'chirmoqchimisiz?")) return;
    try {
      await api.deleteNavigationItem(id);
      await fetchNav();
    } catch (err: any) {
      alert(err.message || "Xatolik");
    }
  };

  const handleToggleActive = async (item: NavigationItem) => {
    try {
      await api.updateNavigationItem(item.id, { is_active: !item.is_active });
      await fetchNav();
    } catch (err: any) {
      alert("Holatni o'zgartirib bo'lmadi");
    }
  };

  const filtered = items.filter((item) =>
    selectedLocation === 'all' ? true : item.location === selectedLocation
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#245B82]" />
            Navigatsiya menyusi boshqaruvi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sayt tepasi (Header) va futeridagi havolalar, ularning tartibi va yo&apos;nalishlarini boshqarish
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi havola qo&apos;shish
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

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs font-semibold">
        {[
          { key: 'all', label: "Barchasi" },
          { key: 'header', label: "Asosiy menyu (Header)" },
          { key: 'footer_quick', label: "Futer tezkor havolalar" },
          { key: 'footer_legal', label: "Futer me'yoriy havolalar" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedLocation(tab.key)}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedLocation === tab.key
                ? 'bg-[#16324F] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">Menyu elementlari topilmadi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tartib</th>
                  <th className="py-3 px-4">Nomi (O&apos;zbek)</th>
                  <th className="py-3 px-4">Havola (URL)</th>
                  <th className="py-3 px-4">Joylashuvi</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      #{item.sort_order}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.title_uz}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#245B82]">
                      {item.url}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.location === 'header' ? 'Header' : item.location === 'footer_quick' ? 'Futer (Tezkor)' : 'Futer (Qoidalar)'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {item.is_active ? "Faol" : "Nofaol"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setIsNew(false);
                          setEditingItem(item);
                        }}
                        className="p-1.5 rounded text-[#245B82] hover:bg-blue-50 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {isNew ? "Yangi havola yaratish" : "Havolani tahrirlash"}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nomi (O&apos;zbek lotin) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title_uz}
                  onChange={(e) => setEditingItem({ ...editingItem, title_uz: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Havola (URL manzili) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="/imtihonlar yoki https://..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Joylashuvi
                  </label>
                  <select
                    value={editingItem.location}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                  >
                    <option value="header">Asosiy menyu (Header)</option>
                    <option value="footer_quick">Futer (Tezkor)</option>
                    <option value="footer_legal">Futer (Qoidalar)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tartibi (Sort order)
                  </label>
                  <input
                    type="number"
                    value={editingItem.sort_order}
                    onChange={(e) => setEditingItem({ ...editingItem, sort_order: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
