// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file index.ts
 * @description نقطة الدخول لدالة core_university.superadmin كعامل مستقل
 * @created 2026-10-21
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'الطريقة غير مدعومة' }), { status: 405 });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json().catch(() => ({}));
    const email = body.email || 'admin@alzahrawi.edu.iq';
    const password = body.password || '123456';

    // Ensure superadmin in auth.users only (Never in staff_profiles)
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'super_admin', full_name: 'د. عقيل الزهراوي' },
    });

    if (error && !error.message.includes('already exists')) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم التحقق من حساب الإدارة العليا (SuperAdmin) بنجاح.',
        user: { email, role: 'super_admin' },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
