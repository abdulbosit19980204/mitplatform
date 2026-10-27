'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Application, ApplicationDocument } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  FileText,
  Clock,
  Send,
  Lock,
} from 'lucide-react';

function AdminApplicationReviewContent() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  // Overall review modal/action state
  const [reviewAction, setReviewAction] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Per-document review state
  const [docReviewNotes, setDocReviewNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
        router.push('/kirish');
        return;
      }
      fetchApp();
    }
  }, [id, user, authLoading, router]);

  const fetchApp = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getAdminApplication(String(id));
      setApplication(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentReview = async (docId: number, decision: 'approved' | 'correction_required') => {
    const comments = docReviewNotes[docId] || '';
    if (decision === 'correction_required' && !comments.trim()) {
      alert("Hujjat bo'yicha tuzatish talab qilish uchun izoh kiritish majburiydir.");
      return;
    }

    try {
      await api.reviewDocument(docId, decision, comments);
      await fetchApp();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleOverallReview = async () => {
    if (!application || !reviewAction) return;

    if ((reviewAction === 'request_corrections' || reviewAction === 'reject') && !reviewNotes.trim()) {
      setActionError("Tuzatish yoki rad etish uchun izoh kiritish majburiydir.");
      return;
    }

    setActionError(null);
    setActionLoading(true);

    try {
      await api.reviewApplication(application.id, {
        action: reviewAction,
        notes: reviewNotes,
        internal_notes: internalNotes,
      });
      setReviewAction('');
      setReviewNotes('');
      setInternalNotes('');
      await fetchApp();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || err.message || 'Xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">Yuklanmoqda...</div>;
  }

  if (!application) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">Ariza topilmadi.</div>;
  }

  const snap = application.applicant_snapshot || {};

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#263B55] pb-4">
        <div>
          <Link
            href="/admin/arizalar"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Arizalar ro&apos;yxatiga qaytish
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Ariza: {application.reference_number}
            </h1>
            <ApplicationStatusBadge status={application.status} />
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Topshirilgan: {application.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'Topshirilmagan'}
        </div>
      </div>

      {/* Snapshot Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0F2036] p-6 rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-[#263B55] pb-2">
            Talabgor ma&apos;lumotlari
          </h3>
          <div><span className="text-slate-500 dark:text-slate-400">To&apos;liq ism:</span> <strong className="text-slate-900 dark:text-white">{snap.last_name} {snap.first_name} {snap.middle_name}</strong></div>
          <div><span className="text-slate-500 dark:text-slate-400">Telefon:</span> <span className="text-slate-800 dark:text-slate-200">{snap.phone || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">Email:</span> <span className="text-slate-800 dark:text-slate-200">{snap.email || application.applicant_email || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">JSHR:</span> <span className="text-slate-800 dark:text-slate-200">{snap.jshr || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">Jinsi:</span> <span className="text-slate-800 dark:text-slate-200">{snap.gender === 'male' ? 'Erkak' : 'Ayol'}</span></div>
        </div>

        <div className="bg-white dark:bg-[#0F2036] p-6 rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-[#263B55] pb-2">
            Ilmiy ma&apos;lumotlar
          </h3>
          <div><span className="text-slate-500 dark:text-slate-400">OTM / ITM:</span> <strong className="text-slate-900 dark:text-white">{snap.current_institution || '-'}</strong></div>
          <div><span className="text-slate-500 dark:text-slate-400">Ta&apos;lim shakli:</span> <span className="text-slate-800 dark:text-slate-200">{snap.education_form || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">Ixtisoslik shifri:</span> <span className="text-slate-800 dark:text-slate-200">{snap.specialty_code || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">Fan tarmog&apos;i:</span> <span className="text-slate-800 dark:text-slate-200">{snap.scientific_field || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">Ilmiy rahbar:</span> <span className="text-slate-800 dark:text-slate-200">{snap.scientific_supervisor || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">Ish joyi:</span> <span className="text-slate-800 dark:text-slate-200">{snap.workplace || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">Dissertatsiya mavzusi:</span> <span className="text-slate-800 dark:text-slate-200">{snap.dissertation_topic || '-'}</span></div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Boshqa OTMdan:</span>{' '}
            <strong className={snap.is_from_another_institution ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
              {snap.is_from_another_institution ? 'HA (Aloqa xati talab etiladi)' : 'YO\'Q (AQXI talabgori)'}
            </strong>
          </div>
        </div>
      </div>

      {/* Uploaded Documents Verification */}
      <div className="bg-white dark:bg-[#0F2036] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-[#263B55] pb-3">
          Yuklangan hujjatlarni tekshirish ({application.documents?.length || 0} ta)
        </h3>

        {application.documents?.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-4">Hali hech qanday hujjat yuklanmagan.</div>
        ) : (
          <div className="space-y-4">
            {application.documents?.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-[#263B55] bg-slate-50/50 dark:bg-[#11263E]/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {doc.document_type_name || doc.document_type?.name_uz}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({(doc.file_size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        doc.status === 'approved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                          : doc.status === 'correction_required'
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                      }`}
                    >
                      {doc.status === 'approved' ? 'Tasdiqlangan' : doc.status === 'correction_required' ? 'Tuzatish kerak' : 'Tekshirilmoqda'}
                    </span>

                    <a
                      href={doc.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-white dark:bg-[#162B45] border border-slate-300 dark:border-[#263B55] hover:bg-slate-100 dark:hover:bg-[#1f385a] rounded-lg text-slate-700 dark:text-slate-200 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Faylni ko&apos;rish
                    </a>
                  </div>
                </div>

                {/* Document review controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-[#263B55]/60">
                  <input
                    type="text"
                    placeholder="Tuzatish bo'yicha talabgorga izoh..."
                    value={docReviewNotes[doc.id] || ''}
                    onChange={(e) => setDocReviewNotes({ ...docReviewNotes, [doc.id]: e.target.value })}
                    className="flex-1 text-xs bg-white dark:bg-[#11263E] border border-slate-200 dark:border-[#263B55] text-slate-800 dark:text-slate-100 rounded-lg px-3 py-1.5 outline-none focus:border-[#2563EB]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDocumentReview(doc.id, 'approved')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tasdiqlash
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDocumentReview(doc.id, 'correction_required')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-1 shadow-sm"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Tuzatish so&apos;rash
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Review & Decision Section */}
      <div className="bg-white dark:bg-[#0F2036] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#263B55] shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-[#263B55] pb-3">
          Ariza bo&apos;yicha yakuniy qaror qabul qilish
        </h3>

        {actionError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl">
            {actionError}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setReviewAction('approve')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reviewAction === 'approve'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Arizani to&apos;liq tasdiqlash
          </button>

          <button
            type="button"
            onClick={() => setReviewAction('request_corrections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reviewAction === 'request_corrections'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Tuzatish talab qilish
          </button>

          <button
            type="button"
            onClick={() => setReviewAction('reject')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reviewAction === 'reject'
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:bg-red-100'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Arizani rad etish
          </button>
        </div>

        {reviewAction && (
          <div className="p-4 bg-slate-50 dark:bg-[#11263E]/60 rounded-xl border border-slate-200 dark:border-[#263B55] space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Abituriyentga ko&apos;rinadigan rasmiy izoh / sabab{' '}
                {(reviewAction === 'request_corrections' || reviewAction === 'reject') && (
                  <span className="text-red-500">* (Majburiy)</span>
                )}
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Abituriyentga yuboriladigan xabar matni..."
                className="w-full text-xs bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] text-slate-800 dark:text-slate-100 rounded-xl p-2.5 outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Ichki komissiya eslatmasi (Abituriyentga ko&apos;rinmaydi)
              </label>
              <input
                type="text"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Faqat mas'ul xodimlar uchun eslatma..."
                className="w-full text-xs bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewAction('')}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-[#162B45] border border-slate-300 dark:border-[#263B55] hover:bg-slate-50 dark:hover:bg-[#1f385a]"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleOverallReview}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm disabled:opacity-50"
              >
                {actionLoading ? 'Saqlanmoqda...' : 'Qarorni tasdiqlash'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminApplicationReviewPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">Yuklanmoqda...</div>}>
      <AdminApplicationReviewContent />
    </Suspense>
  );
}
