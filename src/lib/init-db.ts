import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function ensureDatabaseInitialized() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'super_admin' },
    });

    if (existingAdmin) {
      return { initialized: false, message: 'Admin already exists' };
    }

    console.log('🌱 Starting automatic seed for initial setup...');

    const defaultPasswordHash = await bcrypt.hash('123456', 10);

    // 1. Create Colleges & Departments if they do not exist
    const med = await prisma.college.upsert({
      where: { id: 'col-medicine' },
      update: {},
      create: {
        id: 'col-medicine',
        name: 'كلية الطب البشري',
        departments: {
          create: [
            { id: 'dept-surgery', name: 'قسم الجراحة العامة', stagesCount: 4 },
            { id: 'dept-cardio', name: 'قسم الباطنية والقلبية', stagesCount: 4 },
          ],
        },
      },
    });

    const pharm = await prisma.college.upsert({
      where: { id: 'col-pharmacy' },
      update: {},
      create: {
        id: 'col-pharmacy',
        name: 'كلية الصيدلة',
        departments: {
          create: [
            { id: 'dept-pharmaceutics', name: 'قسم الصيدلانيات والسموم', stagesCount: 5 },
            { id: 'dept-medchem', name: 'قسم الكيمياء الصيدلانية', stagesCount: 5 },
          ],
        },
      },
    });

    // 2. Sections
    const defaultSections = [
      { id: 'sec-surg-1a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 1 },
      { id: 'sec-surg-1b', name: 'شعبة (ب)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 1 },
      { id: 'sec-surg-2a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 2 },
      { id: 'sec-card-1a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-cardio', stage: 1 },
      { id: 'sec-pharm-1a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-pharmaceutics', stage: 1 },
      { id: 'sec-chem-1a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-medchem', stage: 1 },
    ];

    for (const sec of defaultSections) {
      await prisma.section.upsert({
        where: { id: sec.id },
        update: {},
        create: sec,
      });
    }

    // 3. Super Admin & Core Users
    const users = [
      {
        id: 'user-super-admin',
        name: 'د. عقيل الزهراوي',
        email: 'admin@alzahrawi.edu.iq',
        password: defaultPasswordHash,
        role: 'super_admin',
        title: 'المشرف العام على المنظومة',
        mustChangePassword: false,
      },
      {
        id: 'user-dean-med',
        name: 'أ.د. علي الشمري',
        email: 'dean.med@alzahrawi.edu.iq',
        password: defaultPasswordHash,
        role: 'college_admin',
        title: 'عميد كلية الطب البشري',
        collegeId: 'col-medicine',
        mustChangePassword: false,
      },
      {
        id: 'user-head-surgery',
        name: 'د. وسام الربيعي',
        email: 'head.surgery@alzahrawi.edu.iq',
        password: defaultPasswordHash,
        role: 'department_admin',
        title: 'رئيس قسم الجراحة العامة',
        collegeId: 'col-medicine',
        departmentId: 'dept-surgery',
        mustChangePassword: false,
      },
      {
        id: 'doc-1',
        name: 'أ.د. حيدر كاظم',
        email: 'haider.k@alzahrawi.edu.iq',
        password: defaultPasswordHash,
        role: 'doctor',
        title: 'أستاذ الجراحة والتشريح',
        collegeId: 'col-medicine',
        departmentId: 'dept-surgery',
        mustChangePassword: false,
      },
      {
        id: 'stu-1',
        name: 'أحمد ليث البدري',
        email: 'ahmed.badri@student.alzahrawi.edu.iq',
        password: defaultPasswordHash,
        role: 'student',
        title: 'طالب طب بشري',
        collegeId: 'col-medicine',
        departmentId: 'dept-surgery',
        stage: 1,
        sectionId: 'sec-surg-1a',
        sectionName: 'شعبة (أ)',
        mustChangePassword: false,
      },
    ];

    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      });
    }

    // 4. Create Subject
    await prisma.subject.upsert({
      where: { id: 'sub-anatomy' },
      update: {},
      create: {
        id: 'sub-anatomy',
        name: 'علم التشريح السريري',
        collegeId: 'col-medicine',
        departmentId: 'dept-surgery',
        stage: 1,
        semester: 1,
        doctorId: 'doc-1',
        doctorName: 'أ.د. حيدر كاظم',
      },
    });

    console.log('✅ Automatic initialization complete.');
    return { initialized: true };
  } catch (error) {
    console.error('Error during automatic initialization:', error);
    return { initialized: false, error };
  }
}
