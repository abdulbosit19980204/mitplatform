export type Role = 'applicant' | 'reviewer' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: Role;
  is_active: boolean;
  date_joined: string;
  profile?: ApplicantProfile;
}

export interface ApplicantProfile {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  gender?: 'male' | 'female';
  birth_date?: string;
  jshr?: string;
  passport_series?: string;
  passport_number?: string;
  phone?: string;
  current_institution?: string;
  current_institution_code?: string;
  education_form?: string;
  specialty_code?: string;
  specialty_name?: string;
  scientific_field?: string;
  scientific_supervisor?: string;
  workplace?: string;
  dissertation_topic?: string;
  is_from_another_institution: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ExamStatus = 'draft' | 'published' | 'registration_closed' | 'archived';
export type ExamLanguage = 'uz' | 'en' | 'de' | 'ru';

export interface RequiredDocumentType {
  id: number;
  code: string;
  name_uz: string;
  name_oz: string;
  name_ru: string;
  description_uz: string;
  accepted_formats: string;
  max_size_mb: number;
  sort_order: number;
}

export interface ExaminationRequiredDoc {
  id: number;
  document_type: RequiredDocumentType;
  is_conditional: boolean;
  condition_field: string;
  is_required: boolean;
  sort_order: number;
}

export interface ExaminationSession {
  id: number;
  name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  capacity?: number;
  is_published: boolean;
  registered_count: number;
}

export interface Examination {
  id: number;
  title: string;
  title_uz?: string;
  title_oz?: string;
  title_ru?: string;
  description?: string;
  category?: string;
  language: ExamLanguage;
  registration_start: string;
  registration_end: string;
  exam_date?: string;
  location?: string;
  capacity?: number;
  eligibility_rules?: string;
  status: ExamStatus;
  is_registration_open: boolean;
  registered_count: number;
  is_foreign_language: boolean;
  require_liaison_letter: boolean;
  required_documents?: ExaminationRequiredDoc[];
  sessions?: ExaminationSession[];
  created_at: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'correction_required'
  | 'approved'
  | 'rejected'
  | 'completed';

export interface DocumentReview {
  id: number;
  decision: 'approved' | 'correction_required';
  comments?: string;
  reviewed_by_name?: string;
  created_at: string;
}

export interface ApplicationDocument {
  id: number;
  application: number;
  document_type: RequiredDocumentType;
  document_type_code: string;
  document_type_name: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'approved' | 'correction_required';
  download_url: string;
  reviews?: DocumentReview[];
  uploaded_at: string;
}

export interface ApplicationStatusHistory {
  id: number;
  from_status: string;
  to_status: string;
  changed_by_name?: string;
  reason?: string;
  created_at: string;
}

export interface Application {
  id: number;
  reference_number: string;
  examination: Examination;
  session?: number;
  applicant: number;
  applicant_name?: string;
  applicant_email?: string;
  status: ApplicationStatus;
  applicant_snapshot?: Record<string, any>;
  assigned_reviewer?: number;
  assigned_reviewer_name?: string;
  internal_notes?: string;
  rejection_reason?: string;
  correction_notes?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  documents?: ApplicationDocument[];
  status_history?: ApplicationStatusHistory[];
  documents_count?: {
    total: number;
    approved: number;
    pending: number;
    correction_required: number;
  };
}

export interface UzbekistanOTM {
  id: number;
  code: string;
  name_uz: string;
  name_oz: string;
  name_ru: string;
  region?: string;
}

export interface UzbekistanSpecialty {
  id: number;
  code: string;
  name_uz: string;
  name_oz: string;
  name_ru: string;
  field?: string;
}

export interface ReferenceOptions {
  education_forms: { value: string; label_uz: string; label_oz: string; label_ru: string }[];
  exam_types: { value: string; label_uz: string; label_oz: string; label_ru: string }[];
  scientific_fields: string[];
}
