import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // 1. Check if super admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'super_admin' },
    });

    if (existingAdmin) {
      const stats = {
        colleges: await prisma.college.count(),
        users: await prisma.user.count(),
        lectures: await prisma.lecture.count(),
      };
      return NextResponse.json({
        initialized: true,
        message: 'قاعدة البيانات مهيأة مسبقاً وتعمل بنجاح.',
        stats,
      });
    }

    console.log('🌱 Starting automatic seed for Railway deployment...');

    // 2. Hash default password
    const defaultPasswordHash = await bcrypt.hash('123456', 10);

    // 3. Create Colleges & Departments
    const med = await prisma.college.create({
      data: {
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

    const pharm = await prisma.college.create({
      data: {
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

    // 4. Create Sections
    await prisma.section.createMany({
      data: [
        { id: 'sec-surg-1a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 1 },
        { id: 'sec-surg-1b', name: 'شعبة (ب)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 1 },
        { id: 'sec-surg-2a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-surgery', stage: 2 },
        { id: 'sec-card-1a', name: 'شعبة (أ)', collegeId: 'col-medicine', departmentId: 'dept-cardio', stage: 1 },
        { id: 'sec-pharm-1a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-pharmaceutics', stage: 1 },
        { id: 'sec-chem-1a', name: 'شعبة (أ)', collegeId: 'col-pharmacy', departmentId: 'dept-medchem', stage: 1 },
      ],
    });

    // 5. Create Core Users
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
      await prisma.user.create({ data: u });
    }

    // 6. Create Subjects
    await prisma.subject.create({
      data: {
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

    // 7. Create Initial Lecture
    await prisma.lecture.create({
      data: {
        id: 'lec-anatomy-1',
        title: 'مقدمة في علم التشريح البشري والمصطلحات الطبية',
        description: 'المحاضرة الأولى التأسيسية لطلبة المرحلة الأولى طب عام.',
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
        fileName: 'Clinical_Anatomy_Lecture_01.pdf',
        fileSize: '4.2 MB',
        uploadDate: '2026-10-15',
        viewsCount: 14,
        downloadsCount: 9,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تمت تهيئة قاعدة البيانات بنجاح وإنشاء الحسابات الأولية.',
      accounts: users.map((u) => ({ name: u.name, email: u.email, role: u.role })),
    });
  } catch (error: any) {
    console.error('Init error:', error);
    return NextResponse.json(
      {
        error: 'فشل تهيئة قاعدة البيانات',
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
