// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file centralIntegrationData.ts
 * @description البيانات الافتراضية وهياكل حقول التكامل مع نظام الهيكلية المركزي
 * @created 2026-10-25
 */
import { CentralField, IntegrationSettings, Facility } from '@/types';

export const CENTRAL_FIELDS_COLLEGES: CentralField[] = [
  { key: 'id', label: 'المعرف الفريد (ID)', required: true },
  { key: 'name', label: 'اسم الكلية', required: true },
  { key: 'code', label: 'رمز الكلية (Code)' },
  { key: 'dean_name', label: 'اسم عميد الكلية' },
  { key: 'departments_count', label: 'عدد الأقسام' },
  { key: 'building_name', label: 'المبنى والموقع' },
];

export const CENTRAL_FIELDS_DEPARTMENTS: CentralField[] = [
  { key: 'id', label: 'معرف القسم (ID)', required: true },
  { key: 'college_id', label: 'معرف الكلية التابع لها', required: true },
  { key: 'name', label: 'اسم القسم العلمي', required: true },
  { key: 'code', label: 'رمز القسم (Code)' },
  { key: 'stages_count', label: 'عدد المراحل الدراسية' },
  { key: 'head_name', label: 'اسم رئيس القسم' },
];

export const CENTRAL_FIELDS_FACULTY: CentralField[] = [
  { key: 'id', label: 'الرقم الوظيفي / المعرف', required: true },
  { key: 'name', label: 'الاسم الكامل للتدريسي/الموظف', required: true },
  { key: 'email', label: 'البريد الإلكتروني الجامعي', required: true },
  { key: 'role', label: 'الدور (تدريسي / إداري / رئيس قسم)', required: true },
  { key: 'title', label: 'اللقب العلمي / المسمى الوظيفي' },
  { key: 'college_id', label: 'الكلية' },
  { key: 'department_id', label: 'القسم التابع له' },
  { key: 'academic_degree', label: 'الدرجة الأكاديمية' },
];

export const CENTRAL_FIELDS_FACILITIES: CentralField[] = [
  { key: 'id', label: 'معرف القاعة أو المختبر', required: true },
  { key: 'name', label: 'اسم القاعة أو المختبر', required: true },
  { key: 'code', label: 'رمز القاعة / المختبر' },
  { key: 'type', label: 'النوع (قاعة مدرجة / مختبر سريري)', required: true },
  { key: 'capacity', label: 'السعة الاستيعابية (الطلبة)' },
  { key: 'building', label: 'المبنى / الجناح' },
  { key: 'college_id', label: 'الكلية' },
  { key: 'department_id', label: 'القسم' },
];

export const defaultIntegrationSettings: IntegrationSettings = {
  isEnabled: false,
  apiUrl: 'https://hierarchy-central.alzahrawi.edu.iq/api/v1',
  apiKey: 'zh_sec_live_98a72b4c10ef9a3',
  webhookUrl: 'https://alzahrawi-supabase.supabase.co/functions/v1/sync_central_hierarchy',
  webhookSecret: 'whsec_alzahrawi_central_2026',
  syncIntervalMinutes: 30,
  lastSyncStatus: 'idle',
  mappings: {
    colleges: {
      tableKey: 'colleges',
      tableName: 'الكليات',
      sourceTable: 'central_colleges',
      selectedFields: ['id', 'name', 'code', 'dean_name'],
      syncedCount: 0,
    },
    departments: {
      tableKey: 'departments',
      tableName: 'الأقسام العلمية',
      sourceTable: 'central_departments',
      selectedFields: ['id', 'college_id', 'name', 'code', 'stages_count', 'head_name'],
      syncedCount: 0,
    },
    faculty: {
      tableKey: 'faculty',
      tableName: 'الكادر التدريسي والموظفون',
      sourceTable: 'central_faculty_staff',
      selectedFields: ['id', 'name', 'email', 'role', 'title', 'college_id', 'department_id'],
      syncedCount: 0,
    },
    facilities: {
      tableKey: 'facilities',
      tableName: 'المختبرات والقاعات الدراسية',
      sourceTable: 'central_facilities',
      selectedFields: ['id', 'name', 'code', 'type', 'capacity', 'building', 'college_id', 'department_id'],
      syncedCount: 0,
    },
  },
};

export const sampleCentralSyncPayload = {
  colleges: [
    { id: 'col-medicine', name: 'كلية الطب البشري', code: 'MED', dean_name: 'أ.د. علي الشمري', departments_count: 2 },
    { id: 'col-dentistry', name: 'كلية طب الأسنان', code: 'DENT', dean_name: 'أ.د. منذر الحسيني', departments_count: 2 },
    { id: 'col-pharmacy', name: 'كلية الصيدلة', code: 'PHARM', dean_name: 'أ.د. فاطمة القزويني', departments_count: 2 },
  ],
  departments: [
    { id: 'dept-surgery', college_id: 'col-medicine', name: 'قسم الجراحة العامة', code: 'SURG', stages_count: 4, head_name: 'د. وسام الربيعي' },
    { id: 'dept-cardio', college_id: 'col-medicine', name: 'قسم الباطنية والقلبية', code: 'CARD', stages_count: 4, head_name: 'د. رياض الطائي' },
    { id: 'dept-ortho', college_id: 'col-dentistry', name: 'قسم تقويم الأسنان وجراحة الفم', code: 'ORTHO', stages_count: 5, head_name: 'د. نادية الخفاجي' },
    { id: 'dept-pharmaceutics', college_id: 'col-pharmacy', name: 'قسم الصيدلانيات والسموم', code: 'PHARMC', stages_count: 5, head_name: 'د. سمير البغدادي' },
  ],
  faculty: [
    { id: 'user-super-admin', name: 'المشرف العام على المنظومة', email: 'admin@alzahrawi.edu.iq', role: 'super_admin', title: 'المشرف العام' },
    { id: 'user-dean-med', name: 'أ.د. علي الشمري', email: 'dean.med@alzahrawi.edu.iq', role: 'college_admin', title: 'عميد كلية الطب البشري', college_id: 'col-medicine' },
    { id: 'user-head-surgery', name: 'د. وسام الربيعي', email: 'head.surgery@alzahrawi.edu.iq', role: 'department_admin', title: 'رئيس قسم الجراحة العامة', college_id: 'col-medicine', department_id: 'dept-surgery' },
    { id: 'doc-1', name: 'أ.د. حيدر كاظم', email: 'haider.k@alzahrawi.edu.iq', role: 'doctor', title: 'أستاذ الجراحة والتشريح', college_id: 'col-medicine', department_id: 'dept-surgery' },
    { id: 'doc-2', name: 'د. سارة التميمي', email: 'sara.t@alzahrawi.edu.iq', role: 'doctor', title: 'مدرس فسيولوجيا الجراحة', college_id: 'col-medicine', department_id: 'dept-surgery' },
    { id: 'doc-3', name: 'د. عمار الموسوي', email: 'ammar.m@alzahrawi.edu.iq', role: 'doctor', title: 'مدرس أمراض القلب والباطنية', college_id: 'col-medicine', department_id: 'dept-cardio' },
  ],
  facilities: [
    { id: 'fac-hall-1', name: 'القاعة المركزية الكبرى (ابن سينا)', code: 'HALL-CENT-01', type: 'hall', capacity: 150, building: 'مجمع القاعات المركزية - الطابق 1', college_id: 'col-medicine', department_id: 'dept-surgery' },
    { id: 'fac-hall-2', name: 'مدرج التشريح التفاعلي (الزهراوي)', code: 'HALL-MED-02', type: 'hall', capacity: 90, building: 'بناية كلية الطب - الطابق 2', college_id: 'col-medicine', department_id: 'dept-surgery' },
    { id: 'fac-lab-1', name: 'مختبر التشريح السريري المتقدم', code: 'LAB-ANAT-01', type: 'lab', capacity: 35, building: 'المختبرات الطبية الحديثة', college_id: 'col-medicine', department_id: 'dept-surgery' },
    { id: 'fac-lab-2', name: 'مختبر الفسيولوجيا والمحاكاة', code: 'LAB-PHYS-02', type: 'lab', capacity: 30, building: 'المختبرات الطبية الحديثة', college_id: 'col-medicine', department_id: 'dept-surgery' },
    { id: 'fac-hall-3', name: 'قاعة المحاضرات العامة (الفارابي)', code: 'HALL-GEN-03', type: 'hall', capacity: 80, building: 'الجناح التعليمي - الطابق 3', college_id: 'col-medicine', department_id: 'dept-cardio' },
  ] as unknown as Facility[],
};
