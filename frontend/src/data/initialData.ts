// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file initialData.ts
 * @description البيانات الافتراضية المركزية لمنظومة جامعة الزهراوي
 * @created 2026-10-21
 */
import { College, Section, Subject, User, Lecture } from '@/types';

export const initialColleges: College[] = [
  {
    id: 'col-medicine',
    name: 'كلية الطب البشري',
    departments: [
      { id: 'dept-surgery', collegeId: 'col-medicine', name: 'قسم الجراحة العامة', stagesCount: 4 },
      { id: 'dept-cardio', collegeId: 'col-medicine', name: 'قسم الباطنية والقلبية', stagesCount: 4 },
    ],
  },
  {
    id: 'col-dentistry',
    name: 'كلية طب الأسنان',
    departments: [
      { id: 'dept-ortho', collegeId: 'col-dentistry', name: 'قسم تقويم الأسنان وجراحة الفم', stagesCount: 5 },
      { id: 'dept-perio', collegeId: 'col-dentistry', name: 'قسم معالجة وأمراض وجراحة اللثة', stagesCount: 5 },
    ],
  },
  {
    id: 'col-pharmacy',
    name: 'كلية الصيدلة',
    departments: [
      { id: 'dept-pharmaceutics', collegeId: 'col-pharmacy', name: 'قسم الصيدلانيات والسموم', stagesCount: 5 },
      { id: 'dept-medchem', collegeId: 'col-pharmacy', name: 'قسم الكيمياء الصيدلانية', stagesCount: 5 },
    ],
  },
  {
    id: 'col-health-tech',
    name: 'كلية التقنيات الصحية والطبية',
    departments: [
      { id: 'dept-pathology', collegeId: 'col-health-tech', name: 'قسم تقنيات التحليلات المرضية', stagesCount: 4 },
      { id: 'dept-anesthesia', collegeId: 'col-health-tech', name: 'قسم تقنيات التخدير والعناية المركزة', stagesCount: 4 },
    ],
  },
];

export const initialSections: Section[] = [
  { id: 'sec-surg-1a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 1 },
  { id: 'sec-surg-1b', name: 'شعبة (ب)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 1 },
  { id: 'sec-surg-2a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 2 },
  { id: 'sec-card-1a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-cardio', stage: 1 },
  { id: 'sec-card-2a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-cardio', stage: 2 },
  { id: 'sec-pharm-1a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-pharmaceutics', stage: 1 },
  { id: 'sec-pharm-2a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-pharmaceutics', stage: 2 },
  { id: 'sec-chem-1a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-medchem', stage: 1 },
  { id: 'sec-chem-2a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-medchem', stage: 2 },
];

export const initialUsers: User[] = [
  {
    id: 'user-super-admin',
    name: 'د. عقيل الزهراوي',
    email: 'admin@alzahrawi.edu.iq',
    role: 'super_admin',
    title: 'المشرف العام على المنظومة',
  },
  {
    id: 'user-dean-med',
    name: 'أ.د. علي الشمري',
    email: 'dean.med@alzahrawi.edu.iq',
    role: 'college_admin',
    title: 'عميد كلية الطب البشري',
    collegeId: 'col-medicine',
  },
  {
    id: 'user-dean-pharm',
    name: 'أ.د. فاطمة القزويني',
    email: 'dean.pharm@alzahrawi.edu.iq',
    role: 'college_admin',
    title: 'عميدة كلية الصيدلة',
    collegeId: 'col-pharmacy',
  },
  {
    id: 'user-head-surgery',
    name: 'د. وسام الربيعي',
    email: 'head.surgery@alzahrawi.edu.iq',
    role: 'department_admin',
    title: 'رئيس قسم الجراحة العامة',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
  },
  {
    id: 'doc-1',
    name: 'أ.د. حيدر كاظم',
    email: 'haider.k@alzahrawi.edu.iq',
    role: 'doctor',
    title: 'أستاذ الجراحة والتشريح',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
  },
  {
    id: 'doc-2',
    name: 'د. سارة التميمي',
    email: 'sara.t@alzahrawi.edu.iq',
    role: 'doctor',
    title: 'مدرس فسيولوجيا الجراحة',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
  },
  {
    id: 'stu-1',
    name: 'أحمد ليث البدري',
    email: 'ahmed.badri@student.alzahrawi.edu.iq',
    role: 'student',
    title: 'طالب طب بشري',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 1,
    sectionId: 'sec-surg-1a',
    sectionName: 'شعبة (أ)',
  },
];

export const initialSubjects: Subject[] = [
  {
    id: 'sub-anatomy',
    name: 'علم التشريح السريري',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 1,
    semester: 1,
    doctorId: 'doc-1',
    doctorName: 'أ.د. حيدر كاظم',
  },
  {
    id: 'sub-physio',
    name: 'فسيولوجيا الجراحة العامة',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 2,
    semester: 1,
    doctorId: 'doc-2',
    doctorName: 'د. سارة التميمي',
  },
];

export const initialLectures: Lecture[] = [
  {
    id: 'lec-1',
    title: 'المحاضرة التمهيدية في التشريح البشري السريري',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 1,
    sectionTarget: 'all',
    subjectId: 'sub-anatomy',
    subjectName: 'علم التشريح السريري',
    doctorId: 'doc-1',
    doctorName: 'أ.د. حيدر كاظم',
    uploadDate: '2026-10-20',
    fileType: 'pdf',
    fileSize: '4.2 MB',
    fileName: 'anatomy_lecture_01.pdf',
    description: 'مقدمة في المحاور التشريحية والمصطلحات التوجيهية للطب البشري',
    downloadsCount: 142,
    viewsCount: 389,
  },
  {
    id: 'lec-2',
    title: 'فسيولوجيا التئام الجروح والاستجابة الخلوية',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 2,
    sectionTarget: 'all',
    subjectId: 'sub-physio',
    subjectName: 'فسيولوجيا الجراحة العامة',
    doctorId: 'doc-2',
    doctorName: 'د. سارة التميمي',
    uploadDate: '2026-10-19',
    fileType: 'pdf',
    fileSize: '6.8 MB',
    fileName: 'surgical_physio_02.pdf',
    description: 'شرح تفصيلي لآليات الالتئام ومراحل الاستجابة النسيجية الحيوية',
    downloadsCount: 98,
    viewsCount: 245,
  },
];
