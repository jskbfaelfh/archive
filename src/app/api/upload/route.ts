import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role === 'student') {
      return NextResponse.json({ error: 'الطلاب ليس لديهم صلاحية رفع ملفات' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرسال أي ملف' }, { status: 400 });
    }

    // Size limit: 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'حجم الملف يتجاوز الحد المسموح به (50 ميجابايت)' }, { status: 400 });
    }

    // Extension check
    const allowedExtensions = ['.pdf', '.pptx', '.ppt', '.docx', '.mp4'];
    const originalName = path.basename(file.name);
    const ext = path.extname(originalName).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. الأنواع المدعومة: PDF, PPTX, DOCX, MP4' },
        { status: 400 }
      );
    }

    // Target private storage directory (OUTSIDE public to prevent unauthenticated direct downloads)
    const uploadDir = path.resolve(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Cryptographically secure random file key bound to user ID
    const safeUserId = user.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const fileKey = `up_${safeUserId}_${crypto.randomUUID()}${ext}`;
    const targetFilePath = path.resolve(uploadDir, fileKey);

    // Guard against directory traversal
    if (!targetFilePath.startsWith(uploadDir)) {
      return NextResponse.json({ error: 'مسار ملف غير صالح' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(targetFilePath, buffer);

    const formattedSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    return NextResponse.json({
      success: true,
      fileKey,
      fileName: originalName,
      fileSize: formattedSize,
      fileType: ext.replace('.', ''),
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
