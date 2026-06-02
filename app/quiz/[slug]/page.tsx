export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';

export async function generateMetadata(context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const quiz = await prisma.quiz.findUnique({ where: { slug } });
  if (!quiz) return {};
  
  return {
    title: `${quiz.title} | COMMUNITREE & EZONE`,
    description: quiz.description.slice(0, 155),
    openGraph: { images: [quiz.bgImageUrl] }
  };
}

export default async function QuizLandingPage(context: { params: Promise<{ slug: string }>; searchParams: Promise<{ org?: string }> }) {
  const { slug } = await context.params;
  const { org } = await context.searchParams;
  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    include: { _count: { select: { attempts: true, questions: true } } }
  });

  if (!quiz) notFound();

  // Org attribution is magic-link only — we never list partner orgs publicly.
  // A valid ?org=<slug> (shared by the org via the admin panel) auto-attributes;
  // everyone else takes the quiz as General Public.
  const attributedOrg = org
    ? await prisma.organization.findFirst({
        where: { slug: org, isActive: true },
        select: { name: true, slug: true },
      })
    : null;

  const takeHref = `/quiz/${quiz.slug}/take${attributedOrg ? `?org=${attributedOrg.slug}` : ''}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full flex flex-col">
        {/* A — Hero */}
        <section className="w-full min-h-[450px] relative flex flex-col items-center justify-center">
            {quiz.bgImageUrl && <img src={quiz.bgImageUrl} alt={quiz.title} className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80"></div>
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-16 mt-auto">
               <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest mb-6">
                 {quiz.category}
               </span>
               <h1 className="text-4xl md:text-6xl font-montserrat font-extrabold text-white mb-6 leading-tight shadow-sm">
                 {quiz.title}
               </h1>
               <div className="flex items-center justify-center gap-6 text-white/90 text-lg font-medium">
                  <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center text-sm">❓</span> {quiz._count.questions} Questions</span>
                  <span>•</span>
                  <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center text-sm">🏅</span> Certificate Included</span>
               </div>
            </div>
        </section>

        {/* B, C, D — Content & CTA */}
        <section className="max-w-3xl mx-auto px-4 py-20 text-center w-full">
          <p className="text-2xl text-gray-700 font-medium mb-12 leading-relaxed">
            {quiz.description}
          </p>
          
          <div className="bg-teal-50 text-teal-900 rounded-2xl p-6 mb-12 max-w-md mx-auto font-medium shadow-sm border border-teal-100">
             <p>No login required. Instant certificate.</p>
             <p className="mt-2 text-sm text-teal-700">{quiz._count.attempts.toLocaleString()} people have taken this quiz.</p>
          </div>

          {!quiz.isActive ? (
            <div className="max-w-md mx-auto rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-center">
              <p className="text-lg font-bold text-amber-800">🔒 This event is over</p>
              <p className="text-sm text-amber-700 mt-1">Entries are closed and no longer being accepted.</p>
            </div>
          ) : (
            <>
              {attributedOrg && (
                <div className="max-w-md mx-auto mb-8 flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-5 py-3 text-sm font-semibold text-teal-800 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Taking part as <span className="font-extrabold">{attributedOrg.name}</span>
                </div>
              )}

              <a href={takeHref} className="inline-block bg-teal-500 text-white rounded-full px-12 py-5 text-xl font-bold hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all hover:-translate-y-1">
                Start Quiz
              </a>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
