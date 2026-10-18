import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const lecture = await prisma.lecture.findUnique({
      where: { id },
    });

    if (!lecture) {
      return NextResponse.json({ error: 'المحاضرة غير موجودة' }, { status: 404 });
    }

    // Role-based Access Control Guard
    let isAllowed = false;
    if (user.role === 'super_admin') {
      isAllowed = true;
    } else if (user.role === 'college_admin') {
      isAllowed = lecture.collegeId === user.collegeId;
    } else if (user.role === 'department_admin') {
      isAllowed = lecture.collegeId === user.collegeId && lecture.departmentId === user.departmentId;
    } else if (user.role === 'doctor') {
      // Doctor can ONLY download lectures belonging to their assigned subjects or authored by them
      const isAssignedSubject = await prisma.subject.findFirst({
        where: { id: lecture.subjectId, doctorId: user.id },
      });
      isAllowed = Boolean(isAssignedSubject || lecture.doctorId === user.id);
    } else if (user.role === 'student') {
      const sameDept = lecture.collegeId === user.collegeId && lecture.departmentId === user.departmentId;
      const sameStage = lecture.stage === user.stage;
      const sameSection = lecture.sectionTarget === 'all' || lecture.sectionTarget === user.sectionId;
      isAllowed = sameDept && sameStage && sameSection;
    }

    if (!isAllowed) {
      return NextResponse.json({ error: 'غير مصرح لك بتحميل هذه المحاضرة' }, { status: 403 });
    }

    // Increment downloads count ONLY after authorization check passes
    await prisma.lecture.update({
      where: { id },
      data: { downloadsCount: { increment: 1 } },
    });

    // Check if real file exists on private storage disk
    if (lecture.filePath) {
      const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
      const safeKey = path.basename(lecture.filePath.trim());
      const diskPath = path.resolve(UPLOADS_DIR, safeKey);

      // Strict containment check against Path Traversal
      if (diskPath.startsWith(UPLOADS_DIR) && !safeKey.includes('..')) {
        try {
          const fileBuffer = await readFile(diskPath);
          const ext = path.extname(lecture.fileName).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.mp4': 'video/mp4',
          };

          return new NextResponse(fileBuffer, {
            headers: {
              'Content-Disposition': `attachment; filename="${encodeURIComponent(lecture.fileName)}"`,
              'Content-Type': mimeTypes[ext] || 'application/octet-stream',
              'X-Content-Type-Options': 'nosniff',
            },
          });
        } catch {
          // Fallback to generated academic summary if file not yet present on disk
        }
      }
    }

    // Default generated academic summary text file for seeded lectures
    const content = `جامعة الزهراوي - منظومة أرشفة المحاضرات الأكاديمية
المحاضرة: ${lecture.title}
المقرر: ${lecture.subjectName || ''}
التدريسي: ${lecture.doctorName}
المرحلة والشعبة: ${lecture.stage} - ${lecture.sectionName || ''}
تاريخ الرفع: ${lecture.uploadDate}
الوصف: ${lecture.description || 'لا يوجد وصف مضاف'}`;

    return new NextResponse(content, {
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(lecture.fileName)}.txt"`,
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }
    console.error('Download error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحميل الملف' }, { status: 500 });
  }
}
