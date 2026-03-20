import prisma from '@/lib/prisma';
import Link from 'next/link';
import DeleteQuizButton from './DeleteQuizButton';

export const dynamic = 'force-dynamic';

export default async function AdminQuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { attempts: true } } }
  });

  return (
    <div className="pb-16 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quizzes</h1>
          <p className="text-gray-500 text-sm mt-2">
            {quizzes.length} total quiz{quizzes.length !== 1 ? 'zes' : ''} available.
          </p>
        </div>
        <Link href="/admin/quizzes/new" className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-teal-500/20">
          + New Quiz
        </Link>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
        {quizzes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">❓</p>
            <p className="font-medium">No quizzes created</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Attempts</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quizzes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{q.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">
                        {q.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-teal-600 whitespace-nowrap">{q._count.attempts}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${q.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${q.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                        {q.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DeleteQuizButton slug={q.slug} isActive={q.isActive} />
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
