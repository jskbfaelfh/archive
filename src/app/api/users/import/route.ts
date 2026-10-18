import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!['super_admin', 'college_admin', 'department_admin'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'غير مصرح لك باستيراد المستخدمين' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'يرجى إرفاق ملف Excel أو CSV' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'الملف فارغ أو لا يحتوي على صفوف بيانات صالحة' }, { status: 400 });
    }

    // Preload hierarchy for fast matching
    const [allColleges, allSections] = await Promise.all([
      prisma.college.findMany({ include: { departments: true } }),
      prisma.section.findMany(),
    ]);

    let successCount = 0;
    const errors: string[] = [];
    const createdAccounts: { name: string; email: string; tempPassword: string; role: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // header is row 1

      // Support Arabic & English column keys
      const name = (row['الاسم'] || row['name'] || '').toString().trim();
      const email = (row['البريد'] || row['email'] || '').toString().trim().toLowerCase();
      const rawRole = (row['الدور'] || row['role'] || 'طالب').toString().trim();
      const collegeName = (row['الكلية'] || row['college'] || '').toString().trim();
      const deptName = (row['القسم'] || row['department'] || '').toString().trim();
      const stage = Number(row['المرحلة'] || row['stage'] || 1);
      const sectionName = (row['الشعبة'] || row['section'] || '').toString().trim();

      if (!name || !email) {
        errors.push(`صف ${rowNum}: الاسم والبريد الإلكتروني حقلان إلزاميان.`);
        continue;
      }

      // Check duplicate in DB
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        errors.push(`صف ${rowNum}: البريد "${email}" مسجل مسبقاً.`);
        continue;
      }

      // Resolve Role
      let role = 'student';
      if (rawRole.includes('تدريس') || rawRole.toLowerCase() === 'doctor') {
        role = 'doctor';
      } else if (rawRole.includes('رئيس') || rawRole.toLowerCase() === 'department_admin') {
        role = 'department_admin';
      } else if (rawRole.includes('عميد') || rawRole.toLowerCase() === 'college_admin') {
        role = 'college_admin';
      }

      // Role permission scope
      if (currentUser.role === 'department_admin' && !['doctor', 'student'].includes(role)) {
        errors.push(`صف ${rowNum}: لا تملك صلاحية إنشاء حساب برتبة ${rawRole}.`);
        continue;
      }
      if (currentUser.role === 'college_admin' && ['super_admin', 'college_admin'].includes(role)) {
        errors.push(`صف ${rowNum}: لا تملك صلاحية إنشاء حساب بهذه الرتبة.`);
        continue;
      }

      // Resolve College
      let targetCollege = allColleges.find(
        (c) => c.name.includes(collegeName) || c.id === collegeName
      );
      if (currentUser.role !== 'super_admin' && currentUser.collegeId) {
        targetCollege = allColleges.find((c) => c.id === currentUser.collegeId);
      }

      // Resolve Department
      let targetDept = targetCollege?.departments.find(
        (d) => d.name.includes(deptName) || d.id === deptName
      );
      if (currentUser.role === 'department_admin' && currentUser.departmentId) {
        targetDept = targetCollege?.departments.find((d) => d.id === currentUser.departmentId);
      }

      // Resolve Section (for students)
      const targetSection = allSections.find(
        (s) =>
          s.collegeId === targetCollege?.id &&
          s.departmentId === targetDept?.id &&
          s.stage === stage &&
          s.name.includes(sectionName)
      );

      try {
        const tempPassword = `Alz@${crypto.randomUUID().slice(0, 8)}`;
        const userPasswordHash = await bcrypt.hash(tempPassword, 10);

        await prisma.user.create({
          data: {
            id: `user-${crypto.randomUUID()}`,
            name,
            email,
            password: userPasswordHash,
            mustChangePassword: true,
            role,
            title: role === 'student' ? 'طالب جامعي' : role === 'doctor' ? 'أستاذ مقرر' : undefined,
            collegeId: targetCollege?.id || null,
            departmentId: targetDept?.id || null,
            stage: role === 'student' ? stage : null,
            sectionId: role === 'student' ? (targetSection?.id || null) : null,
            sectionName: role === 'student' ? (targetSection?.name || sectionName || null) : null,
          },
        });
        successCount++;
        createdAccounts.push({ name, email, tempPassword, role });
      } catch {
        errors.push(`صف ${rowNum}: حدث خطأ أثناء حفظ السجل في قاعدة البيانات.`);
      }
    }

    await logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'BULK_IMPORT_USERS',
      target: file.name,
      details: `تم استيراد ${successCount} مستخدم من إكسل بنجاح وتوليد كلمات مرور مؤقتة فريدة (الأخطاء: ${errors.length})`,
    });

    return NextResponse.json({
      success: true,
      importedCount: successCount,
      errorsCount: errors.length,
      createdAccounts,
      errors: errors.slice(0, 15), // return top 15 errors
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء استيراد ومعالجة الملف' }, { status: 500 });
  }
}
