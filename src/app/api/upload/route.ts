import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
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
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. الأنواع المدعومة: PDF, PPTX, DOCX, MP4' },
        { status: 400 }
      );
    }

    // Target upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Safe sanitized unique filename
    const timestamp = Date.now();
    const safeBaseName = originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_')
      .slice(0, 50);
    const finalFileName = `${safeBaseName}_${timestamp}${ext}`;
    const filePath = path.join(uploadDir, finalFileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${finalFileName}`;
    const formattedSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    return NextResponse.json({
      success: true,
      fileName: originalName,
      fileUrl: relativeUrl,
      fileSize: formattedSize,
      fileType: ext.replace('.', ''),
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'فشل رفع الملف' }, { status: 500 });
  }
}
