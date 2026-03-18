import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  quizId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  whatsapp: z.string().optional(),
  agreed: z.boolean().optional(),
  orgId: z.string().optional(),
  answers: z.record(z.string(), z.string())
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const existing = await prisma.quizAttempt.findUnique({
      where: {
        userEmail_quizId: {
          userEmail: data.userEmail,
          quizId: data.quizId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ id: existing.id, score: existing.score, totalQuestions: existing.totalQuestions });
    }

    // Calculate score
    const questions = await prisma.question.findMany({
      where: { quizId: data.quizId },
      include: { answerOptions: true }
    });

    let score = 0;
    for (const q of questions) {
      const correctOpt = q.answerOptions.find(o => o.isCorrect);
      if (correctOpt && data.answers[q.id] === correctOpt.id) {
        score += 1;
      }
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: data.quizId,
        userName: data.userName,
        userEmail: data.userEmail,
        whatsapp: data.whatsapp,
        agreed: data.agreed || false,
        ...(data.orgId && { orgId: data.orgId }),
        score,
        totalQuestions: questions.length
      }
    });

    return NextResponse.json({ id: attempt.id, score, totalQuestions: questions.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 400 });
  }
}
