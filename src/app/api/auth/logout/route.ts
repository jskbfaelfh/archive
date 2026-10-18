import { NextResponse } from 'next/server';
import { clearSessionCookie, getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST() {
  const session = await getSession();
  if (session) {
    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'LOGOUT',
      target: 'Auth',
      details: 'تسجيل خروج من المنظومة.',
    });
  }

  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
