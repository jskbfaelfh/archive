import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, handleApiError } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    // Only administrators can see full stats
    const isAdmin = ['super_admin', 'college_admin', 'department_admin'].includes(user.role);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك بعرض الإحصائيات' }, { status: 403 });
    }

    const collegeFilter = user.role === 'super_admin' ? {} : { collegeId: user.collegeId || '' };
    const deptFilter =
      user.role === 'department_admin'
        ? { collegeId: user.collegeId || '', departmentId: user.departmentId || '' }
        : collegeFilter;

    const auditLogWhere = user.role === 'super_admin' ? {} : { user: { is: deptFilter } };

    const [
      collegesCount,
      departmentsCount,
      usersCount,
      doctorsCount,
      studentsCount,
      lecturesCount,
      topDownloadedLectures,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.college.count(),
      prisma.department.count({ where: collegeFilter }),
      prisma.user.count({ where: deptFilter }),
      prisma.user.count({ where: { ...deptFilter, role: 'doctor' } }),
      prisma.user.count({ where: { ...deptFilter, role: 'student' } }),
      prisma.lecture.count({ where: deptFilter }),
      prisma.lecture.findMany({
        where: deptFilter,
        orderBy: { downloadsCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          subjectName: true,
          doctorName: true,
          downloadsCount: true,
          viewsCount: true,
        },
      }),
      prisma.auditLog.findMany({
        where: auditLogWhere,
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          userName: true,
          userRole: true,
          action: true,
          target: true,
          details: true,
          createdAt: true,
          ...(user.role === 'super_admin' ? { ipAddress: true } : {}),
        },
      }),
    ]);

    return NextResponse.json({
      collegesCount,
      departmentsCount,
      usersCount,
      doctorsCount,
      studentsCount,
      lecturesCount,
      topDownloadedLectures,
      recentAuditLogs,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
