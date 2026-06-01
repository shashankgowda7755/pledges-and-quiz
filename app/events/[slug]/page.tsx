export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';

export default async function EventLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      hostOrg: { select: { name: true } },
      pledges: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
      quizzes: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!event || !event.isActive) notFound();

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(d));

  const dateLabel = event.endDate
    ? `${fmt(event.startDate)} – ${fmt(event.endDate)}`
    : fmt(event.startDate);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        {/* Hero */}
        <div className="relative">
          {event.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.bannerUrl} alt={event.title} className="h-64 md:h-80 w-full object-cover" />
          ) : (
            <div className="h-64 md:h-80 w-full bg-gradient-to-br from-teal-500 to-emerald-600" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-end">
            <div className="max-w-5xl mx-auto w-full px-4 pb-8 text-white">
              <Link href="/events" className="text-white/80 hover:text-white text-sm font-semibold">← All events</Link>
              <h1 className="text-3xl md:text-5xl font-montserrat font-bold mt-3">{event.title}</h1>
              <p className="mt-2 text-white/90 font-medium">
                {dateLabel}
                {event.location && <span> · {event.location}</span>}
                {event.hostOrg?.name && <span> · Hosted by {event.hostOrg.name}</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          <p className="text-lg text-gray-700 leading-relaxed mb-12 whitespace-pre-line">{event.description}</p>

          {event.pledges.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold font-montserrat text-gray-900 mb-6">Take a Pledge</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {event.pledges.map(p => (
                  <Link key={p.id} href={`/pledges/${p.slug}`} className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-teal-300 hover:shadow-md transition-all">
                    <span className="text-xs font-bold text-gray-500 uppercase px-2 py-1 bg-gray-100 rounded-md">{p.category}</span>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors mt-3 mb-1">{p.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                    <span className="text-teal-600 font-semibold text-sm mt-3 inline-block">Take Pledge →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {event.quizzes.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold font-montserrat text-gray-900 mb-6">Test Your Knowledge</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {event.quizzes.map(q => (
                  <Link key={q.id} href={`/quiz/${q.slug}`} className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-teal-300 hover:shadow-md transition-all">
                    <span className="text-xs font-bold text-gray-500 uppercase px-2 py-1 bg-gray-100 rounded-md">{q.category}</span>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors mt-3 mb-1">{q.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{q.description}</p>
                    <span className="text-teal-600 font-semibold text-sm mt-3 inline-block">Start Quiz →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {event.pledges.length === 0 && event.quizzes.length === 0 && (
            <p className="text-gray-500 italic">No pledges or quizzes attached to this event yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
