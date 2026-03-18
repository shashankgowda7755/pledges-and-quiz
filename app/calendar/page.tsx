export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';
import { CalendarSubscribe } from './CalendarSubscribe';

export default async function CalendarPage() {
  const pledges = await prisma.pledge.findMany({
    where: { isActive: true, eventDate: { not: null } },
    orderBy: { eventDate: 'asc' }
  });

  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30);

  const upcomingPledges = pledges.filter(
    p => p.eventDate && new Date(p.eventDate) <= next30Days && new Date(p.eventDate) >= new Date()
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <h1 className="text-4xl font-montserrat font-bold text-gray-900 mb-4">Event Calendar</h1>
          <p className="text-lg text-gray-600 mb-8">Special days, global observances, and action-driven events.</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-bold font-montserrat text-gray-900 mb-6 border-b border-gray-100 pb-4">All Upcoming Events</h3>
            <div className="space-y-6">
              {pledges.map(p => (
                <div key={p.id} className="flex gap-6 group">
                  <div className="flex flex-col items-center justify-center min-w-[60px]">
                    <span className="text-sm font-bold text-gray-400 uppercase">
                      {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(p.eventDate!))}
                    </span>
                    <span className="text-3xl font-bold font-ibm-mono text-teal-500">
                      {new Date(p.eventDate!).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-5 border border-gray-100 group-hover:border-teal-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{p.name}</h4>
                      <span className="text-xs font-bold text-gray-500 uppercase px-2 py-1 bg-gray-200 rounded-md">{p.category}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{p.description}</p>
                    <Link href={`/pledges/${p.slug}`} className="text-teal-600 font-semibold text-sm hover:text-teal-700">Take Pledge →</Link>
                  </div>
                </div>
              ))}
              {pledges.length === 0 && <p className="text-gray-500">No upcoming events found.</p>}
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-28">
            <h3 className="font-bold font-montserrat text-gray-900 mb-4">Next 30 Days</h3>
            {upcomingPledges.length > 0 ? (
              <ul className="space-y-4">
                {upcomingPledges.map(p => (
                  <li key={p.id} className="text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <span className="font-bold text-teal-600 mr-2 block mb-1">
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(p.eventDate!))}
                    </span>
                    <Link href={`/pledges/${p.slug}`} className="text-gray-700 hover:text-gray-900 font-medium block">{p.name}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No events in the next 30 days.</p>
            )}
            <CalendarSubscribe />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
