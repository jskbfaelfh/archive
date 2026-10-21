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

export interface Subject {
  id: string;
  name: string;
  code?: string;
  collegeId: string;
  departmentId: string;
  stage: number;
  semester: 1 | 2;
  doctorId?: string;
  doctorName?: string;
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
  sectionTarget: 'all' | string; // 'all' أو معرّف شعبة معينة
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

export interface Schedule {
  id: string;
  title: string;
  collegeId: string;
  departmentId: string;
  stage: number;
  sectionTarget: 'all' | string;
  sectionName?: string;
  semester: 1 | 2;
  academicYear: string;
  type: 'image' | 'api';
  imageUrl?: string;
  dailyImages?: Partial<Record<DayKey, string>>;
  notes?: string;
  daysRange: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}
