import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, handleApiError } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireRole(['super_admin']);

    const [colleges, departments, sections, subjects, users, lectures, auditLogs] = await Promise.all([
      prisma.college.findMany(),
      prisma.department.findMany(),
      prisma.section.findMany(),
      prisma.subject.findMany(),
      prisma.user.findMany(),
      prisma.lecture.findMany(),
      prisma.auditLog.findMany({ take: 200, orderBy: { createdAt: 'desc' } }),
    ]);

    const backupData = {
      system: 'جامعة الزهراوي - منظومة أرشفة المحاضرات',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: user.name,
      tables: {
        colleges,
        departments,
        sections,
        subjects,
        users,
        lectures,
        auditLogs,
      },
    };

    const dateStr = new Date().toISOString().split('T')[0];
    const jsonString = JSON.stringify(backupData, null, 2);

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'BACKUP_EXPORT',
      target: 'قاعدة البيانات',
      details: `تصدير نسخة احتياطية تحوي ${lectures.length} محاضرة و ${users.length} مستخدم`,
    });

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="alzahrawi_backup_${dateStr}.json"`,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['super_admin']);
    const body = await req.json();

    if (!body || !body.tables) {
      return NextResponse.json({ error: 'ملف النسخة الاحتياطية غير صالح أو تالف' }, { status: 400 });
    }

    const { colleges, departments, sections, subjects, users, lectures } = body.tables;

    await prisma.$transaction(async (tx) => {
      // Upsert Colleges
      if (Array.isArray(colleges)) {
        for (const col of colleges) {
          await tx.college.upsert({
            where: { id: col.id },
            update: { name: col.name },
            create: { id: col.id, name: col.name },
          });
        }
      }

      // Upsert Departments
      if (Array.isArray(departments)) {
        for (const dep of departments) {
          await tx.department.upsert({
            where: { id: dep.id },
            update: { name: dep.name, collegeId: dep.collegeId, stagesCount: dep.stagesCount || 4 },
            create: { id: dep.id, name: dep.name, collegeId: dep.collegeId, stagesCount: dep.stagesCount || 4 },
          });
        }
      }

      // Upsert Sections
      if (Array.isArray(sections)) {
        for (const sec of sections) {
          await tx.section.upsert({
            where: { id: sec.id },
            update: { name: sec.name, collegeId: sec.collegeId, departmentId: sec.departmentId, stage: sec.stage },
            create: { id: sec.id, name: sec.name, collegeId: sec.collegeId, departmentId: sec.departmentId, stage: sec.stage },
          });
        }
      }

      // Upsert Subjects
      if (Array.isArray(subjects)) {
        for (const sub of subjects) {
          await tx.subject.upsert({
            where: { id: sub.id },
            update: {
              name: sub.name,
              collegeId: sub.collegeId,
              departmentId: sub.departmentId,
              stage: sub.stage,
              doctorId: sub.doctorId,
              doctorName: sub.doctorName,
            },
            create: {
              id: sub.id,
              name: sub.name,
              collegeId: sub.collegeId,
              departmentId: sub.departmentId,
              stage: sub.stage,
              doctorId: sub.doctorId,
              doctorName: sub.doctorName,
            },
          });
        }
      }

      // Upsert Users
      if (Array.isArray(users)) {
        const validRoles = ['super_admin', 'college_admin', 'department_admin', 'doctor', 'student'];
        for (const u of users) {
          const isBcrypt = typeof u.password === 'string' && u.password.startsWith('$2');
          const randomTempPass = `Alz#${crypto.randomUUID().slice(0, 8)}`;
          const securePassword = isBcrypt ? u.password : await bcrypt.hash(randomTempPass, 10);
          const forceChange = !isBcrypt || Boolean(u.mustChangePassword);
          const targetRole = validRoles.includes(u.role) ? u.role : 'student';

          await tx.user.upsert({
            where: { id: u.id },
            update: {
              name: u.name,
              email: u.email,
              password: securePassword,
              mustChangePassword: forceChange,
              role: targetRole,
              title: u.title || null,
              collegeId: u.collegeId,
              departmentId: u.departmentId,
              stage: u.stage,
              sectionId: u.sectionId,
              sectionName: u.sectionName,
            },
            create: {
              id: u.id,
              name: u.name,
              email: u.email,
              password: securePassword,
              mustChangePassword: forceChange,
              role: targetRole,
              title: u.title || null,
              collegeId: u.collegeId,
              departmentId: u.departmentId,
              stage: u.stage,
              sectionId: u.sectionId,
              sectionName: u.sectionName,
            },
          });
        }
      }

      // Upsert Lectures
      if (Array.isArray(lectures)) {
        for (const lec of lectures) {
          await tx.lecture.upsert({
            where: { id: lec.id },
            update: {
              title: lec.title,
              description: lec.description,
              collegeId: lec.collegeId,
              departmentId: lec.departmentId,
              stage: lec.stage,
              subjectId: lec.subjectId,
              subjectName: lec.subjectName,
              sectionTarget: lec.sectionTarget,
              sectionName: lec.sectionName,
              doctorId: lec.doctorId,
              doctorName: lec.doctorName,
              fileType: lec.fileType,
              fileName: lec.fileName,
              fileSize: lec.fileSize,
              filePath: lec.filePath,
              uploadDate: lec.uploadDate,
              viewsCount: lec.viewsCount,
              downloadsCount: lec.downloadsCount,
            },
            create: {
              id: lec.id,
              title: lec.title,
              description: lec.description,
              collegeId: lec.collegeId,
              departmentId: lec.departmentId,
              stage: lec.stage,
              subjectId: lec.subjectId,
              subjectName: lec.subjectName,
              sectionTarget: lec.sectionTarget,
              sectionName: lec.sectionName,
              doctorId: lec.doctorId,
              doctorName: lec.doctorName,
              fileType: lec.fileType,
              fileName: lec.fileName,
              fileSize: lec.fileSize,
              filePath: lec.filePath,
              uploadDate: lec.uploadDate,
              viewsCount: lec.viewsCount,
              downloadsCount: lec.downloadsCount,
            },
          });
        }
      }
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DATABASE_RESTORE',
      target: 'قاعدة البيانات',
      details: `استرجاع نسخة احتياطية بنجاح (${lectures?.length || 0} محاضرة)`,
    });

    return NextResponse.json({
      success: true,
      message: 'تم استرجاع النسخة الاحتياطية بنجاح وتحديث كافة البيانات في قاعدة البيانات.',
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
