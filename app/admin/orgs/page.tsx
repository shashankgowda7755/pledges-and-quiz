import prisma from '@/lib/prisma';
import AddOrgForm from './AddOrgForm';
import LogoutButton from './LogoutButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrgsPage() {
  const [orgs, firstQuiz] = await Promise.all([
    prisma.organization.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.quiz.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { slug: true },
    }),
  ]);

  const quizSlug = firstQuiz?.slug ?? 'house-sparrow';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌳</span>
            <span className="font-extrabold text-gray-900 tracking-tight">Communitree Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-teal-600">Organizations</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Organizations</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orgs.length} organization{orgs.length !== 1 ? 's' : ''} registered
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {orgs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🏢</p>
              <p className="font-medium">No organizations yet</p>
              <p className="text-sm mt-1">Add your first organization below</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Poster URL</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quiz Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orgs.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{org.name}</td>
                      <td className="px-6 py-4 font-mono text-gray-600 text-xs whitespace-nowrap">{org.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 capitalize">
                          {org.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate" title={org.quizPosterUrl ?? ''}>
                        {org.quizPosterUrl ? (
                          <span className="font-mono">{org.quizPosterUrl}</span>
                        ) : (
                          <span className="text-gray-300 italic">default</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${org.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${org.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {org.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/quiz/${quizSlug}?org=${org.slug}`}
                          target="_blank"
                          className="text-teal-600 hover:text-teal-700 font-medium text-xs underline underline-offset-2"
                        >
                          ?org={org.slug}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AddOrgForm />
      </main>
    </div>
  );
}
