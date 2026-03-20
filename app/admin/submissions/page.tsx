import prisma from '@/lib/prisma';
import ExportCsvButton from './ExportCsvButton';

export const dynamic = 'force-dynamic';

export default async function AdminSubmissionsPage() {
  const [pledges, quizzes] = await Promise.all([
    prisma.submission.findMany({
      include: { pledge: true, organization: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.quizAttempt.findMany({
      include: { quiz: true, organization: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const unifiedData = [
    ...pledges.map(p => ({
      id: p.id,
      type: 'Pledge' as const,
      name: p.userName,
      email: p.userEmail,
      whatsapp: p.whatsapp,
      activityName: p.pledge.name,
      orgName: p.organization?.name || 'Communitree Direct',
      date: p.createdAt,
      metadata: 'Agreed: ' + String(p.agreed)
    })),
    ...quizzes.map(q => ({
      id: q.id,
      type: 'Quiz' as const,
      name: q.userName,
      email: q.userEmail,
      whatsapp: q.whatsapp,
      activityName: q.quiz.title,
      orgName: q.organization?.name || 'Communitree Direct',
      date: q.createdAt,
      metadata: `Score: ${q.score}/${q.totalQuestions}`
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="pb-16 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Submissions</h1>
          <p className="text-gray-500 text-sm mt-2">
            {unifiedData.length} total participation records across all pledges and quizzes.
          </p>
        </div>
        <ExportCsvButton data={unifiedData} />
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Participant</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Organization</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {unifiedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{row.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-900 mb-0.5">{row.email}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{row.whatsapp || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${row.type === 'Pledge' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700 whitespace-nowrap max-w-[200px] truncate" title={row.activityName}>{row.activityName}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500 whitespace-nowrap">{row.orgName}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">{row.date.toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap text-right font-mono">{row.metadata}</td>
                </tr>
              ))}
              {unifiedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">No submissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
