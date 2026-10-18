import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, handleApiError } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const user = await requireAuth();

    let sections;
    if (user.role === 'super_admin') {
      sections = await prisma.section.findMany({ orderBy: { name: 'asc' } });
    } else if (user.role === 'college_admin') {
      sections = await prisma.section.findMany({
        where: { collegeId: user.collegeId || '' },
        orderBy: { name: 'asc' },
      });
    } else {
      sections = await prisma.section.findMany({
        where: {
          collegeId: user.collegeId || '',
          departmentId: user.departmentId || '',
        },
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({ sections });
  } catch (error: any) {
    return handleApiError(error, 'Sections GET');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { name, departmentId, stage } = await req.json();

    if (!name || !departmentId || !stage) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) {
      return NextResponse.json({ error: 'القسم غير موجود' }, { status: 404 });
    }

    const targetCollegeId = dept.collegeId;

    // Check authority
    const canManage =
      user.role === 'super_admin' ||
      (user.role === 'college_admin' && user.collegeId === targetCollegeId) ||
      (user.role === 'department_admin' && user.departmentId === departmentId);

    if (!canManage) {
      return NextResponse.json({ error: 'غير مصرح لك بإضافة شعبة' }, { status: 403 });
    }

    const section = await prisma.section.create({
      data: {
        id: `sec-${crypto.randomUUID()}`,
        name: name.trim(),
        collegeId: targetCollegeId,
        departmentId,
        stage: Number(stage),
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_SECTION',
      target: section.name,
    });

    return NextResponse.json({ section });
  } catch (error: any) {
    return handleApiError(error, 'Sections POST');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { id, name } = await req.json();

    const existing = await prisma.section.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'الشعبة غير موجودة' }, { status: 404 });

    const canManage =
      user.role === 'super_admin' ||
      (user.role === 'college_admin' && user.collegeId === existing.collegeId) ||
      (user.role === 'department_admin' && user.departmentId === existing.departmentId);

    if (!canManage) return NextResponse.json({ error: 'غير مصرح لك بتعديل الشعبة' }, { status: 403 });

    const section = await prisma.section.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json({ section });
  } catch (error: any) {
    return handleApiError(error, 'Sections PUT');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

    const existing = await prisma.section.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'الشعبة غير موجودة' }, { status: 404 });

    const canManage =
      user.role === 'super_admin' ||
      (user.role === 'college_admin' && user.collegeId === existing.collegeId) ||
      (user.role === 'department_admin' && user.departmentId === existing.departmentId);

    if (!canManage) return NextResponse.json({ error: 'غير مصرح لك بحذف الشعبة' }, { status: 403 });

    // Cascade delete lectures targeted to this section
    await prisma.lecture.deleteMany({ where: { sectionTarget: id } });

    // Unlink users from this section
    await prisma.user.updateMany({
      where: { sectionId: id },
      data: { sectionId: null, sectionName: null },
    });

    await prisma.section.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE_SECTION',
      target: existing.name,
      details: 'حذف الشعبة وحذف كافة المحاضرات المرتبطة بها تسلسلياً.',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error, 'Sections DELETE');
  }
}
