import prisma from '@/lib/prisma';
import Link from 'next/link';
import DeleteEventButton from './DeleteEventButton';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: 'asc' },
    include: {
      hostOrg: { select: { name: true } },
      _count: { select: { pledges: true, quizzes: true } },
    },
  });

  const fmt = (d: Date | null) =>
    d ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d)) : '—';

  return (
    <div className="pb-16 animate-in fade-in duration-500">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Events</h1>
          <p className="text-gray-500 text-sm mt-2">
            {events.length} event{events.length !== 1 ? 's' : ''}. Each event groups pledges and quizzes under one campaign.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="px-6 py-3 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors shadow-md shadow-teal-500/20 text-sm whitespace-nowrap"
        >
          + New Event
        </Link>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-medium">No events yet</p>
            <p className="text-sm mt-1">Create your first event to start grouping campaigns</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Host</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {ev.isFeatured && <span title="Featured" className="text-amber-400">★</span>}
                        {ev.title}
                      </div>
                      <div className="font-mono text-gray-400 text-xs">{ev.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {fmt(ev.startDate)}
                      {ev.endDate && <span className="text-gray-400"> → {fmt(ev.endDate)}</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{ev.hostOrg?.name ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {ev._count.pledges} pledge{ev._count.pledges !== 1 ? 's' : ''} · {ev._count.quizzes} quiz{ev._count.quizzes !== 1 ? 'zes' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${ev.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ev.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                        {ev.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-2">
                      <Link href={`/admin/events/${ev.slug}/edit`} title="Edit Event" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </Link>
                      <DeleteEventButton slug={ev.slug} isActive={ev.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
