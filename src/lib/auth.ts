import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing! Set JWT_SECRET in your environment.');
  }
  return new TextEncoder().encode(secret);
}

const COOKIE_NAME = 'alzahrawi_session';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeId?: string | null;
  departmentId?: string | null;
  stage?: number | null;
  sectionId?: string | null;
  sectionName?: string | null;
  mustChangePassword?: boolean;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Server-side RBAC Guard: Re-queries DB for real-time role, scope, and password state
export async function requireAuth(options?: { allowMustChangePassword?: boolean }): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  const fresh = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      collegeId: true,
      departmentId: true,
      stage: true,
      sectionId: true,
      sectionName: true,
      mustChangePassword: true,
    },
  });

  if (!fresh) {
    throw new Error('UNAUTHORIZED');
  }

  if (fresh.mustChangePassword && !options?.allowMustChangePassword) {
    throw new Error('PASSWORD_CHANGE_REQUIRED');
  }

  return {
    id: fresh.id,
    name: fresh.name,
    email: fresh.email,
    role: fresh.role as UserRole,
    collegeId: fresh.collegeId,
    departmentId: fresh.departmentId,
    stage: fresh.stage,
    sectionId: fresh.sectionId,
    sectionName: fresh.sectionName,
    mustChangePassword: fresh.mustChangePassword,
  };
}

export async function requireRole(
  allowedRoles: UserRole[],
  options?: { allowMustChangePassword?: boolean }
): Promise<SessionUser> {
  const session = await requireAuth(options);
  if (!allowedRoles.includes(session.role)) {
    throw new Error('FORBIDDEN');
  }
  return session;
}

export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'صلاحيات غير كافية لتنفيذ هذا الإجراء', code: 'FORBIDDEN' }, { status: 403 });
    }
    if (error.message === 'PASSWORD_CHANGE_REQUIRED' || error.message === 'MUST_CHANGE_PASSWORD') {
      return NextResponse.json(
        { error: 'يجب تغيير كلمة المرور أولاً', code: 'PASSWORD_CHANGE_REQUIRED' },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
}
