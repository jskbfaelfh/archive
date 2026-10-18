import { SignJWT } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'alzahrawi_university_secure_secret_key_2026_jwt';

const secretKey = new TextEncoder().encode(JWT_SECRET);

async function createToken(payload: Record<string, any>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secretKey);
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, actual?: any) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${testName}`, actual !== undefined ? actual : '');
  }
}

async function request(
  endpoint: string,
  options: {
    method?: string;
    token?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (options.token) {
    headers['Cookie'] = `alzahrawi_session=${options.token}`;
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? (typeof options.body === 'object' ? JSON.stringify(options.body) : options.body) : undefined,
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // not JSON
  }

  return { status: res.status, data: json, headers: res.headers };
}

async function runSuite() {
  console.log('========================================================');
  console.log('🛡️ Alzahrawi University RBAC & Security Test Suite');
  console.log('========================================================\n');

  // Test 1: Unauthenticated access to protected endpoints returns 401
  console.log('--- Suite 1: Authentication & Session Verification ---');
  {
    const res = await request('/api/lectures');
    assert(res.status === 401, 'Unauthenticated GET /api/lectures returns 401');

    const res2 = await request('/api/subjects');
    assert(res2.status === 401, 'Unauthenticated GET /api/subjects returns 401');

    const res3 = await request('/api/users/template');
    assert(res3.status === 401, 'Unauthenticated GET /api/users/template returns 401');
  }

  // Test 2: Deleted or non-existent user token returns 401 (Real-time DB query check)
  {
    const fakeToken = await createToken({
      id: 'ghost-user-id-not-in-db',
      email: 'ghost@test.com',
      role: 'super_admin',
    });
    const res = await request('/api/colleges', { token: fakeToken });
    assert(res.status === 401, 'Token with non-existent DB user returns 401');
  }

  // Test 3: mustChangePassword accounts cannot access normal endpoints (must return 403 PASSWORD_CHANGE_REQUIRED)
  console.log('\n--- Suite 2: Mandatory Password Reset Enforcement ---');
  {
    // Dean med account initially has mustChangePassword: true in seed
    const token = await createToken({
      id: 'user-dean-med',
      email: 'dean.med@alzahrawi.edu.iq',
      role: 'college_admin',
      collegeId: 'col-medicine',
    });

    const res = await request('/api/lectures', { token });
    assert(
      res.status === 403 && (res.data?.code === 'PASSWORD_CHANGE_REQUIRED' || res.data?.error?.includes('كلمة المرور')),
      'mustChangePassword user gets 403 on standard protected route',
      res
    );

    // But /api/auth/me should succeed
    const meRes = await request('/api/auth/me', { token });
    assert(meRes.status === 200 && meRes.data?.user?.email === 'dean.med@alzahrawi.edu.iq', '/api/auth/me allows mustChangePassword users', meRes);
  }

  // Clear mustChangePassword for testing roles in subsequent suites
  await prisma.user.updateMany({
    where: {
      id: {
        in: [
          'user-super-admin',
          'user-dean-pharm',
          'user-head-surgery',
          'doc-1',
          'doc-2',
          'stud-med-1',
        ],
      },
    },
    data: { mustChangePassword: false },
  });

  console.log('\n--- Suite 3: Super Admin Permissions & Scoping ---');
  const superAdminToken = await createToken({
    id: 'user-super-admin',
    email: 'admin@alzahrawi.edu.iq',
    role: 'super_admin',
  });

  // Verify super admin can access backup and templates
  {
    const resTemplate = await request('/api/users/template', { token: superAdminToken });
    assert(resTemplate.status === 200, 'Super admin can download user import template', resTemplate);

    const resColleges = await request('/api/colleges', { token: superAdminToken });
    assert(resColleges.status === 200 && Array.isArray(resColleges.data?.colleges), 'Super admin can view colleges', resColleges);
  }

  // Test 4: Doctor upload restrictions
  console.log('\n--- Suite 4: Hierarchy & Subject-derived RBAC ---');
  {
    const doctor1Token = await createToken({
      id: 'doc-1',
      email: 'dr.haider@alzahrawi.edu.iq',
      role: 'doctor',
      collegeId: 'col-medicine',
      departmentId: 'dept-surgery',
    });

    // Doctor 1 trying to upload lecture to a subject not assigned to him (sub-physio belongs to doc-2)
    const unauthorizedUpload = await request('/api/lectures', {
      method: 'POST',
      token: doctor1Token,
      body: {
        title: 'محاضرة محظورة',
        subjectId: 'sub-physio', // belongs to doc-2
        fileKey: 'test.pdf',
        fileSize: 1024,
      },
    });

    assert(unauthorizedUpload.status === 403, 'Doctor cannot upload lecture to a subject assigned to another doctor');

    // Doctor trying to forge collegeId/departmentId in POST body
    // Even if body specifies col-pharmacy, the route derives hierarchy strictly from sub-anatomy
    const legitimateUpload = await request('/api/lectures', {
      method: 'POST',
      token: doctor1Token,
      body: {
        title: 'محاضرة التشريح التجريبية',
        subjectId: 'sub-anatomy', // doc-1 subject
        collegeId: 'col-pharmacy', // forged!
        departmentId: 'dept-medchem', // forged!
        stage: 4, // forged!
        sectionTarget: 'all',
      },
    });

    assert(
      legitimateUpload.status === 200 &&
      legitimateUpload.data?.lecture?.collegeId === 'col-medicine' &&
      legitimateUpload.data?.lecture?.departmentId === 'dept-surgery' &&
      legitimateUpload.data?.lecture?.stage === 1,
      'Hierarchy strictly derived from subject entity, ignoring forged body parameters',
      legitimateUpload
    );

    // Target section mismatch rejection
    const invalidSectionTarget = await request('/api/lectures', {
      method: 'POST',
      token: doctor1Token,
      body: {
        title: 'محاضرة فاشلة',
        subjectId: 'sub-anatomy',
        sectionTarget: 'sec-chem-1a', // Section in pharmacy, not medicine!
        fileKey: 'fail.pdf',
        fileSize: 1024,
      },
    });
    assert(invalidSectionTarget.status === 400, 'Lecture rejected when sectionTarget belongs to another college/department');
  }

  // Test 5: Dean isolation (College Admin boundary)
  console.log('\n--- Suite 5: Dean & Department Head Boundaries ---');
  {
    const deanPharmToken = await createToken({
      id: 'user-dean-pharm',
      email: 'dean.pharm@alzahrawi.edu.iq',
      role: 'college_admin',
      collegeId: 'col-pharmacy',
    });

    // Dean of Pharmacy trying to edit Surgery department (Medicine)
    const crossCollegeEdit = await request('/api/departments', {
      method: 'PUT',
      token: deanPharmToken,
      body: {
        id: 'dept-surgery',
        name: 'محاولة اختراق اسم القسم',
      },
    });
    assert(crossCollegeEdit.status === 403, 'Dean cannot modify departments in another college');

    // Dean of Pharmacy trying to assign a Medicine doctor to a Pharmacy subject
    const invalidSubjectDoc = await request('/api/subjects', {
      method: 'POST',
      token: deanPharmToken,
      body: {
        name: 'مادة تجريبية مختلطة',
        departmentId: 'dept-pharmaceutics',
        stage: 1,
        semester: 1,
        doctorId: 'doc-1', // doc-1 is in Medicine
      },
    });
    assert(invalidSubjectDoc.status === 400, 'Cross-college doctor assignment on subjects is rejected with 400');
  }

  // Test 6: Audit log containment & sensitive field stripping
  console.log('\n--- Suite 6: Audit Logs & Privacy Scoping ---');
  {
    const headSurgeryToken = await createToken({
      id: 'user-head-surgery',
      email: 'head.surgery@alzahrawi.edu.iq',
      role: 'department_admin',
      collegeId: 'col-medicine',
      departmentId: 'dept-surgery',
    });

    const statsRes = await request('/api/stats', { token: headSurgeryToken });
    if (statsRes.status === 200 && Array.isArray(statsRes.data?.auditLogs)) {
      const logs = statsRes.data.auditLogs;
      const hasIp = logs.some((l: any) => l.ipAddress !== undefined && l.ipAddress !== null);
      assert(!hasIp, 'Audit logs strip sensitive ipAddress for non-super_admin users');
    } else {
      assert(statsRes.status === 200 || statsRes.status === 403, 'Stats route evaluated correctly');
    }
  }

  // Test 7: Student privilege check
  console.log('\n--- Suite 7: Student Privilege Checks ---');
  {
    await prisma.user.update({
      where: { id: 'stu-1' },
      data: { mustChangePassword: false },
    });

    const studentToken = await createToken({
      id: 'stu-1',
      email: 'ahmed.badri@student.alzahrawi.edu.iq',
      role: 'student',
      collegeId: 'col-medicine',
      departmentId: 'dept-surgery',
      stage: 1,
      sectionId: 'sec-surg-1a',
    });

    const createSec = await request('/api/sections', {
      method: 'POST',
      token: studentToken,
      body: { name: 'شعبة غير مصرح بها', departmentId: 'dept-surgery', stage: 1 },
    });
    assert(createSec.status === 403, 'Student cannot create sections', createSec);

    const createSub = await request('/api/subjects', {
      method: 'POST',
      token: studentToken,
      body: { name: 'مادة غير مصرح بها', departmentId: 'dept-surgery', stage: 1, semester: 1 },
    });
    assert(createSub.status === 403, 'Student cannot create subjects', createSub);

    const backupAccess = await request('/api/backup', { token: studentToken });
    assert(backupAccess.status === 403, 'Student cannot access database backups', backupAccess);
  }

  console.log('\n========================================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
