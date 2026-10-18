import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, handleApiError } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const user = await requireAuth();

    let subjects;
    if (user.role === 'super_admin') {
      subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
    } else if (user.role === 'college_admin') {
      subjects = await prisma.subject.findMany({
        where: { collegeId: user.collegeId || '' },
        orderBy: { name: 'asc' },
      });
    } else if (user.role === 'doctor') {
      subjects = await prisma.subject.findMany({
        where: { doctorId: user.id },
        orderBy: { name: 'asc' },
      });
    } else {
      subjects = await prisma.subject.findMany({
        where: {
          collegeId: user.collegeId || '',
          departmentId: user.departmentId || '',
        },
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({ subjects });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { name, collegeId, departmentId, stage, semester, doctorId } = await req.json();

    const targetCollegeId = user.role === 'college_admin' ? (user.collegeId || '') : collegeId;
    const targetDeptId = user.role === 'department_admin' ? (user.departmentId || '') : departmentId;

    const canManage =
      user.role === 'super_admin' ||
      (user.role === 'college_admin' && user.collegeId === targetCollegeId) ||
      (user.role === 'department_admin' && user.collegeId === targetCollegeId && user.departmentId === targetDeptId);

    if (!canManage) {
      return NextResponse.json({ error: 'غير مصرح لك بإضافة مادة' }, { status: 403 });
    }

    // Strict validation: doctor must exist, have doctor role, and belong to same college & department
    let resolvedDoctorName: string | null = null;
    if (doctorId) {
      const doc = await prisma.user.findUnique({ where: { id: doctorId } });
      if (!doc || doc.role !== 'doctor' || doc.collegeId !== targetCollegeId || doc.departmentId !== targetDeptId) {
        return NextResponse.json({ error: 'التدريسي المحدد غير صالح أو لا ينتمي لنفس كلية وقسم المادة' }, { status: 400 });
      }
      resolvedDoctorName = doc.name;
    }

    const subject = await prisma.subject.create({
      data: {
        id: `sub-${crypto.randomUUID()}`,
        name: name.trim(),
        collegeId: targetCollegeId,
        departmentId: targetDeptId,
        stage: Number(stage),
        semester: Number(semester) || 1,
        doctorId: doctorId || null,
        doctorName: resolvedDoctorName || null,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_SUBJECT',
      target: subject.name,
      details: doctorId ? `إسناد المادة للتدريسي: ${resolvedDoctorName}` : 'بدون تدريسي مسند',
    });

    return NextResponse.json({ subject });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { id, name, doctorId } = await req.json();

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'المادة غير موجودة' }, { status: 404 });

    const canManage =
      user.role === 'super_admin' ||
      (user.role === 'college_admin' && user.collegeId === existing.collegeId) ||
      (user.role === 'department_admin' && user.departmentId === existing.departmentId);

    if (!canManage) return NextResponse.json({ error: 'غير مصرح لك بتعديل المادة' }, { status: 403 });

    // Strict validation: doctor must exist, have doctor role, and belong to same college & department
    let resolvedDoctorName: string | null = null;
    if (doctorId) {
      const doc = await prisma.user.findUnique({ where: { id: doctorId } });
      if (!doc || doc.role !== 'doctor' || doc.collegeId !== existing.collegeId || doc.departmentId !== existing.departmentId) {
        return NextResponse.json({ error: 'التدريسي المحدد غير صالح أو لا ينتمي لنفس كلية وقسم المادة' }, { status: 400 });
      }
      resolvedDoctorName = doc.name;
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        doctorId: doctorId !== undefined ? (doctorId || null) : undefined,
        doctorName: doctorId ? resolvedDoctorName : null,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_SUBJECT',
      target: subject.name,
      details: doctorId ? `تحديث أستاذ المادة إلى: ${resolvedDoctorName}` : 'إلغاء إسناد المادة',
    });

    return NextResponse.json({ subject });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'المادة غير موجودة' }, { status: 404 });

    const canManage =
      user.role === 'super_admin' ||
      (user.role === 'college_admin' && user.collegeId === existing.collegeId) ||
      (user.role === 'department_admin' && user.departmentId === existing.departmentId);

    if (!canManage) return NextResponse.json({ error: 'غير مصرح لك بحذف المادة' }, { status: 403 });

    // Cascade delete lectures associated with this subject
    await prisma.lecture.deleteMany({ where: { subjectId: id } });

    await prisma.subject.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE_SUBJECT',
      target: existing.name,
      details: 'حذف المادة وحذف كافة المحاضرات التابعة لها تسلسلياً.',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
