import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      collegeId: user.collegeId,
      departmentId: user.departmentId,
      stage: user.stage,
      sectionId: user.sectionId,
      sectionName: user.sectionName,
    };

    await setSessionCookie(sessionPayload);

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'SWITCH_USER_PERSPECTIVE',
      target: 'Auth',
      details: `تبديل الحساب النشط إلى: ${user.name} (${user.role})`,
    });

    return NextResponse.json({ success: true, user: sessionPayload });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
