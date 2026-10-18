import {
  College,
  Department,
  Section,
  Subject,
  Lecture,
  User,
} from '@/types';

const STORAGE_KEYS = {
  COLLEGES: 'alzahrawi_colleges_v5',
  SECTIONS: 'alzahrawi_sections_v5',
  SUBJECTS: 'alzahrawi_subjects_v5',
  LECTURES: 'alzahrawi_lectures_v5',
  USERS: 'alzahrawi_users_v5',
  CURRENT_USER_ID: 'alzahrawi_current_user_v5',
};

// ===================== SEED DATA: 2 COLLEGES (EACH HAS 2 DEPARTMENTS) =====================
export const INITIAL_COLLEGES: College[] = [
  {
    id: 'col-medicine',
    name: 'كلية الطب البشري',
    departments: [
      {
        id: 'dept-surgery',
        collegeId: 'col-medicine',
        name: 'قسم الجراحة العامة',
        stagesCount: 4,
      },
      {
        id: 'dept-cardio',
        collegeId: 'col-medicine',
        name: 'قسم الباطنية والقلبية',
        stagesCount: 4,
      },
    ],
  },
  {
    id: 'col-pharmacy',
    name: 'كلية الصيدلة',
    departments: [
      {
        id: 'dept-pharmaceutics',
        collegeId: 'col-pharmacy',
        name: 'قسم الصيدلانيات والسموم',
        stagesCount: 4,
      },
      {
        id: 'dept-medchem',
        collegeId: 'col-pharmacy',
        name: 'قسم الكيمياء الصيدلانية',
        stagesCount: 4,
      },
    ],
  },
];

// ===================== SEED DATA: SECTIONS =====================
export const INITIAL_SECTIONS: Section[] = [
  // Medicine - Surgery
  { id: 'sec-surg-1a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 1 },
  { id: 'sec-surg-1b', name: 'شعبة (ب)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 1 },
  { id: 'sec-surg-2a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 2 },

  // Medicine - Cardio
  { id: 'sec-card-1a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-cardio', stage: 1 },
  { id: 'sec-card-2a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-cardio', stage: 2 },

  // Pharmacy - Pharmaceutics
  { id: 'sec-pharm-1a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-pharmaceutics', stage: 1 },
  { id: 'sec-pharm-2a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-pharmaceutics', stage: 2 },

  // Pharmacy - MedChem
  { id: 'sec-chem-1a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-medchem', stage: 1 },
  { id: 'sec-chem-2a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-medchem', stage: 2 },
];

// ===================== SEED DATA: SUBJECTS (LINKED TO TEACHERS) =====================
export const INITIAL_SUBJECTS: Subject[] = [
  // Medicine - Surgery
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

  // Medicine - Cardio
  {
    id: 'sub-internal-med',
    name: 'مبادئ الطب الباطني',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
    stage: 1,
    semester: 1,
    doctorId: 'doc-3',
    doctorName: 'أ.د. محمد الزبيدي',
  },
  {
    id: 'sub-cardio',
    name: 'أمراض القلب والأوعية',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
    stage: 2,
    semester: 1,
    doctorId: 'doc-4',
    doctorName: 'د. نور الهدى الكعبي',
  },

  // Pharmacy - Pharmaceutics
  {
    id: 'sub-phys-pharm',
    name: 'الصيدلة الفيزيائية',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
    stage: 1,
    semester: 1,
    doctorId: 'doc-5',
    doctorName: 'أ.د. عباس الجبوري',
  },
  {
    id: 'sub-toxico',
    name: 'علم السموم والمواد الطبية',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
    stage: 2,
    semester: 1,
    doctorId: 'doc-6',
    doctorName: 'د. مريم الصالح',
  },

  // Pharmacy - MedChem
  {
    id: 'sub-org-chem',
    name: 'الكيمياء العضوية الصيدلانية',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
    stage: 1,
    semester: 1,
    doctorId: 'doc-7',
    doctorName: 'د. عمر عبد الخالق',
  },
  {
    id: 'sub-analysis',
    name: 'التحليل الآلي الصيدلاني',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
    stage: 2,
    semester: 1,
    doctorId: 'doc-8',
    doctorName: 'د. زينب الموسوي',
  },
];

// ===================== SEED DATA: USERS (SUPER ADMIN, 2 DEANS, 4 HEADS, 8 DOCTORS, 10 STUDENTS) =====================
export const INITIAL_USERS: User[] = [
  // 1. Super Admin
  {
    id: 'user-super-admin',
    name: 'د. عقيل الزهراوي',
    email: 'admin@alzahrawi.edu.iq',
    role: 'super_admin',
    title: 'المشرف العام على المنظومة',
  },

  // 2. Deans (2)
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

  // 3. Department Admins (4)
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
    id: 'user-head-cardio',
    name: 'د. رشا الحسني',
    email: 'head.cardio@alzahrawi.edu.iq',
    role: 'department_admin',
    title: 'رئيسة قسم الباطنية والقلبية',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
  },
  {
    id: 'user-head-pharm',
    name: 'د. قاسم السعدي',
    email: 'head.pharm@alzahrawi.edu.iq',
    role: 'department_admin',
    title: 'رئيس قسم الصيدلانيات والسموم',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
  },
  {
    id: 'user-head-medchem',
    name: 'د. إيناس العبيدي',
    email: 'head.medchem@alzahrawi.edu.iq',
    role: 'department_admin',
    title: 'رئيسة قسم الكيمياء الصيدلانية',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
  },

  // 4. Doctors (8: 2 per department)
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
    id: 'doc-3',
    name: 'أ.د. محمد الزبيدي',
    email: 'mohammed.z@alzahrawi.edu.iq',
    role: 'doctor',
    title: 'أستاذ الطب الباطني',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
  },
  {
    id: 'doc-4',
    name: 'د. نور الهدى الكعبي',
    email: 'noor.k@alzahrawi.edu.iq',
    role: 'doctor',
    title: 'استشارية أمراض القلب والأوعية',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
  },
  {
    id: 'doc-5',
    name: 'أ.د. عباس الجبوري',
    email: 'abbas.j@alzahrawi.edu.iq',
    role: 'doctor',
    title: 'أستاذ الصيدلة الفيزيائية',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
  },
  {
    id: 'doc-6',
    name: 'د. مريم الصالح',
    email: 'maryam.s@alzahrawi.edu.iq',
    role: 'doctor',
    title: 'مدرس علم السموم والمواد الطبية',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
  },
  {
    id: 'doc-7',
    name: 'د. عمر عبد الخالق',
    email: 'omar.a@alzahrawi.edu.iq',
    role: 'doctor',
    title: 'أستاذ الكيمياء العضوية الصيدلانية',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
  },
  {
    id: 'doc-8',
    name: 'د. زينب الموسوي',
    email: 'zainab.m@alzahrawi.edu.iq',
    role: 'doctor',
    title: 'مدرس التحليل الآلي الصيدلاني',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
  },

  // 5. Students (10: distributed across colleges, departments, stages and sections)
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
  {
    id: 'stu-2',
    name: 'زينب حيدر الشمري',
    email: 'zainab.h@student.alzahrawi.edu.iq',
    role: 'student',
    title: 'طالبة طب بشري',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 1,
    sectionId: 'sec-surg-1b',
    sectionName: 'شعبة (ب)',
  },
  {
    id: 'stu-3',
    name: 'كرار حسين الجياشي',
    email: 'karrar.h@student.alzahrawi.edu.iq',
    role: 'student',
    title: 'طالب طب بشري',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 2,
    sectionId: 'sec-surg-2a',
    sectionName: 'شعبة (أ)',
  },
  {
    id: 'stu-4',
    name: 'مريم عمار الخفاجي',
    email: 'maryam.k@student.alzahrawi.edu.iq',
    role: 'student',
    title: 'طالبة طب بشري',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
    stage: 1,
    sectionId: 'sec-card-1a',
    sectionName: 'شعبة (أ)',
  },
  {
    id: 'stu-5',
    name: 'مصطفى طه الدليمي',
    email: 'mustafa.t@student.alzahrawi.edu.iq',
    role: 'student',
    title: 'طالب طب بشري',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
    stage: 2,
    sectionId: 'sec-card-2a',
    sectionName: 'شعبة (أ)',
  },
  {
    id: 'stu-6',
    name: 'هدى سلام التميمي',
    email: 'huda.s@student.alzahrawi.edu.iq',
    role: 'student',
    title: 'طالبة صيدلة',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
    stage: 1,
    sectionId: 'sec-pharm-1a',
    sectionName: 'شعبة (أ)',
  },
  {
    id: 'stu-7',
    name: 'سجاد باقر الربيعي',
    email: 'sajjad.b@student.alzahrawi.edu.iq',
    role: 'student',
    title: 'طالب صيدلة',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
    stage: 2,
    sectionId: 'sec-pharm-2a',
    sectionName: 'شعبة (أ)',
  },
  {
    id: 'stu-8',
    name: 'فاطمة رسول السعدي',
    email: 'fatima.r@student.alzahrawi.edu.iq',
    role: 'student',
    title: 'طالبة صيدلة',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
    stage: 1,
    sectionId: 'sec-chem-1a',
    sectionName: 'شعبة (أ)',
  },
  {
    id: 'stu-9',
    name: 'يوسف عادل المعموري',
    email: 'youssef.a@student.alzahrawi.edu.iq',
    role: 'student',
    title: 'طالب صيدلة',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
    stage: 2,
    sectionId: 'sec-chem-2a',
    sectionName: 'شعبة (أ)',
  },
  {
    id: 'stu-10',
    name: 'زهراء مهدي الحسيني',
    email: 'zahra.m@student.alzahrawi.edu.iq',
    role: 'student',
    title: 'طالبة صيدلة',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
    stage: 1,
    sectionId: 'sec-pharm-1a',
    sectionName: 'شعبة (أ)',
  },
];

// ===================== SEED DATA: 16 LECTURES (EACH DOCTOR HAS 2 LECTURES) =====================
export const INITIAL_LECTURES: Lecture[] = [
  // Doctor 1: أ.د. حيدر كاظم (2 Lectures)
  {
    id: 'lec-1',
    title: 'المحاضرة 1: تشريح الأطراف العليا السريري',
    description: 'دراسة تشريحية مفصلة لعظام وعضلات وشرايين الأطراف العليا مع التطبيقات السريرية.',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 1,
    subjectId: 'sub-anatomy',
    subjectName: 'علم التشريح السريري',
    sectionTarget: 'all',
    sectionName: 'كافة الشُعب',
    doctorId: 'doc-1',
    doctorName: 'أ.د. حيدر كاظم',
    fileType: 'pdf',
    fileName: 'Upper_Limb_Anatomy_Lecture1.pdf',
    fileSize: '4.2 MB',
    uploadDate: '2026-10-10',
    viewsCount: 48,
    downloadsCount: 32,
  },
  {
    id: 'lec-2',
    title: 'المحاضرة 2: تشريح القفص الصدري والأحشاء',
    description: 'تشريح جدار الصدر والمنصف والرئتين والقلب مع الحالات الجراحية الشائعة.',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 1,
    subjectId: 'sub-anatomy',
    subjectName: 'علم التشريح السريري',
    sectionTarget: 'sec-surg-1a',
    sectionName: 'شعبة (أ)',
    doctorId: 'doc-1',
    doctorName: 'أ.د. حيدر كاظم',
    fileType: 'pdf',
    fileName: 'Thoracic_Cavity_Anatomy_Lecture2.pdf',
    fileSize: '5.1 MB',
    uploadDate: '2026-10-12',
    viewsCount: 36,
    downloadsCount: 24,
  },

  // Doctor 2: د. سارة التميمي (2 Lectures)
  {
    id: 'lec-3',
    title: 'المحاضرة 1: فسيولوجيا التئام الجروح الجراحية',
    description: 'المراحل الخلوية والكيميائية الحيوية لالتئام الأنسجة والعوامل المؤثرة على الشفاء الجراحي.',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 2,
    subjectId: 'sub-physio',
    subjectName: 'فسيولوجيا الجراحة العامة',
    sectionTarget: 'all',
    sectionName: 'كافة الشُعب',
    doctorId: 'doc-2',
    doctorName: 'د. سارة التميمي',
    fileType: 'pdf',
    fileName: 'Wound_Healing_Physiology_Lecture1.pdf',
    fileSize: '3.8 MB',
    uploadDate: '2026-10-11',
    viewsCount: 29,
    downloadsCount: 19,
  },
  {
    id: 'lec-4',
    title: 'المحاضرة 2: التوازن الحمضي القاعدي بعد العمليات',
    description: 'الاضطرابات الأيضية والتنفسية وحساب الفجوة الأيونية للمرضى الخاضعين لعمليات كبرى.',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 2,
    subjectId: 'sub-physio',
    subjectName: 'فسيولوجيا الجراحة العامة',
    sectionTarget: 'sec-surg-2a',
    sectionName: 'شعبة (أ)',
    doctorId: 'doc-2',
    doctorName: 'د. سارة التميمي',
    fileType: 'pdf',
    fileName: 'Acid_Base_Postop_Lecture2.pdf',
    fileSize: '3.2 MB',
    uploadDate: '2026-10-14',
    viewsCount: 22,
    downloadsCount: 15,
  },

  // Doctor 3: أ.د. محمد الزبيدي (2 Lectures)
  {
    id: 'lec-5',
    title: 'المحاضرة 1: مدخل إلى الفحص السريري العام',
    description: 'أصول أخذ التاريخ المرضي الشامل وتقنيات المعاينة والجس والقرع والتسمع.',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
    stage: 1,
    subjectId: 'sub-internal-med',
    subjectName: 'مبادئ الطب الباطني',
    sectionTarget: 'all',
    sectionName: 'كافة الشُعب',
    doctorId: 'doc-3',
    doctorName: 'أ.د. محمد الزبيدي',
    fileType: 'pdf',
    fileName: 'Clinical_Examination_Basics_Lec1.pdf',
    fileSize: '4.6 MB',
    uploadDate: '2026-10-09',
    viewsCount: 52,
    downloadsCount: 40,
  },
  {
    id: 'lec-6',
    title: 'المحاضرة 2: تشخيص المتلازمات الباطنية الحادة',
    description: 'المقاربة التشخيصية لألم البطن الحاد والحمى مجهولة السبب واضطرابات الوعي.',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
    stage: 1,
    subjectId: 'sub-internal-med',
    subjectName: 'مبادئ الطب الباطني',
    sectionTarget: 'sec-card-1a',
    sectionName: 'شعبة (أ)',
    doctorId: 'doc-3',
    doctorName: 'أ.د. محمد الزبيدي',
    fileType: 'pdf',
    fileName: 'Acute_Syndromes_InternalMed_Lec2.pdf',
    fileSize: '3.9 MB',
    uploadDate: '2026-10-13',
    viewsCount: 31,
    downloadsCount: 21,
  },

  // Doctor 4: د. نور الهدى الكعبي (2 Lectures)
  {
    id: 'lec-7',
    title: 'المحاضرة 1: تخطيط القلب الكهربائي ECG للمبتدئين',
    description: 'قراءة الموجات والفترات الزمنية ومحور القلب وتشخيص نظم الجيبي الطبيعي واضطرابات النظم.',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
    stage: 2,
    subjectId: 'sub-cardio',
    subjectName: 'أمراض القلب والأوعية',
    sectionTarget: 'all',
    sectionName: 'كافة الشُعب',
    doctorId: 'doc-4',
    doctorName: 'د. نور الهدى الكعبي',
    fileType: 'pdf',
    fileName: 'ECG_Interpretation_Guide_Lec1.pdf',
    fileSize: '6.4 MB',
    uploadDate: '2026-10-08',
    viewsCount: 65,
    downloadsCount: 54,
  },
  {
    id: 'lec-8',
    title: 'المحاضرة 2: تدبير احتشاء عضلة القلب الحاد',
    description: 'بروتوكولات الطوارئ لمرضى STEMI و NSTEMI واستراتيجيات إعادة التروية الدوائية والقسطارية.',
    collegeId: 'col-medicine',
    departmentId: 'dept-cardio',
    stage: 2,
    subjectId: 'sub-cardio',
    subjectName: 'أمراض القلب والأوعية',
    sectionTarget: 'sec-card-2a',
    sectionName: 'شعبة (أ)',
    doctorId: 'doc-4',
    doctorName: 'د. نور الهدى الكعبي',
    fileType: 'pdf',
    fileName: 'Acute_Myocardial_Infarction_Lec2.pdf',
    fileSize: '4.8 MB',
    uploadDate: '2026-10-12',
    viewsCount: 44,
    downloadsCount: 35,
  },

  // Doctor 5: أ.د. عباس الجبوري (2 Lectures)
  {
    id: 'lec-9',
    title: 'المحاضرة 1: حركية الدواء والذوبانية الفيزيائية',
    description: 'ديناميكية انتشار المركبات الدوائية، معامل التوزيع، وثوابت الذوبانية في الوسط المائي.',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
    stage: 1,
    subjectId: 'sub-phys-pharm',
    subjectName: 'الصيدلة الفيزيائية',
    sectionTarget: 'all',
    sectionName: 'كافة الشُعب',
    doctorId: 'doc-5',
    doctorName: 'أ.د. عباس الجبوري',
    fileType: 'pdf',
    fileName: 'Physical_Pharmacy_Solubility_Lec1.pdf',
    fileSize: '3.7 MB',
    uploadDate: '2026-10-07',
    viewsCount: 38,
    downloadsCount: 26,
  },
  {
    id: 'lec-10',
    title: 'المحاضرة 2: استقرارية المعلقات والمستحلبات الدوائية',
    description: 'قوى التشتت وظاهرة التندف، استقرار الأطوار الغروية وطرق قياس شحنة زيتا للمستحلبات.',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
    stage: 1,
    subjectId: 'sub-phys-pharm',
    subjectName: 'الصيدلة الفيزيائية',
    sectionTarget: 'sec-pharm-1a',
    sectionName: 'شعبة (أ)',
    doctorId: 'doc-5',
    doctorName: 'أ.د. عباس الجبوري',
    fileType: 'pdf',
    fileName: 'Emulsions_Suspensions_Stability_Lec2.pdf',
    fileSize: '4.1 MB',
    uploadDate: '2026-10-11',
    viewsCount: 27,
    downloadsCount: 18,
  },

  // Doctor 6: د. مريم الصالح (2 Lectures)
  {
    id: 'lec-11',
    title: 'المحاضرة 1: آليات التسمم الدوائي والعلاج الترياقي',
    description: 'دراسة المسارات الحركية للجرعات الزائدة من الباراسيتامول والأسبرين والترياقات النوعية.',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
    stage: 2,
    subjectId: 'sub-toxico',
    subjectName: 'علم السموم والمواد الطبية',
    sectionTarget: 'all',
    sectionName: 'كافة الشُعب',
    doctorId: 'doc-6',
    doctorName: 'د. مريم الصالح',
    fileType: 'pdf',
    fileName: 'Drug_Toxicity_Antidotes_Lec1.pdf',
    fileSize: '3.5 MB',
    uploadDate: '2026-10-09',
    viewsCount: 33,
    downloadsCount: 22,
  },
  {
    id: 'lec-12',
    title: 'المحاضرة 2: التسمم بالمعادن الثقيلة وطرق الكشف',
    description: 'تسمم الرصاص والزرنيخ والزئبق، آليات الارتباط الخلوي ومواد الاستخلاب الطبية (Chelators).',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-pharmaceutics',
    stage: 2,
    subjectId: 'sub-toxico',
    subjectName: 'علم السموم والمواد الطبية',
    sectionTarget: 'sec-pharm-2a',
    sectionName: 'شعبة (أ)',
    doctorId: 'doc-6',
    doctorName: 'د. مريم الصالح',
    fileType: 'pdf',
    fileName: 'Heavy_Metals_Toxicology_Lec2.pdf',
    fileSize: '4.0 MB',
    uploadDate: '2026-10-13',
    viewsCount: 25,
    downloadsCount: 16,
  },

  // Doctor 7: د. عمر عبد الخالق (2 Lectures)
  {
    id: 'lec-13',
    title: 'المحاضرة 1: كيمياء المركبات الحلقية غير المتجانسة',
    description: 'تخليق وتفاعلات حلقات البيريدين والفيوران والثيوفين وأهميتها الدوائية في تصميم العقاقير.',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
    stage: 1,
    subjectId: 'sub-org-chem',
    subjectName: 'الكيمياء العضوية الصيدلانية',
    sectionTarget: 'all',
    sectionName: 'كافة الشُعب',
    doctorId: 'doc-7',
    doctorName: 'د. عمر عبد الخالق',
    fileType: 'pdf',
    fileName: 'Heterocyclic_Chemistry_Pharm_Lec1.pdf',
    fileSize: '5.2 MB',
    uploadDate: '2026-10-10',
    viewsCount: 42,
    downloadsCount: 30,
  },
  {
    id: 'lec-14',
    title: 'المحاضرة 2: تفاعلات التخليق للمجموعات الفعالة',
    description: 'تفاعلات الاستبدال النيكليوفيلي والإلكتروفيلي وتكوين الروابط الكربونية-الكربونية في المضادات.',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
    stage: 1,
    subjectId: 'sub-org-chem',
    subjectName: 'الكيمياء العضوية الصيدلانية',
    sectionTarget: 'sec-chem-1a',
    sectionName: 'شعبة (أ)',
    doctorId: 'doc-7',
    doctorName: 'د. عمر عبد الخالق',
    fileType: 'pdf',
    fileName: 'Organic_Synthesis_Mechanisms_Lec2.pdf',
    fileSize: '4.7 MB',
    uploadDate: '2026-10-14',
    viewsCount: 28,
    downloadsCount: 19,
  },

  // Doctor 8: د. زينب الموسوي (2 Lectures)
  {
    id: 'lec-15',
    title: 'المحاضرة 1: مطيافية الأشعة تحت الحمراء FTIR في تحليل الأدوية',
    description: 'المبادئ الأساسية لمطيافية FTIR وتحديد المجموعات الوظيفية للمواد الدوائية الفعالة.',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
    stage: 2,
    subjectId: 'sub-analysis',
    subjectName: 'التحليل الآلي الصيدلاني',
    sectionTarget: 'all',
    sectionName: 'كافة الشُعب',
    doctorId: 'doc-8',
    doctorName: 'د. زينب الموسوي',
    fileType: 'pdf',
    fileName: 'FTIR_Spectroscopy_Pharmaceuticals_Lec1.pdf',
    fileSize: '5.8 MB',
    uploadDate: '2026-10-09',
    viewsCount: 39,
    downloadsCount: 27,
  },
  {
    id: 'lec-16',
    title: 'المحاضرة 2: كروماتوغرافيا السائل عالي الكفاءة HPLC',
    description: 'نظرية الفصل اللوني، الأعمدة والطور المتحرك، وتطبيقات المعايرة الكمية للأقراص والكبسولات.',
    collegeId: 'col-pharmacy',
    departmentId: 'dept-medchem',
    stage: 2,
    subjectId: 'sub-analysis',
    subjectName: 'التحليل الآلي الصيدلاني',
    sectionTarget: 'sec-chem-2a',
    sectionName: 'شعبة (أ)',
    doctorId: 'doc-8',
    doctorName: 'د. زينب الموسوي',
    fileType: 'pdf',
    fileName: 'HPLC_Method_Validation_Lec2.pdf',
    fileSize: '6.1 MB',
    uploadDate: '2026-10-13',
    viewsCount: 46,
    downloadsCount: 34,
  },
];

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {}
}

export const StorageService = {
  // ===================== COLLEGES CRUD =====================
  getColleges(): College[] {
    return safeGetItem<College[]>(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
  },

  addCollege(data: { name: string }): College {
    const list = this.getColleges();
    const newCol: College = {
      id: `col-${Date.now()}`,
      name: data.name.trim(),
      departments: [],
    };
    safeSetItem(STORAGE_KEYS.COLLEGES, [...list, newCol]);
    return newCol;
  },

  updateCollege(id: string, updates: Partial<College>): void {
    const list = this.getColleges();
    const updated = list.map((c) => (c.id === id ? { ...c, ...updates } : c));
    safeSetItem(STORAGE_KEYS.COLLEGES, updated);
  },

  deleteCollege(id: string): void {
    const list = this.getColleges();
    safeSetItem(STORAGE_KEYS.COLLEGES, list.filter((c) => c.id !== id));

    // Cascade delete: remove departments, sections, subjects, lectures of this college
    const sections = this.getSections().filter((s) => s.collegeId !== id);
    safeSetItem(STORAGE_KEYS.SECTIONS, sections);

    const subjects = this.getSubjects().filter((s) => s.collegeId !== id);
    safeSetItem(STORAGE_KEYS.SUBJECTS, subjects);

    const lectures = this.getLectures().filter((l) => l.collegeId !== id);
    safeSetItem(STORAGE_KEYS.LECTURES, lectures);
  },

  // ===================== DEPARTMENTS CRUD =====================
  addDepartment(collegeId: string, data: { name: string; stagesCount: number }): Department | null {
    const colleges = this.getColleges();
    const colIndex = colleges.findIndex((c) => c.id === collegeId);
    if (colIndex === -1) return null;

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      collegeId,
      name: data.name.trim(),
      stagesCount: data.stagesCount || 4,
    };

    colleges[colIndex].departments = [...(colleges[colIndex].departments || []), newDept];
    safeSetItem(STORAGE_KEYS.COLLEGES, colleges);
    return newDept;
  },

  updateDepartment(collegeId: string, deptId: string, updates: Partial<Department>): void {
    const colleges = this.getColleges();
    const colIndex = colleges.findIndex((c) => c.id === collegeId);
    if (colIndex === -1) return;

    colleges[colIndex].departments = (colleges[colIndex].departments || []).map((d) =>
      d.id === deptId ? { ...d, ...updates } : d
    );
    safeSetItem(STORAGE_KEYS.COLLEGES, colleges);
  },

  deleteDepartment(collegeId: string, deptId: string): void {
    const colleges = this.getColleges();
    const colIndex = colleges.findIndex((c) => c.id === collegeId);
    if (colIndex === -1) return;

    colleges[colIndex].departments = (colleges[colIndex].departments || []).filter((d) => d.id !== deptId);
    safeSetItem(STORAGE_KEYS.COLLEGES, colleges);

    // Cascade delete sections, subjects, lectures of this dept
    const sections = this.getSections().filter((s) => s.departmentId !== deptId);
    safeSetItem(STORAGE_KEYS.SECTIONS, sections);

    const subjects = this.getSubjects().filter((s) => s.departmentId !== deptId);
    safeSetItem(STORAGE_KEYS.SUBJECTS, subjects);

    const lectures = this.getLectures().filter((l) => l.departmentId !== deptId);
    safeSetItem(STORAGE_KEYS.LECTURES, lectures);
  },

  // ===================== SECTIONS CRUD =====================
  getSections(): Section[] {
    return safeGetItem<Section[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
  },

  addSection(data: { name: string; collegeId: string; departmentId: string; stage: number }): Section {
    const list = this.getSections();
    const newSec: Section = {
      id: `sec-${Date.now()}`,
      name: data.name.trim(),
      collegeId: data.collegeId,
      departmentId: data.departmentId,
      stage: data.stage,
    };
    safeSetItem(STORAGE_KEYS.SECTIONS, [...list, newSec]);
    return newSec;
  },

  updateSection(id: string, updates: Partial<Section>): void {
    const list = this.getSections();
    safeSetItem(STORAGE_KEYS.SECTIONS, list.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  },

  deleteSection(id: string): void {
    const list = this.getSections();
    safeSetItem(STORAGE_KEYS.SECTIONS, list.filter((s) => s.id !== id));
  },

  // ===================== SUBJECTS CRUD =====================
  getSubjects(): Subject[] {
    return safeGetItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },

  addSubject(data: Omit<Subject, 'id'>): Subject {
    const list = this.getSubjects();
    const newSub: Subject = {
      ...data,
      id: `sub-${Date.now()}`,
      name: data.name.trim(),
    };
    safeSetItem(STORAGE_KEYS.SUBJECTS, [...list, newSub]);
    return newSub;
  },

  updateSubject(id: string, updates: Partial<Subject>): void {
    const list = this.getSubjects();
    safeSetItem(STORAGE_KEYS.SUBJECTS, list.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  },

  deleteSubject(id: string): void {
    const list = this.getSubjects();
    safeSetItem(STORAGE_KEYS.SUBJECTS, list.filter((s) => s.id !== id));
  },

  // ===================== USERS CRUD =====================
  getUsers(): User[] {
    return safeGetItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  addUser(data: Omit<User, 'id'>): User {
    const list = this.getUsers();
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
    };
    safeSetItem(STORAGE_KEYS.USERS, [...list, newUser]);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): void {
    const list = this.getUsers();
    safeSetItem(STORAGE_KEYS.USERS, list.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  },

  deleteUser(id: string): void {
    const list = this.getUsers();
    safeSetItem(STORAGE_KEYS.USERS, list.filter((u) => u.id !== id));
  },

  getCurrentUserId(): string {
    return safeGetItem<string>(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id);
  },

  setCurrentUserId(id: string): void {
    safeSetItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  // ===================== LECTURES CRUD =====================
  getLectures(): Lecture[] {
    return safeGetItem<Lecture[]>(STORAGE_KEYS.LECTURES, INITIAL_LECTURES);
  },

  addLecture(data: Omit<Lecture, 'id' | 'uploadDate' | 'downloadsCount' | 'viewsCount'>): Lecture {
    const list = this.getLectures();
    const newLec: Lecture = {
      ...data,
      id: `lec-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      downloadsCount: 0,
      viewsCount: 1,
    };
    safeSetItem(STORAGE_KEYS.LECTURES, [newLec, ...list]);
    return newLec;
  },

  updateLecture(id: string, updates: Partial<Lecture>): void {
    const list = this.getLectures();
    safeSetItem(STORAGE_KEYS.LECTURES, list.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  },

  deleteLecture(id: string): void {
    const list = this.getLectures();
    safeSetItem(STORAGE_KEYS.LECTURES, list.filter((l) => l.id !== id));
  },

  // Reset Everything to the fresh structured seed state
  resetAll(): void {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('alzahrawi_')) {
        localStorage.removeItem(k);
      }
    });
    safeSetItem(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
    safeSetItem(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    safeSetItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    safeSetItem(STORAGE_KEYS.LECTURES, INITIAL_LECTURES);
    safeSetItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    safeSetItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id);
    window.location.reload();
  },
};
