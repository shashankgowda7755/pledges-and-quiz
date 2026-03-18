import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { attempts: true, questions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
