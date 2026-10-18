import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

// Dual-key Rate Limiting (IP + Email protection against credential stuffing & distributed brute force)
interface RateLimitRecord {
  attempts: number;
  blockedUntil?: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

function getClientIp(req: NextRequest): string {
  // Prefer trusted single-IP proxy headers if provided by reverse proxy/Cloudflare
  const directIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip');
  if (directIp && /^[a-zA-Z0-9.:]+$/.test(directIp.trim())) {
    return directIp.trim().slice(0, 45);
  }

  // Fallback to x-forwarded-for: Use the LAST entry (appended by the closest trusted proxy)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
    const lastIp = parts[parts.length - 1];
    if (lastIp && /^[a-zA-Z0-9.:]+$/.test(lastIp)) {
      return lastIp.slice(0, 45);
    }
  }

  return '127.0.0.1';
}

function checkLimit(key: string): { blocked: boolean; waitSeconds: number } {
  const now = Date.now();
  const rec = rateLimits.get(key);
  if (rec && rec.blockedUntil && rec.blockedUntil > now) {
    return { blocked: true, waitSeconds: Math.ceil((rec.blockedUntil - now) / 1000) };
  }
  return { blocked: false, waitSeconds: 0 };
}

function registerFailure(key: string, maxAttempts: number, blockDurationMs: number) {
  const now = Date.now();
  const rec = rateLimits.get(key) || { attempts: 0 };
  rec.attempts += 1;
  if (rec.attempts >= maxAttempts) {
    rec.blockedUntil = now + blockDurationMs;
  }
  rateLimits.set(key, rec);
}

function clearLimit(key: string) {
  rateLimits.delete(key);
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailKey = `email:${cleanEmail}`;
    const ipKey = `ip:${ip}`;

    // Check IP limit (max 10 attempts across all accounts from same IP)
    const ipLimit = checkLimit(ipKey);
    if (ipLimit.blocked) {
      return NextResponse.json(
        { error: `تم حظر محاولات الدخول مؤقتاً من هذا العنوان لكثرة المحاولات. يرجى الانتظار ${ipLimit.waitSeconds} ثانية.` },
        { status: 429 }
      );
    }

    // Check Email limit (max 5 attempts for this specific account, regardless of IP changes)
    const emailLimit = checkLimit(emailKey);
    if (emailLimit.blocked) {
      return NextResponse.json(
        { error: `تم قفل هذا الحساب مؤقتاً لكثرة المحاولات الخاطئة. يرجى الانتظار ${emailLimit.waitSeconds} ثانية.` },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      // Register failures on BOTH keys
      registerFailure(emailKey, 5, 15 * 60 * 1000); // 5 attempts per account -> 15 min lock
      registerFailure(ipKey, 10, 15 * 60 * 1000);   // 10 attempts per IP -> 15 min lock

      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // Reset rate limits on success
    clearLimit(emailKey);
    clearLimit(ipKey);

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
      mustChangePassword: user.mustChangePassword,
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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'حدث خطأ في السيرفر أثناء تسجيل الدخول' }, { status: 500 });
  }
}
