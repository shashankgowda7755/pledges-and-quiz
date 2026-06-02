import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AddPledgeForm from '../../new/AddPledgeForm';

export const dynamic = 'force-dynamic';

export default async function EditPledgePage(context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  const [pledge, events] = await Promise.all([
    prisma.pledge.findUnique({ where: { slug }, include: { commitments: { orderBy: { order: 'asc' } } } }),
    prisma.event.findMany({ where: { isActive: true }, orderBy: { startDate: 'asc' }, select: { id: true, title: true } }),
  ]);

  if (!pledge) notFound();

  return (
    <div className="pb-16 animate-in fade-in duration-500 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/pledges" className="text-teal-600 hover:text-teal-700 text-sm font-semibold mb-4 inline-block flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Pledges
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Edit Pledge</h1>
        <p className="text-gray-500 text-sm mt-2">Update details, poster, commitments, and certificate layout.</p>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
        <AddPledgeForm
          events={events}
          initialData={{
            slug: pledge.slug,
            name: pledge.name,
            description: pledge.description,
            category: pledge.category,
            bgImageUrl: pledge.bgImageUrl,
            impactMetric: pledge.impactMetric,
            impactPerUnit: pledge.impactPerUnit,
            eventId: pledge.eventId,
            certConfig: pledge.certConfig,
            commitments: pledge.commitments.map(c => c.text),
            collectEmail: pledge.collectEmail,
            collectPhone: pledge.collectPhone,
          }}
        />
      </div>
    </div>
  );
}
