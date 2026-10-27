'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Examination,
  Application,
  UzbekistanOTM,
  UzbekistanSpecialty,
  ReferenceOptions,
  RequiredDocumentType,
} from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/locales';
import { DocumentUploadCard } from './DocumentUploadCard';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  AlertCircle,
  FileText,
  User as UserIcon,
  BookOpen,
  LogIn,
  Upload,
} from 'lucide-react';

interface Props {
  initialExam?: Examination;
  existingAppId?: string | number;
}

export const RegistrationFormWizard: React.FC<Props> = ({ initialExam, existingAppId }) => {
  const { user, login } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  // Wizard Steps:
  // Step 1: Personal & Academic Information (Fields matching the reference screenshot!)
  // Step 2: Document Uploads (6 mandatory categories, doc 6 conditional)
  // Step 3: Review & Submission
  // Step 4: Submission Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reference options from Uzbekistan open data API
  const [otmList, setOtmList] = useState<UzbekistanOTM[]>([]);
  const [specialtiesList, setSpecialtiesList] = useState<UzbekistanSpecialty[]>([]);
  const [refOptions, setRefOptions] = useState<ReferenceOptions | null>(null);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [docTypes, setDocTypes] = useState<RequiredDocumentType[]>([]);

  // Selected examination
  const [selectedExamId, setSelectedExamId] = useState<number>(initialExam?.id || 0);
  const [currentExam, setCurrentExam] = useState<Examination | null>(initialExam || null);

  // Application instance (draft created on server)
  const [application, setApplication] = useState<Application | null>(null);

  // Step 1 Form state matching the reference screenshot exactly:
  const [formData, setFormData] = useState({
    education_form: '',
    current_institution: '',
    specialty_code: '',
    scientific_field: '',
    qualification_exam_type: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    gender: 'male',
    jshr: '',
    phone: '',
    scientific_supervisor: '',
    workplace: '',
    dissertation_topic: '',
    is_from_another_institution: false,
  });

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 1. Fetch dropdown data from Uzbekistan open data APIs and all document types
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const [otmData, specData, optsData, examsData, docTypesData] = await Promise.all([
          api.getOTMList(),
          api.getSpecialtiesList(),
          api.getReferenceOptions(),
          api.getExaminations({ is_open: true }),
          api.getDocumentTypes(),
        ]);
        setOtmList(otmData);
        setSpecialtiesList(specData);
        setRefOptions(optsData);
        setExaminations(examsData);
        setDocTypes(docTypesData);

        const targetId = selectedExamId || (examsData.length > 0 ? examsData[0].id : 0);
        if (targetId) {
          setSelectedExamId(targetId);
          try {
            const detail = await api.getExamination(targetId);
            setCurrentExam(detail);
          } catch {
            if (examsData.length > 0) setCurrentExam(examsData[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load reference options', err);
      }
    };
    fetchReferences();
  }, [selectedExamId]);

  // 2. Pre-fill form from user profile or existing application
  useEffect(() => {
    if (existingAppId) {
      api.getApplication(existingAppId).then((app) => {
        setApplication(app);
        setSelectedExamId(app.examination.id);
        setCurrentExam(app.examination);
        if (app.applicant_snapshot) {
          setFormData((prev) => ({ ...prev, ...app.applicant_snapshot }));
        }
      });
    } else if (user) {
      const profile = user.profile;
      setFormData((prev) => ({
        ...prev,
        first_name: profile?.first_name || (user.full_name.split(' ')[1] || ''),
        last_name: profile?.last_name || (user.full_name.split(' ')[0] || ''),
        middle_name: profile?.middle_name || (user.full_name.split(' ')[2] || ''),
        phone: profile?.phone || user.phone || '',
        jshr: profile?.jshr || '',
        gender: profile?.gender || 'male',
        current_institution: profile?.current_institution || "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti",
        education_form: profile?.education_form || 'kunduzgi',
        specialty_code: profile?.specialty_code || '06.01.05',
        scientific_field: profile?.scientific_field || "Qishloq xo'jaligi fanlari",
        scientific_supervisor: profile?.scientific_supervisor || '',
        workplace: profile?.workplace || '',
        dissertation_topic: profile?.dissertation_topic || '',
        is_from_another_institution: profile?.is_from_another_institution || false,
      }));
    }
  }, [user, existingAppId]);

  // When examination changes, load its full details
  const handleExamChange = async (examId: number) => {
    setSelectedExamId(examId);
    try {
      const exam = await api.getExamination(examId);
      setCurrentExam(exam);
    } catch {
      // fallback
    }
  };

  // Quick 1-click Demo Login for testing
  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login('talabgor@aqxi.uz', 'Talabgor123!');
    } catch (err: any) {
      setErrorMsg("Kirishda xatolik: " + (err.message || 'Xatolik'));
    } finally {
      setLoading(false);
    }
  };

  // Validate step 1 fields
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.education_form) errors.education_form = "Ta'lim shakli tanlanishi shart.";
    if (!formData.current_institution) errors.current_institution = "OTM yoki ITM nomi tanlanishi shart.";
    if (!formData.specialty_code) errors.specialty_code = "Ixtisoslik shifri tanlanishi shart.";
    if (!formData.first_name) errors.first_name = "Ism kiritilishi shart.";
    if (!formData.last_name) errors.last_name = "Familya kiritilishi shart.";
    if (!formData.phone) errors.phone = "Telefon raqami kiritilishi shart.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save or create application draft
  const ensureApplicationDraft = async () => {
    if (application) {
      return application;
    }
    const app = await api.createApplication({
      examination_id: selectedExamId,
      applicant_snapshot: formData,
    });
    // Re-fetch detail to get full document structure
    const detail = await api.getApplication(app.id);
    setApplication(detail);
    return detail;
  };

  // Move from Step 1 to Step 2
  const handleProceedToStep2 = async () => {
    setErrorMsg(null);
    if (!validateStep1()) {
      return;
    }

    if (!user) {
      setErrorMsg("Hujjatlarni yuklash va arizani saqlash uchun avval shaxsiy kabinetingizga kiring yoki ro'yxatdan o'ting.");
      return;
    }

    setLoading(true);
    try {
      await ensureApplicationDraft();
      setCurrentStep(2);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Document upload handler
  const handleDocumentUpload = async (docTypeId: number, file: File) => {
    setErrorMsg(null);
    let app = application;
    if (!app) {
      app = await ensureApplicationDraft();
    }
    await api.uploadDocument(app.id, docTypeId, file);
    // Refresh application to get updated document list
    const updated = await api.getApplication(app.id);
    setApplication(updated);
  };

  // Document delete handler
  const handleDocumentDelete = async (docId: number) => {
    if (!application) return;
    await api.deleteDocument(docId);
    const updated = await api.getApplication(application.id);
    setApplication(updated);
  };

  // Submit application
  const handleSubmitApplication = async () => {
    if (!application) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      await api.submitApplication(application.id);
      const updated = await api.getApplication(application.id);
      setApplication(updated);
      setCurrentStep(4); // Success step
    } catch (err: any) {
      const errDetails = err.response?.data?.error?.details || err.response?.data?.error?.message || err.message;
      if (typeof errDetails === 'object' && errDetails.missing_documents) {
        setErrorMsg(`Topshirish uchun quyidagi hujjatlar talab qilinadi:\n${errDetails.missing_documents.join('\n')}`);
      } else {
        setErrorMsg(typeof errDetails === 'string' ? errDetails : JSON.stringify(errDetails));
      }
    } finally {
      setLoading(false);
    }
  };

  // Compute full 6-document list guaranteed:
  const documentsToRender = (currentExam?.required_documents && currentExam.required_documents.length > 0)
    ? currentExam.required_documents.map((reqDoc) => ({
        documentType: reqDoc.document_type,
        isConditional: reqDoc.is_conditional || reqDoc.document_type.code === 'liaison_letter',
        isRequired: reqDoc.document_type.code === 'liaison_letter' ? formData.is_from_another_institution : reqDoc.is_required,
      }))
    : docTypes.map((dt) => ({
        documentType: dt,
        isConditional: dt.code === 'liaison_letter',
        isRequired: dt.code === 'liaison_letter' ? formData.is_from_another_institution : true,
      }));

  const uploadedDocTypeIds = new Set(application?.documents?.map((d) => d.document_type.id) || []);
  const mandatoryDocs = documentsToRender.filter((d) => d.isRequired);
  const uploadedMandatoryCount = mandatoryDocs.filter((d) => uploadedDocTypeIds.has(d.documentType.id)).length;
  const allMandatoryUploaded = mandatoryDocs.every((d) => uploadedDocTypeIds.has(d.documentType.id));

  // Steps indicator configuration
  const steps = [
    { num: 1, title: "Ma'lumotlar", icon: UserIcon },
    { num: 2, title: "Hujjatlar (6 ta)", icon: FileText },
    { num: 3, title: "Ko'rib chiqish", icon: BookOpen },
    { num: 4, title: "Tasdiqlash", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Auth Notice Banner if user is not authenticated */}
      {!user && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-amber-200">Diqqat: Siz tizimga kirmagansiz!</strong>
              <p className="text-slate-600 dark:text-amber-300/80 mt-0.5">
                Hujjatlarni yuklash va arizangizni saqlash uchun avval shaxsiy kabinetingizga kiring yoki ro&apos;yxatdan o&apos;ting.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Talabgor sifatida kirish (Demo)
            </button>
            <Link
              href="/kirish"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#162B45] border border-slate-300 dark:border-[#263B55] hover:bg-slate-50 dark:hover:bg-[#1c3554] text-slate-700 dark:text-slate-200 transition"
            >
              Kirish
            </Link>
          </div>
        </div>
      )}

      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#2563EB] text-white shadow-md ring-4 ring-[#2563EB]/20 dark:ring-[#3B82F6]/30'
                        : 'bg-slate-200 dark:bg-[#162B45] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-semibold ${
                      isCurrent ? 'text-[#2563EB] dark:text-[#3B82F6]' : isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition ${
                      currentStep > s.num ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-[#263B55]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-start gap-2 shadow-sm whitespace-pre-line">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      {/* STEP 1: Form Fields (Exact replica of user's form screenshot) */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl shadow-sm border border-slate-200 dark:border-[#263B55] p-6 sm:p-8">
          <div className="border-b border-slate-100 dark:border-[#263B55] pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Form</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Imtihonga ro&apos;yxatdan o&apos;tish uchun shaxsiy va ilmiy ma&apos;lumotlaringizni to&apos;ldiring. OTM va ixtisosliklar davlat ochiq ma&apos;lumotlar bazasidan avtomatik olinadi.
            </p>
          </div>

          {/* Imtihon tanlash */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-[#11263E]/60 rounded-xl border border-slate-200 dark:border-[#263B55]">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Ro&apos;yxatdan o&apos;tish uchun imtihonni tanlang
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => handleExamChange(Number(e.target.value))}
              className="w-full text-sm bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 focus:border-[#2563EB] dark:focus:border-[#3B82F6] outline-none"
            >
              {examinations.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({exam.language.toUpperCase()}) — Muddat: {new Date(exam.registration_end).toLocaleDateString()} gacha
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Ta'lim shakli */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.educationForm} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.education_form}
                onChange={(e) => setFormData({ ...formData, education_form: e.target.value })}
                className={`w-full text-sm bg-white dark:bg-[#11263E] border rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none transition ${
                  fieldErrors.education_form ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20' : 'border-slate-300 dark:border-[#263B55] focus:border-[#2563EB] dark:focus:border-[#3B82F6]'
                }`}
              >
                <option value="">tanlang</option>
                {refOptions?.education_forms.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label_uz}
                  </option>
                ))}
              </select>
              {fieldErrors.education_form && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.education_form}</p>
              )}
            </div>

            {/* 2. OTM yoki ITM nomi */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.otmName} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.current_institution}
                onChange={(e) => {
                  const val = e.target.value;
                  const isAnother = val !== "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti";
                  setFormData({
                    ...formData,
                    current_institution: val,
                    is_from_another_institution: isAnother,
                  });
                }}
                className={`w-full text-sm bg-white dark:bg-[#11263E] border rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none transition ${
                  fieldErrors.current_institution ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20' : 'border-slate-300 dark:border-[#263B55] focus:border-[#2563EB] dark:focus:border-[#3B82F6]'
                }`}
              >
                <option value="">tanlang</option>
                {otmList.map((otm) => (
                  <option key={otm.code} value={otm.name_uz}>
                    {otm.name_uz} ({otm.code})
                  </option>
                ))}
              </select>
              {fieldErrors.current_institution && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.current_institution}</p>
              )}
            </div>

            {/* 3. Ixtisoslik shifri */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.specialtyCode} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.specialty_code}
                onChange={(e) => {
                  const selected = specialtiesList.find((s) => s.code === e.target.value);
                  setFormData({
                    ...formData,
                    specialty_code: e.target.value,
                    scientific_field: selected?.field || formData.scientific_field,
                  });
                }}
                className={`w-full text-sm bg-white dark:bg-[#11263E] border rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none transition ${
                  fieldErrors.specialty_code ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20' : 'border-slate-300 dark:border-[#263B55] focus:border-[#2563EB] dark:focus:border-[#3B82F6]'
                }`}
              >
                <option value="">tanlang</option>
                {specialtiesList.map((spec) => (
                  <option key={spec.code} value={spec.code}>
                    {spec.code} — {spec.name_uz}
                  </option>
                ))}
              </select>
              {fieldErrors.specialty_code && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.specialty_code}</p>
              )}
            </div>

            {/* 4. Ilmiy daraja beradigan fan tarmog'i */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.scientificField}
              </label>
              <select
                value={formData.scientific_field}
                onChange={(e) => setFormData({ ...formData, scientific_field: e.target.value })}
                className="w-full text-sm bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              >
                <option value="">tanlang</option>
                {refOptions?.scientific_fields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Malakaviy imtihon turi */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.qualificationExamType}
              </label>
              <select
                value={formData.qualification_exam_type}
                onChange={(e) => setFormData({ ...formData, qualification_exam_type: e.target.value })}
                className="w-full text-sm bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              >
                <option value="">tanlang</option>
                {refOptions?.exam_types.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label_uz}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Ism */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.firstName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Ismingizni kiriting"
                className={`w-full text-sm bg-white dark:bg-[#11263E] border rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none transition ${
                  fieldErrors.first_name ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20' : 'border-slate-300 dark:border-[#263B55] focus:border-[#2563EB] dark:focus:border-[#3B82F6]'
                }`}
              />
              {fieldErrors.first_name && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>
              )}
            </div>

            {/* 7. Familya */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.lastName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Familiyangizni kiriting"
                className={`w-full text-sm bg-white dark:bg-[#11263E] border rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none transition ${
                  fieldErrors.last_name ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20' : 'border-slate-300 dark:border-[#263B55] focus:border-[#2563EB] dark:focus:border-[#3B82F6]'
                }`}
              />
              {fieldErrors.last_name && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</p>
              )}
            </div>

            {/* 8. Sharif(Otchestvo) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.middleName}
              </label>
              <input
                type="text"
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                placeholder="Otangizning ismi"
                className="w-full text-sm bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>

            {/* 9. Jins */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.gender}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full text-sm bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              >
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </div>

            {/* 10. Jshr */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.jshr}
              </label>
              <input
                type="text"
                maxLength={14}
                value={formData.jshr}
                onChange={(e) => setFormData({ ...formData, jshr: e.target.value.replace(/\D/g, '') })}
                placeholder="14 xonali JSHSHIR raqami"
                className="w-full text-sm bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>

            {/* 11. Telefon raqami */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.phone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className={`w-full text-sm bg-white dark:bg-[#11263E] border rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none transition ${
                  fieldErrors.phone ? 'border-red-400 bg-red-50/20 dark:bg-red-950/20' : 'border-slate-300 dark:border-[#263B55] focus:border-[#2563EB] dark:focus:border-[#3B82F6]'
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            {/* 12. Ilmiy rahbar */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.supervisor}
              </label>
              <input
                type="text"
                value={formData.scientific_supervisor}
                onChange={(e) => setFormData({ ...formData, scientific_supervisor: e.target.value })}
                placeholder="F.I.SH va ilmiy darajasi"
                className="w-full text-sm bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>

            {/* 13. Ish bajarayotgan tashkilot */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.workplace}
              </label>
              <input
                type="text"
                value={formData.workplace}
                onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                placeholder="Ish yoki o'qish joyi"
                className="w-full text-sm bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>

            {/* 14. Boshqa OTMdan qatnashish (Conditional Document 6 Trigger) */}
            <div className="md:col-span-2 p-4 bg-blue-50/60 dark:bg-[#162B45]/50 rounded-xl border border-blue-200 dark:border-[#263B55]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_from_another_institution}
                  onChange={(e) => setFormData({ ...formData, is_from_another_institution: e.target.checked })}
                  className="w-4 h-4 text-[#2563EB] rounded border-slate-300 dark:border-[#263B55] focus:ring-[#2563EB]"
                />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {t.form.isFromAnother}
                </span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-7">
                Belgilansa: O&apos;z muassasangiz tomonidan berilgan <strong>&quot;Aloqa xati&quot; (6-hujjat)</strong> yuklash majburiy bo&apos;ladi.
              </p>
            </div>

            {/* 15. Disertatsiya mavzusi */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.form.dissertationTopic}
              </label>
              <textarea
                rows={3}
                value={formData.dissertation_topic}
                onChange={(e) => setFormData({ ...formData, dissertation_topic: e.target.value })}
                placeholder="Tasdiqlangan dissertatsiya mavzusining to'liq nomi"
                className="w-full text-sm bg-white dark:bg-[#11263E] border border-slate-300 dark:border-[#263B55] rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#263B55] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleProceedToStep2}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm disabled:opacity-50"
            >
              {t.form.next}: Hujjatlar (6 ta toifa)
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Required Documents Upload */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F2036] rounded-2xl shadow-sm border border-slate-200 dark:border-[#263B55] p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#263B55] pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.documents.mandatory6}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Belgilangan tartibga muvofiq quyidagi 6 ta hujjat toifasining sifatli nusxasini PDF formatda biriktiring.
                </p>
              </div>

              {/* Progress counter pill */}
              <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-bold border shrink-0 bg-slate-50 dark:bg-[#11263E] border-slate-300 dark:border-[#263B55] text-slate-700 dark:text-slate-200">
                Yuklandi: <span className="text-[#2563EB] dark:text-[#3B82F6]">{uploadedMandatoryCount}</span> / {mandatoryDocs.length} ta majburiy
              </div>
            </div>

            {/* Document 6 conditional notice */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-300">
              {formData.is_from_another_institution ? (
                <span>
                  ✓ Siz boshqa muassasadan qatnashayotganingiz sababli, <strong>6-hujjat (Aloqa xati)</strong> majburiydir.
                </span>
              ) : (
                <span>
                  ℹ Siz institutning o&apos;zidan qatnashayotganingiz sababli, <strong>6-hujjat (Aloqa xati)</strong> talab etilmaydi va ixtiyoriy hisoblanadi.
                </span>
              )}
            </div>
          </div>

          {/* Guaranteed 6 Document Upload Cards */}
          <div className="space-y-4">
            {documentsToRender.map((docItem) => {
              const dt = docItem.documentType;
              const uploaded = application?.documents?.find((d) => d.document_type.id === dt.id);

              return (
                <DocumentUploadCard
                  key={dt.id}
                  documentType={dt}
                  uploadedDoc={uploaded}
                  isRequired={docItem.isRequired}
                  isConditional={docItem.isConditional}
                  applicationStatus={application?.status || 'draft'}
                  onUpload={handleDocumentUpload}
                  onDelete={handleDocumentDelete}
                />
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#162B45] border border-slate-300 dark:border-[#263B55] hover:bg-slate-50 dark:hover:bg-[#1c3554] transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.form.prev}
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm"
            >
              {t.form.next}: Ko&apos;rib chiqish
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl shadow-sm border border-slate-200 dark:border-[#263B55] p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 dark:border-[#263B55] pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Arizani ko&apos;rib chiqish va tasdiqlash
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Topshirishdan oldin barcha ma&apos;lumotlarning to&apos;g&apos;riligini va hujjatlar to&apos;liqligini tekshiring.
            </p>
          </div>

          {/* Missing documents warning if not all uploaded */}
          {!allMandatoryUploaded && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-2">
              <div className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                Diqqat! Arizani topshirish uchun quyidagi majburiy hujjatlar yuklanishi shart:
              </div>
              <ul className="list-disc pl-6 space-y-1">
                {mandatoryDocs
                  .filter((d) => !uploadedDocTypeIds.has(d.documentType.id))
                  .map((d) => (
                    <li key={d.documentType.id} className="font-semibold text-red-700 dark:text-red-400">
                      {d.documentType.sort_order}. {d.documentType.name_uz}
                    </li>
                  ))}
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Hujjatlarni yuklash bo&apos;limiga o&apos;tish
                </button>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 dark:bg-[#11263E]/60 rounded-xl border border-slate-200 dark:border-[#263B55] space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-2">
                Shaxsiy ma&apos;lumotlar
              </h4>
              <div><span className="text-slate-500 dark:text-slate-400">F.I.SH:</span> <strong className="text-slate-900 dark:text-white">{formData.last_name} {formData.first_name} {formData.middle_name}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Jinsi:</span> {formData.gender === 'male' ? 'Erkak' : 'Ayol'}</div>
              <div><span className="text-slate-500 dark:text-slate-400">JSHR:</span> {formData.jshr || '-'}</div>
              <div><span className="text-slate-500 dark:text-slate-400">Telefon:</span> {formData.phone}</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#11263E]/60 rounded-xl border border-slate-200 dark:border-[#263B55] space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-2">
                Ilmiy ma&apos;lumotlar
              </h4>
              <div><span className="text-slate-500 dark:text-slate-400">OTM / ITM:</span> <strong className="text-slate-900 dark:text-white">{formData.current_institution}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Ta&apos;lim shakli:</span> {formData.education_form}</div>
              <div><span className="text-slate-500 dark:text-slate-400">Ixtisoslik:</span> {formData.specialty_code}</div>
              <div><span className="text-slate-500 dark:text-slate-400">Fan tarmog&apos;i:</span> {formData.scientific_field || '-'}</div>
              <div><span className="text-slate-500 dark:text-slate-400">Ilmiy rahbar:</span> {formData.scientific_supervisor || '-'}</div>
            </div>
          </div>

          {/* Uploaded Documents Status Checklist */}
          <div className="p-4 bg-slate-50 dark:bg-[#11263E]/60 rounded-xl border border-slate-200 dark:border-[#263B55]">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-[#263B55] pb-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                Yuklangan 6 ta hujjat holati
              </h4>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline"
              >
                Tahrirlash / Yuklash
              </button>
            </div>

            <div className="space-y-2">
              {documentsToRender.map((docItem) => {
                const dt = docItem.documentType;
                const uploaded = application?.documents?.find((d) => d.document_type.id === dt.id);

                return (
                  <div key={dt.id} className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-[#263B55]/60 last:border-0 text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {dt.sort_order}. {dt.name_uz}
                    </span>
                    {uploaded ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Yuklangan ({uploaded.original_filename})
                      </span>
                    ) : docItem.isRequired ? (
                      <span className="text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                        Yuklanmagan (Majburiy)
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        Talab etilmaydi
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-4 bg-blue-50/50 dark:bg-[#162B45]/50 rounded-xl border border-blue-200/80 dark:border-[#263B55]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#2563EB] rounded mt-0.5" />
              <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Men taqdim etilgan barcha ma&apos;lumotlar va hujjatlarning haqiqiyligini tasdiqlayman. Qasddan noto&apos;g&apos;ri ma&apos;lumot berish arizaning bekor qilinishiga sabab bo&apos;lishi to&apos;g&apos;risida ogohlantirildim.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#263B55]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#162B45] border border-slate-300 dark:border-[#263B55] hover:bg-slate-50 dark:hover:bg-[#1c3554] transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.form.prev}
            </button>

            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={loading || !allMandatoryUploaded}
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition shadow-md ${
                allMandatoryUploaded
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              {loading ? "Topshirilmoqda..." : allMandatoryUploaded ? t.form.submit : "Hujjatlarni yuklang"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirmation Page */}
      {currentStep === 4 && application && (
        <div className="bg-white dark:bg-[#0F2036] rounded-2xl shadow-sm border border-slate-200 dark:border-[#263B55] p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Arizangiz muvaffaqiyatli qabul qilindi!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Sizning ro&apos;yxatdan o&apos;tish arizangiz komissiya tekshiruviga yuborildi. Holatni shaxsiy kabinetingiz orqali kuzatib borishingiz mumkin.
            </p>
          </div>

          {/* Reference number box */}
          <div className="p-4 bg-slate-50 dark:bg-[#11263E] rounded-xl border border-slate-200 dark:border-[#263B55] max-w-sm mx-auto">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Ariza raqami
            </div>
            <div className="text-2xl font-black text-[#2563EB] dark:text-[#3B82F6] tracking-wider mt-1">
              {application.reference_number}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Topshirilgan vaqti: {application.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'Muvaffaqiyatli topshirildi'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/kabinet')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm"
            >
              Shaxsiy kabinetga o&apos;tish
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#162B45] border border-slate-300 dark:border-[#263B55] hover:bg-slate-50 dark:hover:bg-[#1c3554] transition"
            >
              Arizani chop etish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
