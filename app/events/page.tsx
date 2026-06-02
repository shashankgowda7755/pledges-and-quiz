export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getCalendarItems } from '@/lib/calendar';

export default async function EventsPage() {
  // Unified feed: Event records + standalone dated pledges, auto-linked.
  const events = await getCalendarItems({ upcomingOnly: true });

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-page py-16 w-full">
        <span className="eyebrow mb-3">Campaigns &amp; drives</span>
        <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-ink mb-3">Events</h1>
        <p className="text-lg text-[color:var(--muted)] mb-10 max-w-2xl">Join a COMMUNITREE &amp; EZONE campaign — take a pledge, test your knowledge, and earn your certificate.</p>

        {events.length === 0 ? (
          <p className="text-[color:var(--muted)]">No events right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {events.map(ev => (
              <Link key={ev.id} href={ev.href} className="card card-hover overflow-hidden flex flex-col group">
                {ev.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ev.bannerUrl} alt={ev.title} className="h-44 w-full object-cover" />
                ) : (
                  <div className="h-44 w-full bg-gradient-to-br from-forest to-leaf flex items-center justify-center text-5xl">🌳</div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-leaf/15 text-leaf rounded-full">{ev.kind}</span>
                    <span className="text-xs font-bold text-leaf">{fmt(ev.date)}</span>
                  </div>
                  <h3 className="text-lg font-bold font-montserrat text-ink group-hover:text-forest transition-colors mb-1">{ev.title}</h3>
                  <p className="text-sm text-[color:var(--muted)] line-clamp-2 flex-1 leading-relaxed">{ev.description}</p>
                  <div className="mt-4 text-xs font-semibold text-forest">{ev.kind === 'Pledge' ? 'Take the pledge →' : 'View event →'}</div>
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
