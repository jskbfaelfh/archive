import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const lecture = await prisma.lecture.findUnique({
      where: { id },
    });

    if (!lecture) {
      return NextResponse.json({ error: 'المحاضرة غير موجودة' }, { status: 404 });
    }

    // Increment downloads count on the server
    await prisma.lecture.update({
      where: { id },
      data: { downloadsCount: { increment: 1 } },
    });

    // Check if real file exists on disk
    if (lecture.filePath && lecture.filePath.startsWith('/uploads/')) {
      const diskPath = path.join(process.cwd(), 'public', lecture.filePath);
      try {
        const fileBuffer = await readFile(diskPath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Disposition': `attachment; filename="${encodeURIComponent(lecture.fileName)}"`,
            'Content-Type': 'application/octet-stream',
          },
        });
      } catch {
        // Fallback to generated content if seed file doesn't exist on disk yet
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
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
