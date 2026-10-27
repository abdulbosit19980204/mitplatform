'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { UzbekistanOTM } from '@/types';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
} from 'lucide-react';

export default function ReferenceDataPage() {
  const [activeTab, setActiveTab] = useState<'otm' | 'education_forms' | 'specialties' | 'fields'>('otm');
  const [otms, setOtms] = useState<UzbekistanOTM[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Modal for new/edit OTM
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOtm, setEditingOtm] = useState<Partial<UzbekistanOTM> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchOtms();
  }, [search]);

  const fetchOtms = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOTMs(search);
      setOtms(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOtm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOtm?.name_uz || !editingOtm?.code) return;

    setModalLoading(true);
    try {
      if (editingOtm.id) {
        await api.updateOTM(editingOtm.id, editingOtm);
      } else {
        await api.createOTM(editingOtm);
      }
      setModalOpen(false);
      setEditingOtm(null);
      await fetchOtms();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu OTMni o'chirmoqchimisiz?")) return;
    try {
      await api.deleteOTM(id);
      await fetchOtms();
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik");
    }
  };

  const regions = Array.from(new Set(otms.map((o) => o.region).filter(Boolean)));

  const filteredOtms = otms.filter((o) => {
    const matchReg = selectedRegion === 'all' || o.region === selectedRegion;
    return matchReg;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Breadcrumbs */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Ma&apos;lumotlar bazasi
        </h1>
        <p className="text-xs text-slate-500">
          O&apos;zbekiston Respublikasi OTMlari, mutaxassisliklar va tasniflagichlar boshqaruvi
        </p>
      </div>

      {/* 2. Sub-navigation tabs (Mockup 06 style) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'otm', label: 'OTMlar' },
          { key: 'education_forms', label: "Ta'lim shakllari" },
          { key: 'specialties', label: 'Ixtisosliklar' },
          { key: 'fields', label: 'Ilmiy sohalar' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.key
                ? 'bg-[#16324F] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Filter Bar (Search, Regions, Add Button - Mockup 06) */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#80B4DB]"
            />
          </div>

          {/* Region Dropdown */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">Barcha hududlar</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Add OTM Button */}
        <button
          type="button"
          onClick={() => {
            setEditingOtm({ code: '', name_uz: '', region: 'Andijon viloyati' });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#16324F] hover:bg-[#214768] text-white transition shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Yangi OTM qo&apos;shish
        </button>
      </div>

      {/* 4. Table of OTMs (Mockup 06 style) */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
        ) : filteredOtms.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">OTM topilmadi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-12">№</th>
                  <th className="py-3 px-4">OTM nomi</th>
                  <th className="py-3 px-4">Kodi</th>
                  <th className="py-3 px-4">Hudud</th>
                  <th className="py-3 px-4">Turi</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOtms.map((otm, idx) => (
                  <tr key={otm.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{otm.name_uz}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{otm.code}</td>
                    <td className="py-3 px-4 text-slate-600">{otm.region || 'O‘zbekiston'}</td>
                    <td className="py-3 px-4 text-slate-500">Davlat</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16803C] border border-emerald-200">
                        Faol
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOtm(otm);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#245B82] hover:bg-slate-100"
                          title="Tahrirlash"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(otm.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for OTM Create/Edit */}
      {modalOpen && editingOtm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveOtm}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingOtm.id ? "OTMni tahrirlash" : "Yangi OTM qo'shish"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  OTM kodi (Masalan: 301, 302):
                </label>
                <input
                  type="text"
                  required
                  value={editingOtm.code || ''}
                  onChange={(e) => setEditingOtm({ ...editingOtm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#80B4DB]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  OTM to&apos;liq nomi:
                </label>
                <input
                  type="text"
                  required
                  value={editingOtm.name_uz || ''}
                  onChange={(e) => setEditingOtm({ ...editingOtm, name_uz: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#80B4DB]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Hudud:</label>
                <input
                  type="text"
                  value={editingOtm.region || ''}
                  onChange={(e) => setEditingOtm({ ...editingOtm, region: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#80B4DB]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#16324F] text-white hover:bg-[#214768] transition"
              >
                {modalLoading ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
