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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/admin/arizalar"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245B82] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Arizalar ro&apos;yxatiga qaytish
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Ariza: {application.reference_number}
            </h1>
            <ApplicationStatusBadge status={application.status} />
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Topshirilgan: {application.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'Topshirilmagan'}
        </div>
      </div>

      {/* Snapshot Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2.5 text-xs">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2 border-b pb-2">
            Talabgor ma&apos;lumotlari
          </h3>
          <div><span className="text-slate-500">To&apos;liq ism:</span> <strong className="text-slate-900">{snap.last_name} {snap.first_name} {snap.middle_name}</strong></div>
          <div><span className="text-slate-500">Telefon:</span> {snap.phone || '-'}</div>
          <div><span className="text-slate-500">Email:</span> {snap.email || application.applicant_email || '-'}</div>
          <div><span className="text-slate-500">JSHR:</span> {snap.jshr || '-'}</div>
          <div><span className="text-slate-500">Jinsi:</span> {snap.gender === 'male' ? 'Erkak' : 'Ayol'}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2.5 text-xs">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2 border-b pb-2">
            Ilmiy ma&apos;lumotlar
          </h3>
          <div><span className="text-slate-500">OTM / ITM:</span> <strong className="text-slate-900">{snap.current_institution || '-'}</strong></div>
          <div><span className="text-slate-500">Ta&apos;lim shakli:</span> {snap.education_form || '-'}</div>
          <div><span className="text-slate-500">Ixtisoslik shifri:</span> {snap.specialty_code || '-'}</div>
          <div><span className="text-slate-500">Fan tarmog&apos;i:</span> {snap.scientific_field || '-'}</div>
          <div><span className="text-slate-500">Ilmiy rahbar:</span> {snap.scientific_supervisor || '-'}</div>
          <div><span className="text-slate-500">Ish joyi:</span> {snap.workplace || '-'}</div>
          <div><span className="text-slate-500">Dissertatsiya mavzusi:</span> {snap.dissertation_topic || '-'}</div>
          <div>
            <span className="text-slate-500">Boshqa OTMdan:</span>{' '}
            <strong className={snap.is_from_another_institution ? 'text-amber-700' : 'text-slate-700'}>
              {snap.is_from_another_institution ? 'HA (Aloqa xati talab etiladi)' : 'YO\'Q (AQXI talabgori)'}
            </strong>
          </div>
        </div>
      </div>

      {/* Uploaded Documents Verification */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b pb-3">
          Yuklangan hujjatlarni tekshirish ({application.documents?.length || 0} ta)
        </h3>

        {application.documents?.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-4">Hali hech qanday hujjat yuklanmagan.</div>
        ) : (
          <div className="space-y-4">
            {application.documents?.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#245B82] shrink-0" />
                    <span className="font-semibold text-slate-900 text-sm">
                      {doc.document_type_name || doc.document_type?.name_uz}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({(doc.file_size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-medium ${
                        doc.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'correction_required'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {doc.status === 'approved' ? 'Tasdiqlangan' : doc.status === 'correction_required' ? 'Tuzatish kerak' : 'Tekshirilmoqda'}
                    </span>

                    <a
                      href={doc.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Faylni ko&apos;rish
                    </a>
                  </div>
                </div>

                {/* Document review controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-200/60">
                  <input
                    type="text"
                    placeholder="Tuzatish bo'yicha talabgorga izoh..."
                    value={docReviewNotes[doc.id] || ''}
                    onChange={(e) => setDocReviewNotes({ ...docReviewNotes, [doc.id]: e.target.value })}
                    className="flex-1 text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-[#245B82]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDocumentReview(doc.id, 'approved')}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tasdiqlash
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDocumentReview(doc.id, 'correction_required')}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-1"
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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b pb-3">
          Ariza bo&apos;yicha yakuniy qaror qabul qilish
        </h3>

        {actionError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {actionError}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setReviewAction('approve')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              reviewAction === 'approve'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Arizani to&apos;liq tasdiqlash
          </button>

          <button
            type="button"
            onClick={() => setReviewAction('request_corrections')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              reviewAction === 'request_corrections'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Tuzatish talab qilish
          </button>

          <button
            type="button"
            onClick={() => setReviewAction('reject')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              reviewAction === 'reject'
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Arizani rad etish
          </button>
        </div>

        {reviewAction && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
                className="w-full text-xs bg-white border border-slate-300 rounded p-2.5 outline-none focus:border-[#245B82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Ichki komissiya eslatmasi (Abituriyentga ko&apos;rinmaydi)
              </label>
              <input
                type="text"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Faqat mas'ul xodimlar uchun eslatma..."
                className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewAction('')}
                className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 bg-white border border-slate-300"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleOverallReview}
                disabled={actionLoading}
                className="px-5 py-1.5 rounded text-xs font-bold bg-[#16324F] hover:bg-[#0f2035] text-white transition disabled:opacity-50"
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
