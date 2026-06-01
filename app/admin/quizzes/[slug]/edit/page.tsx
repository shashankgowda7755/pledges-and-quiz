import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AddQuizForm from '../../new/AddQuizForm';

export const dynamic = 'force-dynamic';

export default async function EditQuizPage(context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  const [quiz, events] = await Promise.all([
    prisma.quiz.findUnique({
      where: { slug },
      include: { questions: { orderBy: { order: 'asc' }, include: { answerOptions: { orderBy: { order: 'asc' } } } } },
    }),
    prisma.event.findMany({ where: { isActive: true }, orderBy: { startDate: 'asc' }, select: { id: true, title: true } }),
  ]);

  if (!quiz) notFound();

  return (
    <div className="pb-16 animate-in fade-in duration-500 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/quizzes" className="text-teal-600 hover:text-teal-700 text-sm font-semibold mb-4 inline-block flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Quizzes
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Edit Quiz</h1>
        <p className="text-gray-500 text-sm mt-2">Update details, poster, questions, and certificate layout.</p>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
        <AddQuizForm
          events={events}
          initialData={{
            slug: quiz.slug,
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            bgImageUrl: quiz.bgImageUrl,
            eventId: quiz.eventId,
            certConfig: quiz.certConfig,
            questions: quiz.questions.map(q => ({
              text: q.text,
              options: q.answerOptions.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
            })),
          }}
        />
      </div>
    </div>
  );
}
