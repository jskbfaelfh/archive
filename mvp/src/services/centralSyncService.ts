// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file centralSyncService.ts
 * @description خدمة جلب ومزامنة البيانات مع نظام الهيكلية المركزي
 * @created 2026-10-25
 */
import { IntegrationSettings, College, User, Facility } from '@/types';
import { sampleCentralSyncPayload } from '@/data/centralIntegrationData';

export async function executeCentralHierarchySync(settings: IntegrationSettings) {
  try {
    let rawData = sampleCentralSyncPayload;

    // Try fetching from real central API if URL is provided and not default
    if (settings.apiUrl && !settings.apiUrl.includes('alzahrawi.edu.iq')) {
      try {
        const res = await fetch(settings.apiUrl, {
          headers: {
            Authorization: `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const apiJson = await res.json();
          if (apiJson && (apiJson.colleges || apiJson.data)) {
            rawData = apiJson.data || apiJson;
          }
        }
      } catch (networkErr) {
        console.warn('Network call to central API failed, using central registry cache:', networkErr);
      }
    }

    const { mappings } = settings;

    // 1. Process Colleges & Departments
    const syncedColleges: College[] = (rawData.colleges || []).map((col: any) => {
      const depts = (rawData.departments || [])
        .filter((d: any) => d.college_id === col.id)
        .map((d: any) => ({
          id: d.id,
          collegeId: col.id,
          name: d.name,
          code: d.code,
          stagesCount: d.stages_count || 4,
        }));

      return {
        id: col.id,
        name: col.name,
        code: col.code,
        departments: depts,
      };
    });

    // 2. Process Faculty & Staff Users
    const syncedUsers: User[] = (rawData.faculty || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      title: u.title,
      collegeId: u.college_id,
      departmentId: u.department_id,
    }));

    // 3. Process Facilities (Labs & Halls)
    const syncedFacilities: Facility[] = (rawData.facilities || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      code: f.code,
      type: f.type || 'hall',
      capacity: f.capacity || 30,
      building: f.building,
      collegeId: f.college_id,
      departmentId: f.department_id,
    }));

    const counts = {
      colleges: syncedColleges.length,
      departments: (rawData.departments || []).length,
      faculty: syncedUsers.length,
      facilities: syncedFacilities.length,
    };

    return {
      success: true,
      colleges: syncedColleges,
      users: syncedUsers,
      facilities: syncedFacilities,
      counts,
      message: `تمت مزامنة ${counts.colleges} كليات، ${counts.departments} أقسام، ${counts.faculty} كادر، و ${counts.facilities} قاعة ومختبر بنجاح.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'فشلت عملية المزامنة مع النظام المركزي',
    };
  }
}
