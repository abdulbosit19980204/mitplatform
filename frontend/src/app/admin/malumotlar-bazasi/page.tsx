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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function ReferenceDataPage() {
  const [otms, setOtms] = useState<UzbekistanOTM[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOtm, setEditingOtm] = useState<Partial<UzbekistanOTM> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fallback initial OTMs matching Screen 6
  const fallbackOtms: UzbekistanOTM[] = [
    { id: 1, code: '301', name_uz: 'Andijon qishloq xo‘jaligi instituti', name_oz: '', name_ru: '', region: 'Andijon' },
    { id: 2, code: '102', name_uz: 'Toshkent davlat agrar universiteti', name_oz: '', name_ru: '', region: 'Toshkent' },
    { id: 3, code: '205', name_uz: 'Samarqand davlat veterinariya meditsina chorvachilik...', name_oz: '', name_ru: '', region: 'Samarqand' },
    { id: 4, code: '401', name_uz: 'Buxoro davlat universiteti', name_oz: '', name_ru: '', region: 'Buxoro' },
    { id: 5, code: '501', name_uz: 'Farg‘ona davlat universiteti', name_oz: '', name_ru: '', region: 'Farg‘ona' },
  ];

  useEffect(() => {
    fetchOtms();
  }, [search]);

  const fetchOtms = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOTMs(search);
      if (data && data.length > 0) {
        setOtms(data);
      } else {
        setOtms(fallbackOtms);
      }
    } catch (err) {
      setOtms(fallbackOtms);
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
    if (!confirm("Haqiqatan ham ushbu muassasani o'chirmoqchimisiz?")) return;
    try {
      await api.deleteOTM(id);
      await fetchOtms();
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik");
    }
  };

  const activeList = otms.length > 0 ? otms : fallbackOtms;
  const filteredOtms = activeList.filter((o) => {
    const matchReg = selectedRegion === 'all' || o.region === selectedRegion;
    return matchReg;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header (Screen 6 in Reference Board) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            OTM va ITM
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Respublika oliy taʼlim va ilmiy-tadqiqot muassasalari rasmiy reestri
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingOtm({ code: '', name_uz: '', region: 'Andijon viloyati' });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi qo‘shish
        </button>
      </div>

      {/* 2. Search & Filter Bar (Screen 6) */}
      <div className="bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Nomiga asosan qidiring..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200/80 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200/80 dark:border-[#1E3A5F] text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
        >
          <option value="all">Barcha viloyatlar</option>
          <option value="Andijon">Andijon</option>
          <option value="Toshkent">Toshkent</option>
          <option value="Samarqand">Samarqand</option>
          <option value="Buxoro">Buxoro</option>
          <option value="Farg‘ona">Farg‘ona</option>
        </select>
      </div>

      {/* 3. Table of OTMs (Screen 6) */}
      <div className="bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#122A46] border-b border-slate-200/80 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 font-bold">
                <th className="py-3.5 px-4 w-12 text-center">№</th>
                <th className="py-3.5 px-4 font-bold">Nomi</th>
                <th className="py-3.5 px-4 font-bold">Turi</th>
                <th className="py-3.5 px-4 font-bold">Hudud</th>
                <th className="py-3.5 px-4 font-bold text-center">Holat</th>
                <th className="py-3.5 px-4 font-bold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E3A5F]">
              {filteredOtms.map((otm, idx) => (
                <tr
                  key={otm.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-[#122A46]/50 transition"
                >
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {otm.name_uz}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    Davlat
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {otm.region || 'O‘zbekiston'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#10B981] border border-emerald-200 dark:border-emerald-800">
                      Faol
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOtm(otm);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#152E4D]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(otm.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
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

        {/* Pagination (< 1 2 3 4 5 > matching Screen 6) */}
        <div className="p-4 border-t border-slate-200/80 dark:border-[#1E3A5F] flex items-center justify-between text-xs text-slate-500">
          <div>Jami: {filteredOtms.length} ta muassasa</div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#152E4D]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-bold flex items-center justify-center"
            >
              1
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#152E4D]"
            >
              2
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#152E4D]"
            >
              3
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#152E4D]"
            >
              4
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#152E4D]"
            >
              5
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#152E4D]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200 dark:border-[#1E3A5F] p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              {editingOtm?.id ? 'Muassasani tahrirlash' : 'Yangi muassasa qo‘shish'}
            </h3>

            <form onSubmit={handleSaveOtm} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Muassasa kodi
                </label>
                <input
                  type="text"
                  required
                  value={editingOtm?.code || ''}
                  onChange={(e) => setEditingOtm({ ...editingOtm, code: e.target.value })}
                  placeholder="301"
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Muassasa nomi
                </label>
                <input
                  type="text"
                  required
                  value={editingOtm?.name_uz || ''}
                  onChange={(e) => setEditingOtm({ ...editingOtm, name_uz: e.target.value })}
                  placeholder="Andijon qishloq xo‘jaligi instituti"
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hudud / Viloyat
                </label>
                <input
                  type="text"
                  value={editingOtm?.region || ''}
                  onChange={(e) => setEditingOtm({ ...editingOtm, region: e.target.value })}
                  placeholder="Andijon viloyati"
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#1E3A5F]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152E4D]"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
                >
                  {modalLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
