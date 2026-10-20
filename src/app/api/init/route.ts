import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseInitialized } from '@/lib/init-db';
import { clearAllRateLimits } from '@/app/api/auth/login/route';

export async function GET() {
  try {
    clearAllRateLimits();
    const result = await ensureDatabaseInitialized();

    const stats = {
      colleges: await prisma.college.count(),
      users: await prisma.user.count(),
      lectures: await prisma.lecture.count(),
    };

    return NextResponse.json({
      success: true,
      message: result.initialized
        ? 'تمت تهيئة قاعدة البيانات بنجاح وإنشاء الحسابات الأولية وفك أي حظر مؤقت.'
        : 'قاعدة البيانات مهيأة مسبقاً وتعمل بنجاح (تم فك الحظر المؤقت).',
      stats,
      defaultAccounts: [
        { role: 'سوبر أدمن (المشرف العام)', email: 'admin@alzahrawi.edu.iq', password: '123456' },
        { role: 'عميد كلية الطب', email: 'dean.med@alzahrawi.edu.iq', password: '123456' },
        { role: 'رئيس قسم الجراحة', email: 'head.surgery@alzahrawi.edu.iq', password: '123456' },
        { role: 'تدريسي (أ.د. حيدر)', email: 'haider.k@alzahrawi.edu.iq', password: '123456' },
        { role: 'طالب (أحمد ليث)', email: 'ahmed.badri@student.alzahrawi.edu.iq', password: '123456' },
      ],
    });
  } catch (error: any) {
    console.error('Init error:', error);
    return NextResponse.json(
      {
        error: 'فشل تهيئة قاعدة البيانات',
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
