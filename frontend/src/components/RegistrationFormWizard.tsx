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
  Calendar,
  Phone,
  CreditCard,
  Building,
  GraduationCap,
  Award,
} from 'lucide-react';

interface Props {
  initialExam?: Examination;
  existingAppId?: string | number;
}

export const RegistrationFormWizard: React.FC<Props> = ({ initialExam, existingAppId }) => {
  const { user, login } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  // 5 Wizard Steps matching Screen 4 in Reference Board:
  // Step 1: Shaxsiy ma'lumotlar
  // Step 2: Ta'lim ma'lumotlari
  // Step 3: Ixtisoslik va imtihon tanlash
  // Step 4: Hujjatlar (6 ta)
  // Step 5: Tasdiqlash
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

  // Application instance
  const [application, setApplication] = useState<Application | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Shaxsiy
    first_name: '',
    last_name: '',
    middle_name: '',
    birth_date: '1998-05-15',
    gender: 'male',
    phone: '+998 90 123 45 67',
    passport_series_number: 'AA 1234567',
    jshr: '',

    // Step 2: Ta'lim
    education_form: 'doktorantura',
    current_institution: 'Andijon qishloq xo‘jaligi va agrotexnologiyalar instituti',
    workplace: 'AQXI Agrobiologiya kafedrasi',
    is_from_another_institution: false,

    // Step 3: Ixtisoslik & Imtihon
    specialty_code: '06.01.05',
    scientific_field: "Qishloq xo'jaligi fanlari",
    qualification_exam_type: 'specialty',
    scientific_supervisor: 'Prof. X.A. Karimov',
    dissertation_topic: 'G‘o‘za seleksiyasida zamonaviy biotexnologik usullardan foydalanish samarasini oshirish',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

        if (!selectedExamId && examsData.length > 0) {
          setSelectedExamId(examsData[0].id);
          setCurrentExam(examsData[0]);
        }
      } catch (err) {
        console.error('Failed to load references', err);
      }
    };
    fetchReferences();
  }, []);

  useEffect(() => {
    if (existingAppId) {
      api
        .getApplication(existingAppId)
        .then((app) => {
          setApplication(app);
          setSelectedExamId(app.examination.id);
          setCurrentExam(app.examination);
          if (app.applicant_snapshot) {
            setFormData((prev) => ({ ...prev, ...app.applicant_snapshot }));
          }
        })
        .catch((err) => console.error('Failed to load application', err));
    }
  }, [existingAppId]);

  const handleExamChange = (examId: number) => {
    setSelectedExamId(examId);
    const found = examinations.find((e) => e.id === examId);
    if (found) setCurrentExam(found);
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login('talabgor@aqxi.uz', 'Talabgor123!');
    } catch (err: any) {
      setErrorMsg('Kirishda xatolik: ' + (err.message || 'Xatolik'));
    } finally {
      setLoading(false);
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.first_name && !formData.last_name) {
      errors.name = "F.I.SH to'liq kiritilishi shart.";
    }
    if (!formData.phone) errors.phone = 'Telefon raqam kiritilishi shart.';
    if (!formData.passport_series_number) errors.passport = 'Pasport maʼlumotlari kiritilishi shart.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!formData.current_institution) errors.current_institution = 'OTM yoki ITM nomi tanlanishi shart.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!formData.specialty_code) errors.specialty_code = 'Ixtisoslik shifri tanlanishi shart.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save or create application draft
  const ensureApplicationDraft = async () => {
    if (application) return application;
    const app = await api.createApplication({
      examination_id: selectedExamId || 1,
      applicant_snapshot: formData,
    });
    const detail = await api.getApplication(app.id);
    setApplication(detail);
    return detail;
  };

  const handleProceedFromStep1 = () => {
    setErrorMsg(null);
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleProceedFromStep2 = () => {
    setErrorMsg(null);
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleProceedFromStep3 = async () => {
    setErrorMsg(null);
    if (!validateStep3()) return;

    if (!user) {
      setErrorMsg("Hujjatlarni yuklash uchun avval shaxsiy kabinetingizga kiring yoki ro'yxatdan o'ting.");
      return;
    }

    setLoading(true);
    try {
      await ensureApplicationDraft();
      setCurrentStep(4);
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
    const updated = await api.getApplication(app.id);
    setApplication(updated);
  };

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
      setCurrentStep(5);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Arizani topshirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Compute full 6-document list guaranteed:
  const documentsToRender =
    currentExam?.required_documents && currentExam.required_documents.length > 0
      ? currentExam.required_documents.map((reqDoc) => ({
          documentType: reqDoc.document_type,
          isConditional: reqDoc.is_conditional || reqDoc.document_type.code === 'liaison_letter',
          isRequired:
            reqDoc.document_type.code === 'liaison_letter'
              ? formData.is_from_another_institution
              : reqDoc.is_required,
        }))
      : docTypes.map((dt) => ({
          documentType: dt,
          isConditional: dt.code === 'liaison_letter',
          isRequired:
            dt.code === 'liaison_letter' ? formData.is_from_another_institution : true,
        }));

  const uploadedDocTypeIds = new Set(application?.documents?.map((d) => d.document_type.id) || []);
  const mandatoryDocs = documentsToRender.filter((d) => d.isRequired);
  const uploadedMandatoryCount = mandatoryDocs.filter((d) => uploadedDocTypeIds.has(d.documentType.id)).length;
  const allMandatoryUploaded = mandatoryDocs.every((d) => uploadedDocTypeIds.has(d.documentType.id));

  // 5 Step Stepper configuration matching Screen 4
  const steps = [
    { num: 1, title: "Shaxsiy ma'lumotlar" },
    { num: 2, title: "Ta'lim ma'lumotlari" },
    { num: 3, title: "Ixtisoslik tanlash" },
    { num: 4, title: "Hujjatlar" },
    { num: 5, title: "Tasdiqlash" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Ariza topshirish (bosqichma-bosqich)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Malakaviy imtihon uchun elektron ariza topshirish va hujjatlarni biriktirish
        </p>
      </div>

      {/* Stepper matching Screen 4 */}
      <div className="mb-8 bg-white dark:bg-[#0D223A] rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition ${
                      isCompleted
                        ? 'bg-[#10B981] text-white shadow-sm'
                        : isCurrent
                        ? 'bg-[#2563EB] text-white shadow-md ring-4 ring-[#2563EB]/20 dark:ring-[#3B82F6]/30'
                        : 'bg-slate-100 dark:bg-[#162E4A] text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      isCurrent
                        ? 'text-[#2563EB] dark:text-[#3B82F6]'
                        : isCompleted
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-3 transition ${
                      currentStep > s.num ? 'bg-[#10B981]' : 'bg-slate-200 dark:bg-[#1E3A5F]'
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
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-start gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      {/* =========================================================================
          STEP 1: Shaxsiy ma'lumotlar (Exact match with Screen 4)
         ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-[#0D223A] rounded-2xl shadow-sm border border-slate-200/90 dark:border-[#1E3A5F] p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 dark:border-[#1E3A5F] pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Shaxsiy ma&apos;lumotlar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pasport va asosiy aloqa ma&apos;lumotlaringizni to&apos;ldiring
            </p>
          </div>

          <div className="space-y-4">
            {/* F.I.SH. */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                F.I.SH. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={`${formData.last_name} ${formData.first_name} ${formData.middle_name}`.trim()}
                onChange={(e) => {
                  const parts = e.target.value.split(' ');
                  setFormData({
                    ...formData,
                    last_name: parts[0] || '',
                    first_name: parts[1] || '',
                    middle_name: parts.slice(2).join(' ') || '',
                  });
                }}
                placeholder="To'liq ism, familiya, otasining ismi"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Tug'ilgan sana */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tug&apos;ilgan sana <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Jinsi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jinsi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              >
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </div>

            {/* Telefon raqam */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Telefon raqam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Pasport seriyasi va raqami */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pasport seriyasi va raqami <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.passport_series_number}
                onChange={(e) => setFormData({ ...formData, passport_series_number: e.target.value })}
                placeholder="AA 1234567"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Bottom Action Bar matching Screen 4 (Bekor qilish & Keyingi) */}
          <div className="pt-6 border-t border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152E4D]"
            >
              Bekor qilish
            </Link>

            <button
              type="button"
              onClick={handleProceedFromStep1}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm inline-flex items-center gap-1.5"
            >
              <span>Keyingi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: Ta'lim ma'lumotlari
         ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-[#0D223A] rounded-2xl shadow-sm border border-slate-200/90 dark:border-[#1E3A5F] p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 dark:border-[#1E3A5F] pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Ta&apos;lim ma&apos;lumotlari
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Joriy taʼlim muassasangiz va ish joyingiz to‘g‘risidagi maʼlumotlar
            </p>
          </div>

          <div className="space-y-4">
            {/* OTM yoki ITM nomi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                OTM yoki ITM nomi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.current_institution}
                onChange={(e) => setFormData({ ...formData, current_institution: e.target.value })}
                placeholder="Andijon qishloq xo‘jaligi va agrotexnologiyalar instituti"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Ta'lim shakli */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ta&apos;lim shakli <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.education_form}
                onChange={(e) => setFormData({ ...formData, education_form: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              >
                <option value="doktorantura">Doktorantura (PhD / DSc)</option>
                <option value="mustaqil_izlanuvchi">Mustaqil izlanuvchilik</option>
                <option value="magistratura">Magistratura</option>
                <option value="boshqa">Boshqa shakl</option>
              </select>
            </div>

            {/* Ish joyi va lavozimi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ish joyi va lavozimi
              </label>
              <input
                type="text"
                value={formData.workplace}
                onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                placeholder="Masalan: AQXI Agrobiologiya kafedrasi assistenti"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Boshqa OTMdan qatnashish */}
            <div className="p-4 bg-blue-50/50 dark:bg-[#122A46] rounded-xl border border-blue-200/80 dark:border-[#1E3A5F]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_from_another_institution}
                  onChange={(e) => setFormData({ ...formData, is_from_another_institution: e.target.checked })}
                  className="w-4 h-4 text-[#2563EB] rounded border-slate-300 dark:border-[#1E3A5F] focus:ring-[#2563EB]"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Institutdan boshqa OTM/ITMdan qatnashmoqdaman
                </span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-7">
                Belgilansa: OTM rektoratidan berilgan rasmiy <strong>&quot;Aloqa xati&quot; (6-hujjat)</strong> yuklanishi talab etiladi.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152E4D] inline-flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>

            <button
              type="button"
              onClick={handleProceedFromStep2}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm inline-flex items-center gap-1.5"
            >
              <span>Keyingi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: Ixtisoslik va Imtihon tanlash
         ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-[#0D223A] rounded-2xl shadow-sm border border-slate-200/90 dark:border-[#1E3A5F] p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 dark:border-[#1E3A5F] pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Ixtisoslik va Imtihonni tanlash
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Topshiriladigan imtihon va OAK ixtisoslik shifrini belgilang
            </p>
          </div>

          <div className="space-y-4">
            {/* Imtihonni tanlang */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ro&apos;yxatdan o&apos;tish uchun imtihon <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => handleExamChange(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              >
                {examinations.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.language.toUpperCase()}) — {exam.category}
                  </option>
                ))}
              </select>
            </div>

            {/* OAK Ixtisoslik shifri */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                OAK Ixtisoslik shifri <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.specialty_code}
                onChange={(e) => setFormData({ ...formData, specialty_code: e.target.value })}
                placeholder="06.01.05 - Seleksiya va urug'chilik"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Fan tarmog'i */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ilmiy daraja beradigan fan tarmog&apos;i
              </label>
              <input
                type="text"
                value={formData.scientific_field}
                onChange={(e) => setFormData({ ...formData, scientific_field: e.target.value })}
                placeholder="Qishloq xo'jaligi fanlari"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Ilmiy rahbar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ilmiy rahbar (konsultant)
              </label>
              <input
                type="text"
                value={formData.scientific_supervisor}
                onChange={(e) => setFormData({ ...formData, scientific_supervisor: e.target.value })}
                placeholder="F.I.SH., ilmiy darajasi va unvoni"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Dissertatsiya mavzusi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Dissertatsiya mavzusi
              </label>
              <textarea
                rows={2}
                value={formData.dissertation_topic}
                onChange={(e) => setFormData({ ...formData, dissertation_topic: e.target.value })}
                placeholder="OTM ilmiy kengashi tomonidan tasdiqlangan dissertatsiya mavzusi"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-200 dark:border-[#1E3A5F] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152E4D] inline-flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>

            <button
              type="button"
              onClick={handleProceedFromStep3}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm inline-flex items-center gap-1.5"
            >
              <span>{loading ? 'Saqlanmoqda...' : 'Keyingi: Hujjatlar'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: Hujjatlarni yuklash (Talab qilinadigan 6 ta hujjat)
         ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D223A] rounded-2xl shadow-sm border border-slate-200/90 dark:border-[#1E3A5F] p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1E3A5F] pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Talab qilinadigan hujjatlarni yuklash
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Belgilangan tartib bo‘yicha quyidagi hujjatlarning PDF yoki sifatli skaner nusxalarini yuklang.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl text-xs font-bold border shrink-0 bg-slate-50 dark:bg-[#071426] border-slate-200 dark:border-[#1E3A5F] text-slate-700 dark:text-slate-300">
                Yuklandi: <span className="text-[#2563EB] dark:text-[#3B82F6]">{uploadedMandatoryCount}</span> / {mandatoryDocs.length} ta majburiy
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-300">
              {formData.is_from_another_institution ? (
                <span>✓ Siz boshqa muassasadan qatnashayotganingiz sababli, <strong>6-hujjat (Aloqa xati)</strong> majburiydir.</span>
              ) : (
                <span>ℹ Siz institutning o&apos;zidan qatnashayotganingiz sababli, <strong>6-hujjat (Aloqa xati)</strong> talab etilmaydi.</span>
              )}
            </div>
          </div>

          {/* 6 Document Upload Cards */}
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

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152E4D] inline-flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition shadow-sm inline-flex items-center gap-1.5"
            >
              <span>Keyingi: Tasdiqlash</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 5: Tasdiqlash va Yuborish (Screen 4 Completion)
         ========================================================================= */}
      {currentStep === 5 && (
        <div className="bg-white dark:bg-[#0D223A] rounded-2xl shadow-sm border border-slate-200/90 dark:border-[#1E3A5F] p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 dark:border-[#1E3A5F] pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Arizani ko&apos;rib chiqish va tasdiqlash
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Arizani rasman topshirishdan oldin barcha maʼlumotlarni tekshiring
            </p>
          </div>

          {/* Warning if mandatory docs missing */}
          {!allMandatoryUploaded && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Diqqat! Quyidagi majburiy hujjatlar yuklanmagan:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {mandatoryDocs
                  .filter((d) => !uploadedDocTypeIds.has(d.documentType.id))
                  .map((d) => (
                    <li key={d.documentType.id} className="font-bold text-red-600 dark:text-red-400">
                      {d.documentType.sort_order}. {d.documentType.name_uz}
                    </li>
                  ))}
              </ul>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Hujjatlarni yuklashga qaytish
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-[#071426] rounded-xl border border-slate-200/80 dark:border-[#1E3A5F] space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                Shaxsiy maʼlumotlar
              </div>
              <div><span className="text-slate-500 dark:text-slate-400">F.I.SH:</span> <strong>{formData.last_name} {formData.first_name} {formData.middle_name}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Tug‘ilgan sana:</span> {formData.birth_date}</div>
              <div><span className="text-slate-500 dark:text-slate-400">Jinsi:</span> {formData.gender === 'male' ? 'Erkak' : 'Ayol'}</div>
              <div><span className="text-slate-500 dark:text-slate-400">Telefon:</span> {formData.phone}</div>
              <div><span className="text-slate-500 dark:text-slate-400">Pasport:</span> {formData.passport_series_number}</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#071426] rounded-xl border border-slate-200/80 dark:border-[#1E3A5F] space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                Taʼlim va Ilmiy maʼlumotlar
              </div>
              <div><span className="text-slate-500 dark:text-slate-400">OTM:</span> <strong>{formData.current_institution}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Taʼlim shakli:</span> {formData.education_form}</div>
              <div><span className="text-slate-500 dark:text-slate-400">Ixtisoslik:</span> <strong>{formData.specialty_code}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Ilmiy rahbar:</span> {formData.scientific_supervisor}</div>
              <div><span className="text-slate-500 dark:text-slate-400">Mavzu:</span> {formData.dissertation_topic}</div>
            </div>
          </div>

          {/* Consent */}
          <div className="p-4 bg-blue-50/50 dark:bg-[#122A46] rounded-xl border border-blue-200/80 dark:border-[#1E3A5F]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#2563EB] rounded mt-0.5" />
              <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Taqdim etilgan barcha ma&apos;lumotlar va yuklangan hujjatlarning haqiqiyligini tasdiqlayman.
              </span>
            </label>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152E4D] inline-flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={loading || !allMandatoryUploaded}
              className={`px-7 py-3 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-2 ${
                allMandatoryUploaded
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[#2563EB]/25'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Yuborilmoqda...' : 'Arizani topshirish'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
