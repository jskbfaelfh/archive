export type UserRole =
  | 'super_admin'       // سوبر أدمن الجامعة
  | 'college_admin'      // أدمن الكلية
  | 'department_admin'   // أدمن القسم
  | 'doctor'             // تدريسي
  | 'student';           // طالب

export interface Section {
  id: string;
  name: string; // مثال: شعبة (أ)
  code?: string;
  stage: number; // المرحلة (1 إلى 6)
  departmentId: string;
  collegeId: string;
}

export interface Department {
  id: string;
  collegeId: string;
  name: string;
  code?: string;
  stagesCount: number; // عدد المراحل (مثلاً 4 أو 6)
}

export interface College {
  id: string;
  name: string;
  code?: string;
  departments: Department[];
}

export type FacilityType = 'hall' | 'lab';

export interface Facility {
  id: string;
  name: string;
  code?: string;
  type: FacilityType; // 'hall' (قاعة مدرجة/دراسية) أو 'lab' (مختبر علمي/سريري)
  collegeId: string;
  departmentId?: string;
  building?: string;
  capacity?: number;
}

export type SubjectType = 'both' | 'theory' | 'practical';

export interface Subject {
  id: string;
  name: string;
  code?: string;
  collegeId: string;
  departmentId: string;
  stage: number;
  semester: 1 | 2;
  subjectType?: SubjectType;
  doctorId?: string;
  doctorName?: string;
  theoryDoctorId?: string;
  theoryDoctorName?: string;
  practicalDoctorId?: string;
  practicalDoctorName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  collegeId?: string;
  departmentId?: string;
  stage?: number;
  sectionId?: string;
  sectionName?: string;
  mustChangePassword?: boolean;
}

export type FileType = 'pdf' | 'pptx' | 'docx' | 'video';

export interface Lecture {
  id: string;
  title: string;
  collegeId: string;
  departmentId: string;
  stage: number;
  sectionTarget: 'all' | string;
  sectionName?: string;
  subjectId: string;
  subjectName?: string;
  doctorId: string;
  doctorName: string;
  uploadDate: string;
  fileType: FileType;
  fileSize: string;
  fileName: string;
  filePath?: string;
  description?: string;
  category?: 'theory' | 'practical';
  downloadsCount: number;
  viewsCount: number;
}

export type DayKey = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday';

export const WEEK_DAYS: { key: DayKey; label: string }[] = [
  { key: 'saturday', label: 'السبت' },
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الاثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
];

export type ScheduleTargetType = 'stage' | 'doctor';

export interface Schedule {
  id: string;
  title: string;
  targetType: ScheduleTargetType;
  collegeId: string;
  departmentId: string;
  stage?: number;
  sectionTarget?: 'all' | string;
  sectionName?: string;
  doctorId?: string;
  doctorName?: string;
  semester: 1 | 2;
  academicYear: string;
  type: 'image' | 'api';
  imageUrl: string;
  notes?: string;
  daysRange?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface CentralField {
  key: string;
  label: string;
  description?: string;
  required?: boolean;
}

export type CentralTableKey = 'colleges' | 'departments' | 'faculty' | 'facilities';

export interface TableSyncMapping {
  tableKey: CentralTableKey;
  tableName: string;
  sourceTable: string;
  selectedFields: string[];
  lastSyncedAt?: string;
  syncedCount?: number;
}

export interface IntegrationSettings {
  isEnabled: boolean; // تفعيل تكامل نظام الجداول مع نظام الهيكلية المركزي
  apiUrl: string; // حقل واجهة برمجة التطبيقات (API Endpoint URL)
  apiKey: string; // مفتاح الوصول والتوثيق (API Key / Token)
  webhookUrl?: string;
  webhookSecret?: string;
  syncIntervalMinutes?: number;
  lastSyncTimestamp?: string;
  lastSyncStatus?: 'idle' | 'success' | 'error' | 'syncing';
  lastSyncMessage?: string;
  mappings: Record<CentralTableKey, TableSyncMapping>;
}

export interface SyncHistoryItem {
  id: string;
  timestamp: string;
  type: 'manual' | 'automatic' | 'webhook';
  status: 'success' | 'failed';
  details: string;
  counts: {
    colleges: number;
    departments: number;
    faculty: number;
    facilities: number;
  };
}
