import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const org = await prisma.organization.upsert({
    where: { slug: 'sparrow-rotary' },
    update: { quizPosterUrl: '/images/quizzes/sparrow-rotary.png' },
    create: {
      slug: 'sparrow-rotary',
      name: 'Sparrow Rotary',
      contactEmail: 'contact@sparrowrotary.org',
      type: 'ngo',
      quizPosterUrl: '/images/quizzes/sparrow-rotary.png',
      isActive: true,
    },
  });
  return NextResponse.json({ ok: true, org });
}
