import { SignJWT } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'alzahrawi_university_secure_secret_key_2026_jwt';
const secretKey = new TextEncoder().encode(JWT_SECRET);

async function createToken(payload: Record<string, any>): Promise<string> {
  return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1d').sign(secretKey);
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

async function request(endpoint: string, options: { method?: string; token?: string; body?: any; headers?: Record<string, string> } = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = { ...(options.headers || {}) };
  if (options.token) headers['Cookie'] = `alzahrawi_session=${options.token}`;
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? (typeof options.body === 'object' ? JSON.stringify(options.body) : options.body) : undefined,
  });
  let json: any = null;
  try { json = await res.json(); } catch { /* not JSON */ }
  return { status: res.status, data: json, headers: res.headers };
}

async function runSuite() {
  console.log('🛡️ Alzahrawi University RBAC & Security Test Suite\n');

  // Suite 1: Authentication & Session Verification
  console.log('--- Suite 1: Authentication & Session Verification ---');
  const res1 = await request('/api/lectures');
  assert(res1.status === 401, 'Unauthenticated GET /api/lectures returns 401');
  const res2 = await request('/api/subjects');
  assert(res2.status === 401, 'Unauthenticated GET /api/subjects returns 401');
  const res3 = await request('/api/users/template');
  assert(res3.status === 401, 'Unauthenticated GET /api/users/template returns 401');

  const fakeToken = await createToken({ id: 'ghost-user-id-not-in-db', email: 'ghost@test.com', role: 'super_admin' });
  const ghostRes = await request('/api/colleges', { token: fakeToken });
  assert(ghostRes.status === 401, 'Token with non-existent DB user returns 401');

  // Suite 2: Mandatory Password Reset Enforcement
  console.log('\n--- Suite 2: Mandatory Password Reset Enforcement ---');
  const deanToken = await createToken({ id: 'user-dean-med', email: 'dean.med@alzahrawi.edu.iq', role: 'college_admin', collegeId: 'col-medicine' });
  const pwRes = await request('/api/lectures', { token: deanToken });
  assert(pwRes.status === 403 && (pwRes.data?.code === 'PASSWORD_CHANGE_REQUIRED' || pwRes.data?.error?.includes('كلمة المرور')), 'mustChangePassword user gets 403 on standard protected route');
  const meRes = await request('/api/auth/me', { token: deanToken });
  assert(meRes.status === 200 && meRes.data?.user?.email === 'dean.med@alzahrawi.edu.iq', '/api/auth/me allows mustChangePassword users');

  // Clear mustChangePassword for subsequent suites
  await prisma.user.updateMany({
    where: { id: { in: ['user-super-admin', 'user-dean-pharm', 'user-head-surgery', 'doc-1', 'doc-2', 'stud-med-1'] } },
    data: { mustChangePassword: false },
  });

  // Suite 3: Super Admin Permissions
  console.log('\n--- Suite 3: Super Admin Permissions & Scoping ---');
  const superAdminToken = await createToken({ id: 'user-super-admin', email: 'admin@alzahrawi.edu.iq', role: 'super_admin' });
  const resTemplate = await request('/api/users/template', { token: superAdminToken });
  assert(resTemplate.status === 200, 'Super admin can download user import template');
  const resColleges = await request('/api/colleges', { token: superAdminToken });
  assert(resColleges.status === 200 && Array.isArray(resColleges.data?.colleges), 'Super admin can view colleges');

  // Suite 4: Hierarchy & Subject-derived RBAC
  console.log('\n--- Suite 4: Hierarchy & Subject-derived RBAC ---');
  const doctor1Token = await createToken({ id: 'doc-1', email: 'dr.haider@alzahrawi.edu.iq', role: 'doctor', collegeId: 'col-medicine', departmentId: 'dept-surgery' });
  const unauthorizedUpload = await request('/api/lectures', {
    method: 'POST',
    token: doctor1Token,
    body: { title: 'محاضرة محظورة', subjectId: 'sub-physio', fileKey: 'test.pdf', fileSize: 1024 },
  });
  assert(unauthorizedUpload.status === 403, 'Doctor cannot upload lecture to a subject assigned to another doctor');

  const legitimateUpload = await request('/api/lectures', {
    method: 'POST',
    token: doctor1Token,
    body: { title: 'محاضرة التشريح التجريبية', subjectId: 'sub-anatomy', collegeId: 'col-pharmacy', departmentId: 'dept-medchem', stage: 4, sectionTarget: 'all' },
  });
  assert(
    legitimateUpload.status === 200 &&
    legitimateUpload.data?.lecture?.collegeId === 'col-medicine' &&
    legitimateUpload.data?.lecture?.departmentId === 'dept-surgery' &&
    legitimateUpload.data?.lecture?.stage === 1,
    'Hierarchy strictly derived from subject entity, ignoring forged body parameters'
  );

  // Suite 5: Dean Scope Enforcement
  console.log('\n--- Suite 5: Dean & Department Cross-Tenant Isolation ---');
  const pharmacyDeanToken = await createToken({ id: 'user-dean-pharm', email: 'dean.pharm@alzahrawi.edu.iq', role: 'college_admin', collegeId: 'col-pharmacy' });
  const crossCollegeDept = await request('/api/departments', {
    method: 'POST',
    token: pharmacyDeanToken,
    body: { name: 'قسم متسلل', collegeId: 'col-medicine' },
  });
  assert(crossCollegeDept.status === 403, 'Dean cannot create departments outside their assigned college');

  const crossCollegeDoctor = await request('/api/users', {
    method: 'POST',
    token: pharmacyDeanToken,
    body: { name: 'دكتور تجريبي', email: 'fake.doc@alzahrawi.edu.iq', role: 'doctor', collegeId: 'col-medicine', departmentId: 'dept-surgery' },
  });
  assert(crossCollegeDoctor.status === 403, 'Dean cannot create user in another college');

  const headSurgeryToken = await createToken({ id: 'user-head-surgery', email: 'head.surgery@alzahrawi.edu.iq', role: 'department_admin', collegeId: 'col-medicine', departmentId: 'dept-surgery' });
  const crossDeptSection = await request('/api/sections', {
    method: 'POST',
    token: headSurgeryToken,
    body: { name: 'شعبة تجريبية', departmentId: 'dept-internal', stage: 1 },
  });
  assert(crossDeptSection.status === 403, 'Department admin cannot manage sections for another department');

  const invalidSubjectDoc = await request('/api/subjects', {
    method: 'POST',
    token: headSurgeryToken,
    body: { name: 'مادة تجريبية', departmentId: 'dept-surgery', stage: 1, semester: 1, doctorId: 'doc-pharm-1' },
  });
  assert(invalidSubjectDoc.status === 400, 'Cross-college doctor assignment on subjects is rejected with 400');

  // Suite 6: Audit Logs & Privacy Scoping
  console.log('\n--- Suite 6: Audit Logs & Privacy Scoping ---');
  const statsRes = await request('/api/stats', { token: headSurgeryToken });
  if (statsRes.status === 200 && Array.isArray(statsRes.data?.auditLogs)) {
    const hasIp = statsRes.data.auditLogs.some((l: any) => l.ipAddress !== undefined && l.ipAddress !== null);
    assert(!hasIp, 'Audit logs strip sensitive ipAddress for non-super_admin users');
  } else {
    assert(statsRes.status === 200 || statsRes.status === 403, 'Stats route evaluated correctly');
  }

  // Suite 7: Student Privilege Checks
  console.log('\n--- Suite 7: Student Privilege Checks ---');
  await prisma.user.update({ where: { id: 'stu-1' }, data: { mustChangePassword: false } });
  const studentToken = await createToken({
    id: 'stu-1',
    email: 'ahmed.badri@student.alzahrawi.edu.iq',
    role: 'student',
    collegeId: 'col-medicine',
    departmentId: 'dept-surgery',
    stage: 1,
    sectionId: 'sec-surg-1a',
  });

  const createSec = await request('/api/sections', { method: 'POST', token: studentToken, body: { name: 'شعبة غير مصرح بها', departmentId: 'dept-surgery', stage: 1 } });
  assert(createSec.status === 403, 'Student cannot create sections');

  const createSub = await request('/api/subjects', { method: 'POST', token: studentToken, body: { name: 'مادة غير مصرح بها', departmentId: 'dept-surgery', stage: 1, semester: 1 } });
  assert(createSub.status === 403, 'Student cannot create subjects');

  const backupAccess = await request('/api/backup', { token: studentToken });
  assert(backupAccess.status === 403, 'Student cannot access database backups');

  console.log(`\n📊 Test Results: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});