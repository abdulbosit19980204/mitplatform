'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Application, Examination } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge';
import {
  Search,
  Filter,
  Download,
  ChevronRight,
  ArrowLeft,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function AdminApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedLang, setSelectedLang] = useState('all');

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
        router.push('/kirish');
        return;
      }

      fetchData();
    }
  }, [user, authLoading, router, selectedStatus, selectedExam, selectedLang]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedExam !== 'all') params.examination = selectedExam;
      if (selectedLang !== 'all') params.language = selectedLang;

      const [appsData, examsData] = await Promise.all([
        api.getAdminApplications(params),
        api.getExaminations(),
      ]);

      setApplications(appsData);
      setExaminations(examsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const q = search.toLowerCase();
    const refMatch = app.reference_number?.toLowerCase().includes(q);
    const nameMatch = app.applicant_name?.toLowerCase().includes(q);
    const emailMatch = app.applicant_email?.toLowerCase().includes(q);
    return refMatch || nameMatch || emailMatch;
  });

  const handleExportCsv = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.open(`${apiUrl}/api/v1/admin/applications/export_csv/`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Boshqaruv paneliga qaytish
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Arizalar boshqaruvi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelib tushgan barcha arizalarni tekshirish, tasdiqlash va saralash
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#162B45] border border-slate-300 dark:border-[#263B55] hover:bg-slate-50 dark:hover:bg-[#1c3554] text-slate-700 dark:text-slate-200 transition shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          {t.admin.exportCsv}
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-[#0F2036] p-4 rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="F.I.SH yoki ariza raqami..."
            className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-xl pl-9 pr-3 py-2 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
          >
            <option value="all">Barcha holatlar</option>
            <option value="submitted">Yuborilgan (Yangi)</option>
            <option value="under_review">Ko&apos;rib chiqilmoqda</option>
            <option value="correction_required">Tuzatish talab qilingan</option>
            <option value="approved">Tasdiqlangan</option>
            <option value="rejected">Rad etilgan</option>
          </select>
        </div>

        <div>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
          >
            <option value="all">Barcha imtihonlar</option>
            {examinations.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
          >
            <option value="all">Barcha tillar</option>
            <option value="en">Ingliz tili</option>
            <option value="de">Nemis tili</option>
            <option value="uz">O&apos;zbek tili</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0F2036] rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Yuklanmoqda...</div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm">
            Hech qanday ariza topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#162B45] border-b border-slate-200 dark:border-[#263B55] text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3.5">Ariza raqami</th>
                  <th className="px-4 py-3.5">Talabgor (F.I.SH)</th>
                  <th className="px-4 py-3.5">Imtihon</th>
                  <th className="px-4 py-3.5">Til</th>
                  <th className="px-4 py-3.5">Holati</th>
                  <th className="px-4 py-3.5">Hujjatlar</th>
                  <th className="px-4 py-3.5 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#263B55]">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-[#162B45]/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-[#2563EB] dark:text-[#3B82F6]">
                      {app.reference_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{app.applicant_name}</div>
                      <div className="text-[11px] text-slate-400">{app.applicant_email}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {app.examination?.title || (app as any).examination_title}
                    </td>
                    <td className="px-4 py-3 uppercase font-semibold text-slate-600 dark:text-slate-400">
                      {app.examination?.language || (app as any).examination_language}
                    </td>
                    <td className="px-4 py-3">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {app.documents_count
                        ? `${app.documents_count.approved}/${app.documents_count.total}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/arizalar/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm"
                      >
                        Tekshirish
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
