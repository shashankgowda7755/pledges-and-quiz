import prisma from '@/lib/prisma';
import AddCertificateForm from './AddCertificateForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewCertificatePage() {
  const events = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { startDate: 'asc' },
    select: { id: true, title: true },
  });

  return (
    <div className="pb-16 animate-in fade-in duration-500 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/certificates" className="text-teal-600 hover:text-teal-700 text-sm font-semibold mb-4 inline-block flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Certificates
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create New Certificate</h1>
        <p className="text-gray-500 text-sm mt-2">A branded, certificate-only event. Participants enter their details and download a personalised certificate — no pledge framing.</p>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
        <AddCertificateForm events={events} />
      </div>
    </div>
  );
}
