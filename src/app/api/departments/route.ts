import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { collegeId, name, stagesCount } = await req.json();

    // Verify role permissions
    if (user.role !== 'super_admin' && (user.role !== 'college_admin' || user.collegeId !== collegeId)) {
      return NextResponse.json({ error: 'غير مصرح لك بإضافة قسم لهذه الكلية' }, { status: 403 });
    }

    const dept = await prisma.department.create({
      data: {
        id: `dept-${crypto.randomUUID()}`,
        name: name.trim(),
        stagesCount: Number(stagesCount) || 4,
        collegeId,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_DEPARTMENT',
      target: dept.name,
      details: `إضافة قسم جديد: ${dept.name}`,
    });

    return NextResponse.json({ department: dept });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }
    console.error('Department POST error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء إضافة القسم' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { id, collegeId, name, stagesCount } = await req.json();

    if (user.role !== 'super_admin' && (user.role !== 'college_admin' || user.collegeId !== collegeId)) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا القسم' }, { status: 403 });
    }

    const dept = await prisma.department.update({
      where: { id },
      data: {
        name: name.trim(),
        stagesCount: Number(stagesCount) || 4,
      },
    });

    return NextResponse.json({ department: dept });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }
    console.error('Department PUT error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء تعديل القسم' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'القسم غير موجود' }, { status: 404 });

    if (user.role !== 'super_admin' && (user.role !== 'college_admin' || user.collegeId !== existing.collegeId)) {
      return NextResponse.json({ error: 'غير مصرح لك بحذف هذا القسم' }, { status: 403 });
    }

    // Cascade delete lectures and unbind users
    await prisma.lecture.deleteMany({ where: { departmentId: id } });
    await prisma.subject.deleteMany({ where: { departmentId: id } });
    await prisma.section.deleteMany({ where: { departmentId: id } });
    await prisma.user.updateMany({
      where: { departmentId: id },
      data: { departmentId: null, sectionId: null, sectionName: null },
    });

    await prisma.department.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE_DEPARTMENT',
      target: existing.name,
      details: 'حذف القسم وكافة المواد والمحاضرات والشعب التابعة له تسلسلياً.',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }
    console.error('Department DELETE error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء حذف القسم' }, { status: 500 });
  }
}
