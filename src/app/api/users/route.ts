import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const user = await requireAuth();

    let users;
    if (user.role === 'super_admin') {
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          title: true,
          collegeId: true,
          departmentId: true,
          stage: true,
          sectionId: true,
          sectionName: true,
        },
        orderBy: { name: 'asc' },
      });
    } else if (user.role === 'college_admin') {
      users = await prisma.user.findMany({
        where: { collegeId: user.collegeId || '' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          title: true,
          collegeId: true,
          departmentId: true,
          stage: true,
          sectionId: true,
          sectionName: true,
        },
        orderBy: { name: 'asc' },
      });
    } else if (user.role === 'department_admin') {
      users = await prisma.user.findMany({
        where: {
          collegeId: user.collegeId || '',
          departmentId: user.departmentId || '',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          title: true,
          collegeId: true,
          departmentId: true,
          stage: true,
          sectionId: true,
          sectionName: true,
        },
        orderBy: { name: 'asc' },
      });
    } else {
      return NextResponse.json({ users: [] });
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await req.json();

    // Check authority to create this role
    if (user.role === 'super_admin') {
      // Allowed all roles
    } else if (user.role === 'college_admin') {
      if (['super_admin', 'college_admin'].includes(data.role)) {
        return NextResponse.json({ error: 'غير مصرح لك بإنشاء حساب بهذه الرتبة' }, { status: 403 });
      }
      data.collegeId = user.collegeId;
    } else if (user.role === 'department_admin') {
      if (!['doctor', 'student'].includes(data.role)) {
        return NextResponse.json({ error: 'غير مصرح لك بإنشاء حساب بهذه الرتبة' }, { status: 403 });
      }
      data.collegeId = user.collegeId;
      data.departmentId = user.departmentId;
    } else {
      return NextResponse.json({ error: 'غير مصرح لك بإنشاء مستخدمين' }, { status: 403 });
    }

    // Default password or custom
    const passwordHash = await bcrypt.hash(data.password || '123456', 10);

    const newUser = await prisma.user.create({
      data: {
        id: `user-${Date.now()}`,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: passwordHash,
        role: data.role,
        title: data.title || null,
        collegeId: data.collegeId || null,
        departmentId: data.departmentId || null,
        stage: data.stage ? Number(data.stage) : null,
        sectionId: data.sectionId || null,
        sectionName: data.sectionName || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        collegeId: true,
        departmentId: true,
        stage: true,
        sectionId: true,
        sectionName: true,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_USER',
      target: newUser.name,
      details: `إنشاء حساب جديد (${newUser.role}) بريد: ${newUser.email}`,
    });

    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await req.json();

    const existing = await prisma.user.findUnique({ where: { id: data.id } });
    if (!existing) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });

    // Validate permission to edit
    if (user.role === 'super_admin') {
      // Allowed
    } else if (user.role === 'college_admin' && existing.collegeId === user.collegeId && existing.role !== 'super_admin') {
      // Allowed
    } else if (
      user.role === 'department_admin' &&
      existing.departmentId === user.departmentId &&
      ['doctor', 'student'].includes(existing.role)
    ) {
      // Allowed
    } else {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا الحساب' }, { status: 403 });
    }

    const updated = await prisma.user.update({
      where: { id: data.id },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        title: data.title !== undefined ? data.title : undefined,
        stage: data.stage !== undefined ? Number(data.stage) : undefined,
        sectionId: data.sectionId !== undefined ? data.sectionId : undefined,
        sectionName: data.sectionName !== undefined ? data.sectionName : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        collegeId: true,
        departmentId: true,
        stage: true,
        sectionId: true,
        sectionName: true,
      },
    });

    return NextResponse.json({ user: updated });
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

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });

    if (existing.id === user.id) {
      return NextResponse.json({ error: 'لا يمكنك حذف حسابك الحالي' }, { status: 400 });
    }

    if (user.role === 'super_admin') {
      // Allowed
    } else if (user.role === 'college_admin' && existing.collegeId === user.collegeId && existing.role !== 'super_admin') {
      // Allowed
    } else if (
      user.role === 'department_admin' &&
      existing.departmentId === user.departmentId &&
      ['doctor', 'student'].includes(existing.role)
    ) {
      // Allowed
    } else {
      return NextResponse.json({ error: 'غير مصرح لك بحذف هذا الحساب' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE_USER',
      target: existing.name,
      details: `حذف حساب: ${existing.name} (${existing.role})`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
