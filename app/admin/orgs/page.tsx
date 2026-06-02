import prisma from '@/lib/prisma';
import AddOrgForm from './AddOrgForm';
import Link from 'next/link';
import DeleteOrgButton from './DeleteOrgButton';
import MagicLinkPicker, { type Activity } from '@/components/MagicLinkPicker';
import RecycleButton from '@/components/RecycleButton';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? '';

export const dynamic = 'force-dynamic';

export default async function AdminOrgsPage() {
  const [orgs, pledges, quizzes] = await Promise.all([
    prisma.organization.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.pledge.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, select: { slug: true, name: true, isCertificateOnly: true } }),
    prisma.quiz.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, select: { slug: true, title: true } }),
  ]);

  // Every active activity is a magic-link target: pledges, certificates, quizzes.
  const activities: Activity[] = [
    ...pledges.map(p => ({ label: p.name, path: `/pledges/${p.slug}`, group: p.isCertificateOnly ? 'Certificates' : 'Pledges' })),
    ...quizzes.map(q => ({ label: q.title, path: `/quiz/${q.slug}`, group: 'Quizzes' })),
  ];

  return (
    <div className="pb-16 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Organisations</h1>
        <p className="text-gray-500 text-sm mt-2">
          {orgs.length} total organisation{orgs.length !== 1 ? 's' : ''} registered. Share each org&apos;s magic link to attribute their participation — partner orgs are never listed publicly.
        </p>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
        {orgs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏢</p>
            <p className="font-medium">No organisations yet</p>
            <p className="text-sm mt-1">Add your first organisation below</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Magic Link</th>
                  <th className="text-right px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orgs.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{org.name}</td>
                    <td className="px-6 py-4 font-mono text-gray-500 text-xs whitespace-nowrap">{org.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">
                        {org.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${org.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${org.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                        {org.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {org.isActive ? (
                        <MagicLinkPicker orgSlug={org.slug} appUrl={APP_URL} activities={activities} />
                      ) : (
                        <span className="text-xs text-gray-400">Org deactivated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-2">
                      <RecycleButton photoSrc={org.logoUrl ?? org.posterLogoUrl ?? undefined} filename={`recycle-${org.slug}`} />
                      <Link href={`/admin/orgs/${org.slug}/edit`} title="Edit Organization" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </Link>
                      <DeleteOrgButton slug={org.slug} isActive={org.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="pt-8 border-t border-gray-100">
        <AddOrgForm />
      </div>
    </div>
  );
}
