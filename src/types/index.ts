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
