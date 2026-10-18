import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const user = await requireAuth();

    let colleges;
    if (user.role === 'super_admin') {
      colleges = await prisma.college.findMany({
        include: { departments: true },
        orderBy: { name: 'asc' },
      });
    } else {
      colleges = await prisma.college.findMany({
        where: { id: user.collegeId || '' },
        include: { departments: true },
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({ colleges });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }
    console.error('Colleges GET error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء جلب بيانات الكليات' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['super_admin']);
    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'اسم الكلية مطلوب' }, { status: 400 });
    }

    const college = await prisma.college.create({
      data: {
        id: `col-${crypto.randomUUID()}`,
        name: name.trim(),
      },
      include: { departments: true },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_COLLEGE',
      target: college.name,
      details: `إنشاء كلية جديدة: ${college.name}`,
    });

    return NextResponse.json({ college });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'غير مصرح لك بإضافة كليات' }, { status: 403 });
    }
    console.error('Colleges POST error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء إضافة الكلية' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireRole(['super_admin']);
    const { id, name } = await req.json();

    const college = await prisma.college.update({
      where: { id },
      data: { name: name.trim() },
      include: { departments: true },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_COLLEGE',
      target: college.name,
    });

    return NextResponse.json({ college });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل الكليات' }, { status: 403 });
    }
    console.error('Colleges PUT error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء تعديل الكلية' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireRole(['super_admin']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

    const deleted = await prisma.college.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE_COLLEGE',
      target: deleted.name,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'غير مصرح لك بحذف الكليات' }, { status: 403 });
    }
    console.error('Colleges DELETE error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء حذف الكلية' }, { status: 500 });
  }
}
