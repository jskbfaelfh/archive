import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { name, collegeId, departmentId, stage, semester, doctorId, doctorName } = await req.json();

    const canManage =
      user.role === 'super_admin' ||
      (user.role === 'college_admin' && user.collegeId === collegeId) ||
      (user.role === 'department_admin' && user.collegeId === collegeId && user.departmentId === departmentId);

    if (!canManage) {
      return NextResponse.json({ error: 'غير مصرح لك بإضافة مادة' }, { status: 403 });
    }

    // Resolve doctor name if doctorId provided
    let resolvedDoctorName = doctorName;
    if (doctorId && !doctorName) {
      const doc = await prisma.user.findUnique({ where: { id: doctorId } });
      resolvedDoctorName = doc?.name;
    }

    const subject = await prisma.subject.create({
      data: {
        id: `sub-${Date.now()}`,
        name: name.trim(),
        collegeId,
        departmentId,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { id, name, doctorId, doctorName } = await req.json();

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'المادة غير موجودة' }, { status: 404 });

    const canManage =
      user.role === 'super_admin' ||
      (user.role === 'college_admin' && user.collegeId === existing.collegeId) ||
      (user.role === 'department_admin' && user.departmentId === existing.departmentId);

    if (!canManage) return NextResponse.json({ error: 'غير مصرح لك بتعديل المادة' }, { status: 403 });

    let resolvedDoctorName = doctorName;
    if (doctorId && !doctorName) {
      const doc = await prisma.user.findUnique({ where: { id: doctorId } });
      resolvedDoctorName = doc?.name;
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
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    await prisma.subject.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE_SUBJECT',
      target: existing.name,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
