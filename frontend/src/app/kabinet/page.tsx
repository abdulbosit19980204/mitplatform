'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Application } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge';
import {
  FileText,
  PlusCircle,
  AlertCircle,
  Calendar,
  Clock,
  ChevronRight,
  RefreshCw,
  Printer,
  User as UserIcon,
  CheckCircle2,
  MapPin,
  FileCheck,
  ShieldCheck,
  QrCode,
  Bell,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

export default function CabinetPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [printPassApp, setPrintPassApp] = useState<Application | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/kirish');
      return;
    }

    if (user) {
      api
        .getApplications()
        .then((data) => setApplications(data || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header & Welcome Strip */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#245B82] border border-[#245B82]/20">
            <UserIcon className="w-3.5 h-3.5" />
            Talabgor shaxsiy kabineti
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Xush kelibsiz, {user?.full_name}
          </h1>
          <p className="text-xs text-slate-500">
            Email: <strong className="text-slate-700">{user?.email}</strong> | Tel: <strong className="text-slate-700">{user?.phone || user?.profile?.phone || "Kiritilmagan"}</strong>
          </p>
        </div>

        <Link
          href="/ariza/yangi"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Yangi imtihonga ariza topshirish
        </Link>
      </div>

      {/* 2. Active Applications List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#245B82]" />
            Mening arizalarim ({applications.length})
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#245B82] flex items-center justify-center mx-auto border border-blue-100">
              <FileText className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Hali arizalar topshirilmagan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                O&apos;zingizga mos malakaviy imtihonni tanlang va 6 ta majburiy hujjatni yuklab onlayn ariza yuboring.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/ariza/yangi"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-[#245B82] hover:bg-[#1c4969] text-white transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Ariza topshirish
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const exam = app.examination;
              const docsTotal = app.documents_count?.total || app.documents?.length || 0;
              const docsApproved = app.documents_count?.approved || app.documents?.filter((d) => d.status === 'approved').length || 0;
              const isCorrection = app.status === 'correction_required';
              const isApproved = app.status === 'approved';

              return (
                <div
                  key={app.id}
                  className={`bg-white rounded-xl border shadow-sm p-6 sm:p-7 space-y-5 transition-all duration-150 ${
                    isCorrection
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : isApproved
                      ? 'border-emerald-300 ring-1 ring-emerald-100'
                      : 'border-slate-200 hover:border-[#80B4DB]'
                  }`}
                >
                  {/* Top Header of Card */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#16324F] bg-slate-100 px-2.5 py-1 rounded tracking-wide border border-slate-200">
                          {app.reference_number}
                        </span>
                        <ApplicationStatusBadge status={app.status} />
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 pt-1">
                        {exam?.title || (app as any).examination_title}
                      </h3>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {isCorrection && (
                        <Link
                          href={`/ariza/yangi?existing=${app.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm animate-pulse"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Tuzatish kiritish
                        </Link>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => setPrintPassApp(app)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#16803C] hover:bg-[#126b32] text-white transition shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Ruxsatnoma (Chop etish)
                        </button>
                      )}

                      <Link
                        href={`/ariza/yangi?existing=${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-[#245B82] hover:bg-blue-50 transition border border-transparent hover:border-blue-100"
                      >
                        Batafsil
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Reviewer Comment Banner (if correction requested) */}
                  {isCorrection && (app.correction_notes || (app as any).rejection_reason) && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-sm text-amber-900">
                          Qabul komissiyasi eslatmasi (Tuzatish talab qilinadi):
                        </div>
                        <p className="mt-1 leading-relaxed text-amber-950 font-medium">
                          {app.correction_notes || (app as any).rejection_reason}
                        </p>
                        <p className="mt-2 text-[11px] text-amber-800">
                          Iltimos, ko&apos;rsatilgan hujjatni yangilab yuklang va arizani qayta topshiring.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                      <div className="text-slate-400 font-medium">Topshirilgan vaqti</div>
                      <div className="font-semibold text-slate-800">
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleString() : "Qoralama"}
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                      <div className="text-slate-400 font-medium">Hujjatlar to&apos;liqligi</div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-[#245B82]" />
                        <span>{docsApproved} / {docsTotal} tasdiqlangan</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                      <div className="text-slate-400 font-medium">Imtihon o&apos;tkaziladigan sana</div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{exam?.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "E'lon qilinadi"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents Mini Badges */}
                  {app.documents && app.documents.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Biriktirilgan 6 ta hujjat holati:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {app.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-2 rounded-lg border bg-slate-50 border-slate-200 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-700 truncate max-w-[180px]" title={doc.document_type_name}>
                              {doc.document_type?.sort_order}. {doc.document_type?.name_uz || doc.document_type_name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                doc.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.status === 'correction_required'
                                  ? 'bg-amber-100 text-amber-900 font-bold'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {doc.status === 'approved'
                                ? '✓ Tasdiqlangan'
                                : doc.status === 'correction_required'
                                ? '⚠ Tuzatish'
                                : 'Ko\'rilmoqda'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Printable Official Admission Pass Modal */}
      {printPassApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto print-card">
            {/* Header of pass */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#16324F] text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    O&apos;ZBEKISTON RESPUBLIKASI QIShLOQ XO&apos;JALIGI VAZIRLIGI
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Andijon qishloq xo&apos;jaligi va agrotexnologiyalar instituti
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPrintPassApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 no-print"
              >
                ✕
              </button>
            </div>

            {/* Pass Title */}
            <div className="text-center space-y-1">
              <div className="text-xs font-bold uppercase tracking-widest text-[#245B82]">
                RASMIY RUXSATNOMA
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                MALAKAVIY IMTIHONGA KIRISH VARAQASI
              </h2>
              <div className="font-mono text-sm font-bold text-slate-700">
                № {printPassApp.reference_number}
              </div>
            </div>

            {/* Applicant & Exam Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Talabgor F.I.SH:</span>
                <strong className="text-slate-900 text-sm">
                  {printPassApp.applicant_snapshot?.last_name} {printPassApp.applicant_snapshot?.first_name} {printPassApp.applicant_snapshot?.middle_name}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block">JSHSHIR:</span>
                <strong className="text-slate-900 text-sm">
                  {printPassApp.applicant_snapshot?.jshr || "-"}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block">Imtihon nomi:</span>
                <strong className="text-slate-900">
                  {printPassApp.examination?.title}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block">Ixtisoslik shifri:</span>
                <strong className="text-slate-900">
                  {printPassApp.applicant_snapshot?.specialty_code || "-"}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block">O&apos;tkazilish vaqti:</span>
                <strong className="text-slate-900">
                  {printPassApp.examination?.exam_date ? new Date(printPassApp.examination.exam_date).toLocaleString() : "E'lon qilinadi"}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block">Manzil:</span>
                <strong className="text-slate-900">
                  {printPassApp.examination?.location || "Bosh bino, 204-auditoriya"}
                </strong>
              </div>
            </div>

            {/* Security Notice & QR box */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-1 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Hujjat elektron imzo bilan tasdiqlangan
                </div>
                <p className="text-[11px] text-emerald-900 max-w-sm leading-relaxed">
                  Ushbu ruxsatnoma va shaxsingizni tasdiqlovchi fuqarolik pasporti yoki ID-kartani imtihon boshlanishidan 30 daqiqa oldin olib kelishingiz shart.
                </p>
              </div>

              <div className="w-16 h-16 bg-white border border-emerald-300 rounded-lg flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
            </div>

            {/* Print button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t no-print">
              <button
                type="button"
                onClick={() => setPrintPassApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Yopish
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 text-xs font-bold bg-[#16803C] hover:bg-[#126b32] text-white rounded-lg transition shadow-sm inline-flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Qog&apos;ozga chop etish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
