import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, handleApiError } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

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
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await req.json();

    // Check authority to create this role
    if (user.role === 'super_admin') {
      // Allowed all roles
      if (data.sectionId) {
        const sec = await prisma.section.findUnique({ where: { id: data.sectionId } });
        if (sec) data.sectionName = sec.name;
      }
    } else if (user.role === 'college_admin') {
      if (['super_admin', 'college_admin'].includes(data.role)) {
        return NextResponse.json({ error: 'غير مصرح لك بإنشاء حساب بهذه الرتبة' }, { status: 403 });
      }
      data.collegeId = user.collegeId;

      // Validate department belongs to this college
      if (data.departmentId) {
        const dept = await prisma.department.findUnique({ where: { id: data.departmentId } });
        if (!dept || dept.collegeId !== user.collegeId) {
          return NextResponse.json({ error: 'القسم المحدد لا ينتمي لكليتك' }, { status: 400 });
        }
      }

      // Validate section belongs to the department and stage
      if (data.sectionId) {
        const sec = await prisma.section.findUnique({ where: { id: data.sectionId } });
        if (!sec || sec.departmentId !== data.departmentId || (data.stage && sec.stage !== Number(data.stage))) {
          return NextResponse.json({ error: 'الشعبة المحددة غير متوافقة مع القسم أو المرحلة' }, { status: 400 });
        }
        data.sectionName = sec.name;
      }
    } else if (user.role === 'department_admin') {
      if (!['doctor', 'student'].includes(data.role)) {
        return NextResponse.json({ error: 'غير مصرح لك بإنشاء حساب بهذه الرتبة' }, { status: 403 });
      }
      data.collegeId = user.collegeId;
      data.departmentId = user.departmentId;

      // Validate section belongs to this department and stage
      if (data.sectionId) {
        const sec = await prisma.section.findUnique({ where: { id: data.sectionId } });
        if (!sec || sec.departmentId !== user.departmentId || (data.stage && sec.stage !== Number(data.stage))) {
          return NextResponse.json({ error: 'الشعبة المحددة غير متوافقة مع قسمك أو المرحلة' }, { status: 400 });
        }
        data.sectionName = sec.name;
      }
    } else {
      return NextResponse.json({ error: 'غير مصرح لك بإنشاء مستخدمين' }, { status: 403 });
    }

    // Generate random temporary password if not explicitly provided
    const tempPassword = data.password ? data.password.trim() : `alzahrawi-${Math.floor(100000 + Math.random() * 900000)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const mustChangePassword = !data.password || Boolean(data.mustChangePassword);

    const newUser = await prisma.user.create({
      data: {
        id: `user-${crypto.randomUUID()}`,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: passwordHash,
        mustChangePassword,
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
        mustChangePassword: true,
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

    return NextResponse.json({ user: newUser, tempPassword });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, { status: 400 });
    }
    return handleApiError(error);
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
    return handleApiError(error);
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
    return handleApiError(error);
  }
}
