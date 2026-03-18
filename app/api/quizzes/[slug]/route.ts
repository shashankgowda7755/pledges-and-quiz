import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const quiz = await prisma.quiz.findUnique({
      where: { slug },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answerOptions: {
              select: { id: true, text: true, order: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });
    
    if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
  }
}
