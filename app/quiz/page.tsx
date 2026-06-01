export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';

const CATEGORIES = ['Environment', 'Health', 'Lifestyle'];

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = CATEGORIES.find(c => c.toLowerCase() === category?.toLowerCase());

  const quizzes = await prisma.quiz.findMany({
    where: {
      isActive: true,
      ...(activeCategory ? { category: activeCategory.toLowerCase() } : {}),
    },
    include: { _count: { select: { questions: true, attempts: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-page py-16 w-full">
        <div className="mb-10">
          <span className="eyebrow mb-3">Learn &amp; earn</span>
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-ink mb-3">Quizzes</h1>
          <p className="text-lg text-[color:var(--muted)] max-w-2xl">Test what you know about nature, answer a few questions, and download your certificate instantly.</p>
        </div>

        <div className="flex gap-3 mb-12 overflow-x-auto pb-2">
          <Link
            href="/quiz"
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${!activeCategory ? 'bg-forest text-white' : 'bg-white border border-[color:var(--line)] text-[color:var(--muted)] hover:border-forest/30'}`}
          >
            All
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/quiz?category=${cat.toLowerCase()}`}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-forest text-white' : 'bg-white border border-[color:var(--line)] text-[color:var(--muted)] hover:border-forest/30'}`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {quizzes.map(q => (
            <div key={q.id} className="card card-hover overflow-hidden flex flex-col group">
              <div className="h-48 overflow-hidden relative bg-[#eef6ef]">
                {q.bgImageUrl && <img src={q.bgImageUrl} alt={q.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <span className="absolute top-4 left-4 chip bg-white/90 backdrop-blur">{q.category}</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold font-montserrat text-ink mb-2">{q.title}</h3>
                <div className="flex items-center gap-3 text-sm text-[color:var(--muted)] mb-6 font-medium">
                  <span>{q._count.questions} questions</span>
                  <span>·</span>
                  <span>{q._count.attempts} completed</span>
                </div>
                <div className="mt-auto pt-4 border-t border-[color:var(--line)]">
                  <Link href={`/quiz/${q.slug}`} className="link-arrow w-full justify-between group/cta">
                    Take quiz <span className="group-hover/cta:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {quizzes.length === 0 && (
            <p className="text-[color:var(--muted)] col-span-3 py-12 text-center">No quizzes in this category yet. Check back soon!</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
