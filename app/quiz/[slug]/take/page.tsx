export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { QuizFlow } from '@/components/QuizFlow';
import prisma from '@/lib/prisma';

export async function generateMetadata(context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const quiz = await prisma.quiz.findUnique({ where: { slug } });
  if (!quiz) return {};

  return {
    title: `Take Quiz: ${quiz.title} | Communitree`,
  };
}

export default async function TakeQuizPage(context: { params: Promise<{ slug: string }>; searchParams: Promise<{ org?: string }> }) {
  const { slug } = await context.params;
  const { org: orgSlug } = await context.searchParams;

  const [quiz, org] = await Promise.all([
    prisma.quiz.findUnique({
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
        },
      }
    }),
    orgSlug ? prisma.organization.findUnique({ where: { slug: orgSlug } }) : null,
  ]);

  if (!quiz) notFound();

  const posterUrl = org?.quizPosterUrl ?? quiz.bgImageUrl;

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0E9] relative">
      <Header />
      <div className="flex-1">
        <QuizFlow quiz={quiz} orgId={org?.id} posterUrl={posterUrl} />
      </div>
    </div>
  );
}
