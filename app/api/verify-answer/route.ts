import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  questionId: z.string()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId } = schema.parse(body);

    const correctOption = await prisma.answerOption.findFirst({
      where: { questionId, isCorrect: true }
    });

    if (!correctOption) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    return NextResponse.json({ correctOptionId: correctOption.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify' }, { status: 400 });
  }
}
