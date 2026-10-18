import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Refresh latest user data from DB
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      collegeId: true,
      departmentId: true,
      stage: true,
      sectionId: true,
      sectionName: true,
    },
  });

  return NextResponse.json({ user });
}
