import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'alzahrawi_session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Intercept all API routes
  if (pathname.startsWith('/api')) {
    // Whitelist public/allowed auth endpoints
    const allowedAuthPaths = [
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/me',
      '/api/auth/change-password',
      '/api/users/template',
    ];

    if (allowedAuthPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.next();
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'يرجى تسجيل الدخول للمتابعة', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return NextResponse.json(
          { error: 'خطأ أمني في الخادم: مفتاح التشفير غير محدد' },
          { status: 500 }
        );
      }

      const encodedSecret = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(token, encodedSecret);

      // Server-side enforcement: block all API operations if user has temporary password
      if (payload.mustChangePassword) {
        return NextResponse.json(
          {
            error: 'يجب تغيير كلمة المرور المؤقتة أولاً قبل متابعة استخدام المنظومة',
            code: 'MUST_CHANGE_PASSWORD',
          },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'جلسة الدخول غير صالحة أو منتهية الصلاحية', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
