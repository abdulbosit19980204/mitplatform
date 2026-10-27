'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Announcement } from '@/types';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Pin,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Save,
  Calendar,
} from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingAnn({
      id: 0,
      title_uz: '',
      content_uz: '',
      category: 'important',
      badge_type: 'info',
      is_pinned: false,
      is_published: true,
      published_at: new Date().toISOString(),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn) return;
    setSaveLoading(true);
    setMsg(null);

    try {
      if (isNew) {
        await api.createAnnouncement(editingAnn);
        setMsg({ type: 'success', text: "E'lon muvaffaqiyatli chop etildi!" });
      } else {
        await api.updateAnnouncement(editingAnn.id, editingAnn);
        setMsg({ type: 'success', text: "E'lon yangilandi!" });
      }
      setEditingAnn(null);
      await fetchAnnouncements();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || err.message || "Xatolik" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ushbu e'lonni o'chirmoqchimisiz?")) return;
    try {
      await api.deleteAnnouncement(id);
      await fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || "Xatolik");
    }
  };

  const handleTogglePin = async (ann: Announcement) => {
    try {
      await api.updateAnnouncement(ann.id, { is_pinned: !ann.is_pinned });
      await fetchAnnouncements();
    } catch (err: any) {
      alert("Qadash holatini o'zgartirib bo'lmadi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#245B82]" />
            E&apos;lonlar va yangiliklar boshqaruvi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Imtihon muddatlari, sessiya sanalari va muhim xabarnomalarni e&apos;lon qilish va boshqarish
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi e&apos;lon berish
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

      {/* Announcements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">E&apos;lonlar mavjud emas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Qadalgan</th>
                  <th className="py-3 px-4">Sarlavha</th>
                  <th className="py-3 px-4">Kategoriya</th>
                  <th className="py-3 px-4">Sanasi</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePin(ann)}
                        className={`p-1.5 rounded transition ${
                          ann.is_pinned ? 'text-amber-600 bg-amber-50' : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title={ann.is_pinned ? "Qadalgan e'lon" : "Qadash"}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-bold text-slate-900 line-clamp-1">{ann.title_uz}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{ann.content_uz}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#245B82] border border-[#245B82]/20">
                        {ann.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(ann.published_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ann.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {ann.is_published ? "Nashr etilgan" : "Qoralama"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setIsNew(false);
                          setEditingAnn(ann);
                        }}
                        className="p-1.5 rounded text-[#245B82] hover:bg-blue-50 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ann.id)}
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
      {editingAnn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {isNew ? "Yangi e'lon yaratish" : "E'lonni tahrirlash"}
              </h3>
              <button onClick={() => setEditingAnn(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  E&apos;lon sarlavhasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingAnn.title_uz}
                  onChange={(e) => setEditingAnn({ ...editingAnn, title_uz: e.target.value })}
                  placeholder="E'lon sarlavhasi"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  E&apos;lon matni <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingAnn.content_uz}
                  onChange={(e) => setEditingAnn({ ...editingAnn, content_uz: e.target.value })}
                  placeholder="E'lonning to'liq matni..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={editingAnn.category}
                    onChange={(e) => setEditingAnn({ ...editingAnn, category: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                  >
                    <option value="important">Muhim xabar</option>
                    <option value="deadline">Muddatlar</option>
                    <option value="exam_schedule">Imtihon jadvali</option>
                    <option value="general">Umumiy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Belgi rangi (Badge type)
                  </label>
                  <select
                    value={editingAnn.badge_type}
                    onChange={(e) => setEditingAnn({ ...editingAnn, badge_type: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#245B82]"
                  >
                    <option value="info">Moviy (Info)</option>
                    <option value="warning">Sariq (Ogohlantirish)</option>
                    <option value="success">Yashil (Muvaffaqiyat)</option>
                    <option value="danger">Qizil (Shoshilinch)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingAnn.is_pinned}
                    onChange={(e) => setEditingAnn({ ...editingAnn, is_pinned: e.target.checked })}
                    className="w-4 h-4 text-[#245B82] rounded"
                  />
                  <span>Yuqoriga qadash (Pinned)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingAnn.is_published}
                    onChange={(e) => setEditingAnn({ ...editingAnn, is_published: e.target.checked })}
                    className="w-4 h-4 text-[#245B82] rounded"
                  />
                  <span>Chop etilgan (Published)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingAnn(null)}
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
