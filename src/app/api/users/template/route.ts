import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireRole, handleApiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['super_admin', 'college_admin', 'department_admin']);

    const sampleData = [
      {
        الاسم: 'علي حسين العامري',
        البريد: 'ali.alamiri@student.alzahrawi.edu.iq',
        الدور: 'طالب', // طالب أو تدريسي
        الكلية: 'كلية الطب البشري',
        القسم: 'قسم الجراحة العامة',
        المرحلة: 1,
        الشعبة: 'شعبة (أ)',
      },
      {
        الاسم: 'فاطمة كريم الموسوي',
        البريد: 'fatima.karim@student.alzahrawi.edu.iq',
        الدور: 'طالب',
        الكلية: 'كلية الطب البشري',
        القسم: 'قسم الجراحة العامة',
        المرحلة: 1,
        الشعبة: 'شعبة (ب)',
      },
      {
        الاسم: 'د. ليث جعفر الخفاجي',
        البريد: 'laith.j@alzahrawi.edu.iq',
        الدور: 'تدريسي',
        الكلية: 'كلية الصيدلة',
        القسم: 'قسم الصيدلانيات والسموم',
        المرحلة: '',
        الشعبة: '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'قالب استيراد المستخدمين');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Disposition': 'attachment; filename="alzahrawi_users_template.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
