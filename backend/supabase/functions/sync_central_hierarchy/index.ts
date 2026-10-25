// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file index.ts
 * @description دالة Supabase Edge Function للمزامنة التلقائية مع نظام الهيكلية المركزي
 * @created 2026-10-25
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

interface SyncPayload {
  apiKey?: string;
  triggerType?: 'manual' | 'automatic' | 'webhook';
  selectedTables?: string[];
  data?: {
    colleges?: Array<{ id: string; name: string; code?: string; dean_name?: string }>;
    departments?: Array<{ id: string; college_id: string; name: string; code?: string; stages_count?: number }>;
    faculty?: Array<{ id: string; name: string; email: string; role: string; title?: string; college_id?: string; department_id?: string }>;
    facilities?: Array<{ id: string; name: string; code?: string; type: 'hall' | 'lab'; capacity?: number; building?: string; college_id: string; department_id?: string }>;
  };
}

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'طريقة الطلب غير مدعومة' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: SyncPayload = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    // Verify system or provided API Key
    const configuredApiKey = Deno.env.get('CENTRAL_HIERARCHY_API_KEY') || 'zh_sec_live_98a72b4c10ef9a3';
    const isValidKey = token === configuredApiKey || body.apiKey === configuredApiKey;

    if (!isValidKey && Deno.env.get('ENVIRONMENT') === 'production') {
      return new Response(JSON.stringify({ error: 'مفتاح API غير مصرح به للمزامنة المركزية' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data } = body;
    let syncedColleges = 0;
    let syncedDepartments = 0;
    let syncedFaculty = 0;
    let syncedFacilities = 0;

    // 1. Sync Colleges
    if (data?.colleges && data.colleges.length > 0) {
      for (const col of data.colleges) {
        await supabaseAdmin.from('colleges').upsert({
          id: col.id,
          name: col.name,
          code: col.code || null,
        }, { onConflict: 'id' });
        syncedColleges++;
      }
    }

    // 2. Sync Departments
    if (data?.departments && data.departments.length > 0) {
      for (const dept of data.departments) {
        await supabaseAdmin.from('departments').upsert({
          id: dept.id,
          college_id: dept.college_id,
          name: dept.name,
          code: dept.code || null,
          stages_count: dept.stages_count || 4,
        }, { onConflict: 'id' });
        syncedDepartments++;
      }
    }

    // 3. Sync Faculty & Staff Profiles
    if (data?.faculty && data.faculty.length > 0) {
      for (const fac of data.faculty) {
        await supabaseAdmin.from('staff_profiles').upsert({
          id: fac.id,
          full_name: fac.name,
          email: fac.email,
          role: fac.role,
          title: fac.title || null,
          college_id: fac.college_id || null,
          department_id: fac.department_id || null,
        }, { onConflict: 'email' });
        syncedFaculty++;
      }
    }

    // 4. Sync Facilities (Halls & Labs)
    if (data?.facilities && data.facilities.length > 0) {
      for (const fac of data.facilities) {
        await supabaseAdmin.from('facilities').upsert({
          id: fac.id,
          college_id: fac.college_id,
          department_id: fac.department_id || null,
          name: fac.name,
          code: fac.code || null,
          type: fac.type,
          capacity: fac.capacity || 30,
          building: fac.building || null,
        }, { onConflict: 'id' });
        syncedFacilities++;
      }
    }

    const totalSynced = syncedColleges + syncedDepartments + syncedFaculty + syncedFacilities;

    // Log to sync_logs
    await supabaseAdmin.from('sync_logs').insert({
      source: 'central_hierarchy',
      trigger_type: body.triggerType || 'webhook',
      status: 'success',
      synced_items_count: totalSynced,
      details: `تمت مزامنة ${syncedColleges} كليات، ${syncedDepartments} أقسام، ${syncedFaculty} كادر، ${syncedFacilities} قاعات ومختبرات بنجاح.`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تمت عملية المزامنة من نظام الهيكلية المركزي بنجاح.',
        syncedAt: new Date().toISOString(),
        counts: {
          colleges: syncedColleges,
          departments: syncedDepartments,
          faculty: syncedFaculty,
          facilities: syncedFacilities,
          total: totalSynced,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
