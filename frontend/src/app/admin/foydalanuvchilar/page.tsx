'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, Role } from '@/types';
import {
  Search,
  Plus,
  UserCheck,
  Edit,
  Trash2,
  Shield,
  ShieldAlert,
  Users,
} from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers(search);
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.email || !editingUser?.full_name) return;

    setModalLoading(true);
    try {
      if (editingUser.id) {
        await api.updateAdminUser(editingUser.id, editingUser);
      } else {
        await api.createAdminUser(editingUser);
      }
      setModalOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setModalLoading(false);
    }
  };

  // Mock initial users fallback matching Mockup 9
  const displayUsers =
    users.length > 0
      ? users
      : [
          {
            id: 1,
            full_name: "Abdulla To'xtayev",
            email: "abdulla@aqxi.uz",
            phone: "+998 90 123 45 67",
            role: "applicant" as Role,
            is_active: true,
            date_joined: "2026-05-10",
          },
          {
            id: 2,
            full_name: "Zokirov Aziz",
            email: "zokirov@aqxi.uz",
            phone: "+998 91 234 56 78",
            role: "admin" as Role,
            is_active: true,
            date_joined: "2026-04-12",
          },
          {
            id: 3,
            full_name: "Madina Rustamova",
            email: "madina@aqxi.uz",
            phone: "+998 93 345 67 89",
            role: "reviewer" as Role,
            is_active: true,
            date_joined: "2026-03-25",
          },
        ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions (Mockup 9 style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Foydalanuvchilar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tizim foydalanuvchilari, komissiya a&apos;zolari va abituriyentlar ro&apos;yxati
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingUser({
              email: '',
              full_name: '',
              phone: '',
              role: 'applicant',
              is_active: true,
            });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi foydalanuvchi
        </button>
      </div>

      {/* 2. Filter Bar (Mockup 9 style) */}
      <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="F.I.O yoki telefon raqamini qidiring..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>
      </div>

      {/* 3. Table of Users (Mockup 9 style) */}
      <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200/90 dark:border-[#263B55] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#11263E] border-b border-slate-200/80 dark:border-[#263B55] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12">№</th>
                <th className="py-3 px-4">F.I.O</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayUsers.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-[#162B45] transition">
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{u.full_name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : u.role === 'reviewer'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {u.role === 'admin'
                        ? 'Administrator'
                        : u.role === 'reviewer'
                        ? 'Operator'
                        : 'Abituriyent'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {u.phone || '+998 (74) 223-45-67'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#10B981] border border-emerald-200 dark:border-emerald-800">
                      Faol
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(u);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Tahrirlash"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for User Create/Edit */}
      {modalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveUser}
            className="bg-white dark:bg-[#0F2036] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-[#263B55]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263B55] pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {editingUser.id ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  F.I.O:
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Email:
                </label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Telefon:
                </label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Rol:
                </label>
                <select
                  value={editingUser.role || 'applicant'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50 dark:bg-[#11263E] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
                >
                  <option value="applicant">Abituriyent</option>
                  <option value="reviewer">Operator / Komissiya a&apos;zosi</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#263B55]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition"
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
