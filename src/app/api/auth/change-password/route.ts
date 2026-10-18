import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth, setSessionCookie } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const userSession = await requireAuth({ allowMustChangePassword: true });
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' }, { status: 400 });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'يجب أن لا تقل كلمة المرور الجديدة عن 8 خانات' }, { status: 400 });
    }

    if (newPassword === '123456' || newPassword === '12345678') {
      return NextResponse.json({ error: 'لا يمكن استخدام كلمة مرور سهلة التخمين' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userSession.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({ error: 'يجب أن تختلف كلمة المرور الجديدة عن الحالية' }, { status: 400 });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        password: newHashedPassword,
        mustChangePassword: false,
      },
    });

    const refreshedSession = {
      ...userSession,
      mustChangePassword: false,
    };
    await setSessionCookie(refreshedSession);

    await logAuditEvent({
      userId: updatedUser.id,
      userName: updatedUser.name,
      userRole: updatedUser.role,
      action: 'CHANGE_PASSWORD',
      target: 'Auth',
      details: 'تم تغيير كلمة المرور بنجاح وإلغاء حالة الإجبار.',
    });

    return NextResponse.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error: any) {
    return handleApiError(error, 'Change Password POST');
  }
}
