import prisma from '@/lib/prisma';
import Link from 'next/link';
import EventForm from '../EventForm';

export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
  const orgs = await prisma.organization.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div className="pb-16 animate-in fade-in duration-500 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/events" className="text-teal-600 hover:text-teal-700 text-sm font-semibold mb-4 inline-block flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Events
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create New Event</h1>
        <p className="text-gray-500 text-sm mt-2">Set up a campaign event. Attach pledges and quizzes to it from their own edit pages.</p>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
        <EventForm orgs={orgs} />
      </div>
    </div>
  );
}
