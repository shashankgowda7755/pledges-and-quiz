export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { startDate: 'asc' },
    include: {
      hostOrg: { select: { name: true } },
      _count: { select: { pledges: true, quizzes: true } },
    },
  });

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
        <h1 className="text-4xl font-montserrat font-bold text-gray-900 mb-4">Events</h1>
        <p className="text-lg text-gray-600 mb-10">Join our campaigns — take a pledge or test your knowledge.</p>

        {events.length === 0 ? (
          <p className="text-gray-500">No events right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(ev => (
              <Link
                key={ev.id}
                href={`/events/${ev.slug}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:border-teal-300 hover:shadow-md transition-all flex flex-col"
              >
                {ev.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ev.bannerUrl} alt={ev.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-5xl">🌳</div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    {ev.isFeatured && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-700 rounded">Featured</span>}
                    <span className="text-xs font-bold text-teal-600">{fmt(ev.startDate)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors mb-1">{ev.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 flex-1">{ev.description}</p>
                  <div className="mt-4 text-xs text-gray-400 font-medium">
                    {ev.hostOrg?.name && <span>{ev.hostOrg.name} · </span>}
                    {ev._count.pledges} pledge{ev._count.pledges !== 1 ? 's' : ''} · {ev._count.quizzes} quiz{ev._count.quizzes !== 1 ? 'zes' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
