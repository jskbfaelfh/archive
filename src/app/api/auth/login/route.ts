import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

// In-memory Rate Limiting: 5 failed attempts per 10 minutes
interface RateLimitRecord {
  attempts: number;
  blockedUntil?: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    // Validate basic IP format to prevent header injection in logs
    if (/^[a-zA-Z0-9.:]+$/.test(firstIp)) {
      return firstIp.slice(0, 45);
    }
  }
  return '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const now = Date.now();

    // Check rate limit
    const record = loginAttempts.get(ip);
    if (record && record.blockedUntil && record.blockedUntil > now) {
      const waitSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      return NextResponse.json(
        { error: `تم حظر محاولات الدخول مؤقتاً لكثرة المحاولات الخاطئة. يرجى الانتظار ${waitSeconds} ثانية.` },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      // Record failed attempt
      const cur = loginAttempts.get(ip) || { attempts: 0 };
      cur.attempts += 1;
      if (cur.attempts >= 5) {
        cur.blockedUntil = now + 10 * 60 * 1000; // 10 minutes block
      }
      loginAttempts.set(ip, cur);

      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // Reset attempts on successful login
    loginAttempts.delete(ip);

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
      action: 'LOGIN',
      target: 'Auth',
      details: 'تسجيل دخول ناجح للمنظومة.',
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, user: sessionPayload });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'حدث خطأ في السيرفر أثناء تسجيل الدخول' }, { status: 500 });
  }
}
