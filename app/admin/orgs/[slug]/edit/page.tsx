import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditOrgForm from './EditOrgForm';
import Link from 'next/link';

export default async function EditOrgPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const org = await prisma.organization.findUnique({
    where: { slug }
  });

  if (!org) {
    notFound();
  }

  return (
    <div className="pb-16 animate-in fade-in duration-500 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/orgs" className="text-teal-600 hover:text-teal-700 text-sm font-semibold mb-4 inline-block flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Organizations
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Edit Organization</h1>
        <p className="text-gray-500 text-sm mt-2">Update branding, contact details, and platform integration for {org.name}.</p>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
        <EditOrgForm initialData={org} />
      </div>
    </div>
  );
}
