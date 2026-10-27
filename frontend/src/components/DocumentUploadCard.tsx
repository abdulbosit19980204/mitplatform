'use client';

import React, { useState, useRef } from 'react';
import { ApplicationDocument, RequiredDocumentType } from '@/types';
import { useTranslation } from '@/lib/locales';
import {
  Upload,
  FileCheck,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  FileText,
  Download,
} from 'lucide-react';

interface Props {
  documentType: RequiredDocumentType;
  uploadedDoc?: ApplicationDocument;
  isConditional?: boolean;
  isRequired?: boolean;
  applicationStatus?: string;
  onUpload: (docTypeId: number, file: File) => Promise<void>;
  onDelete: (docId: number) => Promise<void>;
}

export const DocumentUploadCard: React.FC<Props> = ({
  documentType,
  uploadedDoc,
  isConditional = false,
  isRequired = true,
  applicationStatus = 'draft',
  onUpload,
  onDelete,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canModify = applicationStatus === 'draft' || applicationStatus === 'correction_required';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploading(true);

    try {
      await onUpload(documentType.id, file);
    } catch (err: any) {
      const errDetails = err.response?.data?.error?.message || err.response?.data?.error?.details || err.message || 'Yuklashda xatolik yuz berdi';
      setErrorMsg(typeof errDetails === 'string' ? errDetails : JSON.stringify(errDetails));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusBadge = () => {
    if (!uploadedDoc) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {t.docStatus.not_uploaded}
        </span>
      );
    }
    switch (uploadedDoc.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-[#16803C] border border-[#16803C]/30">
            <FileCheck className="w-3.5 h-3.5" />
            {t.docStatus.approved}
          </span>
        );
      case 'correction_required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-[#B7791F] border border-[#B7791F]/40 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            {t.docStatus.correction_required}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-[#245B82] border border-[#245B82]/30">
            <Clock className="w-3.5 h-3.5" />
            {t.docStatus.pending}
          </span>
        );
    }
  };

  // Find latest reviewer comments if correction_required
  const latestReview = uploadedDoc?.reviews && uploadedDoc.reviews.length > 0
    ? uploadedDoc.reviews[uploadedDoc.reviews.length - 1]
    : null;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-150 ${
        uploadedDoc?.status === 'correction_required'
          ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-sm'
          : uploadedDoc?.status === 'approved'
          ? 'bg-white dark:bg-[#0F2036] border-emerald-200 dark:border-emerald-800'
          : uploadedDoc
          ? 'bg-white dark:bg-[#0F2036] border-blue-200 dark:border-[#263B55]'
          : 'bg-white dark:bg-[#0F2036] border-slate-200 dark:border-[#263B55]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Number badge & Title */}
        <div className="flex items-start gap-3 flex-1">
          <div className="w-7 h-7 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
            {documentType.sort_order}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                {documentType.name_uz}
              </h4>
              {isRequired && (
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 px-1.5 py-0.5 rounded-md">
                  Majburiy
                </span>
              )}
              {isConditional && (
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-1.5 py-0.5 rounded-md">
                  Shartli (faqat boshqa OTMdan qatnashuvchilar uchun)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {documentType.description_uz}
            </p>

            <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Format: <span className="uppercase text-slate-600 dark:text-slate-300">{documentType.accepted_formats}</span> | Maksimal hajm: <span className="text-slate-600 dark:text-slate-300">{documentType.max_size_mb} MB</span>
            </div>
          </div>
        </div>

        {/* Status indicator badge */}
        <div className="self-start sm:self-auto shrink-0">
          {getStatusBadge()}
        </div>
      </div>

      {/* Reviewer feedback if correction required */}
      {uploadedDoc?.status === 'correction_required' && latestReview?.comments && (
        <div className="mt-4 p-3 bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Ko&apos;rib chiquvchi eslatmasi:</div>
            <div className="mt-0.5">{latestReview.comments}</div>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Uploaded file preview & actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#263B55] flex flex-wrap items-center justify-between gap-3">
        {uploadedDoc ? (
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 truncate max-w-sm">
            <FileText className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] shrink-0" />
            <span className="font-medium truncate">{uploadedDoc.original_filename}</span>
            <span className="text-slate-400 shrink-0">
              ({(uploadedDoc.file_size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">
            Fayl hali yuklanmagan
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Download link if uploaded */}
          {uploadedDoc?.download_url && (
            <a
              href={uploadedDoc.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#11263E] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              Yuklab olish
            </a>
          )}

          {/* Upload / Replace button */}
          {canModify && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={(documentType.accepted_formats || 'pdf,jpg,jpeg,png').split(',').map((ext) => `.${ext.trim()}`).join(',')}
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-lg transition shadow-sm disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : uploadedDoc ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Almashtirish
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Yuklash
                  </>
                )}
              </button>

              {uploadedDoc && (
                <button
                  type="button"
                  onClick={() => onDelete(uploadedDoc.id)}
                  disabled={uploading}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                  title="Faylni o'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
