import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim();
    const stage = searchParams.get('stage');

    // Build role-scoped WHERE condition on the SERVER
    let whereClause: any = {};

    if (user.role === 'super_admin') {
      whereClause = {};
    } else if (user.role === 'college_admin') {
      whereClause.collegeId = user.collegeId;
    } else if (user.role === 'department_admin') {
      whereClause.collegeId = user.collegeId;
      whereClause.departmentId = user.departmentId;
    } else if (user.role === 'doctor') {
      // Doctor can ONLY see lectures of their assigned subjects
      const doctorSubjects = await prisma.subject.findMany({
        where: { doctorId: user.id },
        select: { id: true },
      });
      const subjectIds = doctorSubjects.map((s) => s.id);
      whereClause = {
        collegeId: user.collegeId,
        departmentId: user.departmentId,
        subjectId: { in: subjectIds },
      };
    } else if (user.role === 'student') {
      // Student can ONLY see lectures of their college, department, stage, and their section or 'all'
      whereClause = {
        collegeId: user.collegeId,
        departmentId: user.departmentId,
        stage: user.stage || 1,
        OR: [
          { sectionTarget: 'all' },
          { sectionTarget: user.sectionId || '' },
        ],
      };
    }

    // Optional search query & stage filter
    if (search) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { subjectName: { contains: search } },
            { doctorName: { contains: search } },
          ],
        },
      ];
    }

    if (stage && user.role !== 'student') {
      whereClause.stage = Number(stage);
    }

    const lectures = await prisma.lecture.findMany({
      where: whereClause,
      orderBy: { uploadDate: 'desc' },
    });

    return NextResponse.json({ lectures });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role === 'student') {
      return NextResponse.json({ error: 'الطلاب ليس لديهم صلاحية رفع المحاضرات' }, { status: 403 });
    }

    const data = await req.json();
    const { title, description, collegeId, departmentId, stage, subjectId, sectionTarget, fileName, fileSize, filePath } = data;

    if (!title || !collegeId || !departmentId || !subjectId) {
      return NextResponse.json({ error: 'جميع حقول التسلسل الأكاديمي وعنوان المحاضرة مطلوبة' }, { status: 400 });
    }

    // Server-side check if doctor is assigned to this subject
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: 'المادة الدراسية غير موجودة' }, { status: 404 });
    }

    if (user.role === 'doctor') {
      if (subject.doctorId !== user.id) {
        return NextResponse.json({ error: 'لا يمكنك رفع محاضرة لمادة غير مسندة إليك' }, { status: 403 });
      }
    } else if (user.role === 'department_admin') {
      if (departmentId !== user.departmentId || collegeId !== user.collegeId) {
        return NextResponse.json({ error: 'غير مصرح لك برفع محاضرات خارج قسمك' }, { status: 403 });
      }
    } else if (user.role === 'college_admin') {
      if (collegeId !== user.collegeId) {
        return NextResponse.json({ error: 'غير مصرح لك برفع محاضرات خارج كليتك' }, { status: 403 });
      }
    }

    // Resolve section name
    let sectionName = 'كافة الشُعب';
    if (sectionTarget && sectionTarget !== 'all') {
      const sec = await prisma.section.findUnique({ where: { id: sectionTarget } });
      if (sec) sectionName = sec.name;
    }

    const resolvedFileName = fileName || `${title.trim()}.pdf`;
    const ext = resolvedFileName.split('.').pop()?.toLowerCase() || 'pdf';
    const detectedFileType = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'mp4', 'zip'].includes(ext) ? ext : 'pdf';

    // Strict validation of fileKey / filePath: path traversal check, disk existence, and uploader ownership
    let safeFileKey: string | null = null;
    const rawKey = data.fileKey || filePath;
    if (typeof rawKey === 'string' && rawKey.trim()) {
      const baseKey = path.basename(rawKey.trim());
      if (baseKey && !rawKey.includes('..') && !rawKey.includes('/') && !rawKey.includes('\\')) {
        const uploadDir = path.resolve(process.cwd(), 'uploads');
        const diskPath = path.resolve(uploadDir, baseKey);

        // 1. Check disk containment and existence
        if (!diskPath.startsWith(uploadDir) || !existsSync(diskPath)) {
          return NextResponse.json({ error: 'الملف المرفق غير موجود على الخادم' }, { status: 400 });
        }

        // 2. Check ownership: ensure this file was uploaded by the current user (or super_admin)
        const safeUserId = user.id.replace(/[^a-zA-Z0-9_-]/g, '');
        if (baseKey.startsWith('up_') && !baseKey.startsWith(`up_${safeUserId}_`) && user.role !== 'super_admin') {
          return NextResponse.json({ error: 'غير مصرح لك بربط ملف لم تقم برفعه' }, { status: 403 });
        }

        safeFileKey = baseKey;
      }
    }

    const newLecture = await prisma.lecture.create({
      data: {
        id: `lec-${crypto.randomUUID()}`,
        title: title.trim(),
        description: description?.trim() || null,
        collegeId,
        departmentId,
        stage: Number(stage),
        subjectId,
        subjectName: subject.name,
        sectionTarget: sectionTarget || 'all',
        sectionName,
        doctorId: user.id,
        doctorName: user.name,
        fileType: data.fileType || detectedFileType,
        fileName: resolvedFileName,
        fileSize: fileSize || '3.5 MB',
        filePath: safeFileKey,
        uploadDate: new Date().toISOString().split('T')[0],
        viewsCount: 1,
        downloadsCount: 0,
      },
    });

    // Notify targeted students
    try {
      const targetStudents = await prisma.user.findMany({
        where: {
          role: 'student',
          collegeId,
          departmentId,
          stage: Number(stage),
          ...(sectionTarget && sectionTarget !== 'all' ? { sectionId: sectionTarget } : {}),
        },
        select: { id: true },
      });

      if (targetStudents.length > 0) {
        await prisma.notification.createMany({
          data: targetStudents.map((st) => ({
            userId: st.id,
            title: `محاضرة جديدة: ${subject.name}`,
            message: `أضاف التدريسي ${user.name} محاضرة جديدة بعنوان "${newLecture.title}".`,
            link: `/lectures`,
            isRead: false,
          })),
        });
      }
    } catch (notifErr) {
      console.error('Failed to dispatch notifications:', notifErr);
    }

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPLOAD_LECTURE',
      target: newLecture.title,
      details: `إيداع محاضرة لمادة: ${subject.name} (${sectionName})`,
    });

    return NextResponse.json({ lecture: newLecture });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }
    console.error('Lecture upload error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء رفع المحاضرة' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await req.json();

    const existing = await prisma.lecture.findUnique({ where: { id: data.id } });
    if (!existing) return NextResponse.json({ error: 'المحاضرة غير موجودة' }, { status: 404 });

    // Validate edit permissions
    const canEdit =
      user.role === 'super_admin' ||
      (user.role === 'college_admin' && existing.collegeId === user.collegeId) ||
      (user.role === 'department_admin' && existing.departmentId === user.departmentId) ||
      (user.role === 'doctor' && existing.doctorId === user.id);

    if (!canEdit) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل هذه المحاضرة' }, { status: 403 });
    }

    let sectionName = existing.sectionName;
    if (data.sectionTarget && data.sectionTarget !== existing.sectionTarget) {
      if (data.sectionTarget === 'all') {
        sectionName = 'كافة الشُعب';
      } else {
        const sec = await prisma.section.findUnique({ where: { id: data.sectionTarget } });
        if (sec) sectionName = sec.name;
      }
    }

    const updated = await prisma.lecture.update({
      where: { id: data.id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        description: data.description !== undefined ? data.description.trim() : undefined,
        sectionTarget: data.sectionTarget !== undefined ? data.sectionTarget : undefined,
        sectionName,
      },
    });

    return NextResponse.json({ lecture: updated });
  } catch (error) {
    console.error('Lecture update error:', error);
    return NextResponse.json({ error: 'حدث خطأ في السيرفر أثناء تعديل المحاضرة' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

    const existing = await prisma.lecture.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'المحاضرة غير موجودة' }, { status: 404 });

    const canDelete =
      user.role === 'super_admin' ||
      (user.role === 'college_admin' && existing.collegeId === user.collegeId) ||
      (user.role === 'department_admin' && existing.departmentId === user.departmentId) ||
      (user.role === 'doctor' && existing.doctorId === user.id);

    if (!canDelete) {
      return NextResponse.json({ error: 'غير مصرح لك بحذف هذه المحاضرة' }, { status: 403 });
    }

    await prisma.lecture.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE_LECTURE',
      target: existing.title,
      details: `حذف محاضرة: ${existing.title}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
