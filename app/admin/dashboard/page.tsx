import prisma from '@/lib/prisma';
import { Building2, HeartHandshake, CheckSquare, CalendarDays, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [totalPledges, totalOrgs, totalQuizAttempts, totalEvents, pledges] = await Promise.all([
    prisma.submission.count(),
    prisma.organization.count({ where: { isActive: true } }),
    prisma.quizAttempt.count(),
    prisma.event.count({ where: { isActive: true } }),
    prisma.pledge.findMany({
      include: { _count: { select: { submissions: true } } }
    })
  ]);

  const impactSummary = pledges.map(p => ({
    metric: p.impactMetric,
    total: p._count.submissions * p.impactPerUnit
  })).reduce((acc, curr) => {
    const existing = acc.find(x => x.metric === curr.metric);
    if (existing) existing.total += curr.total;
    else acc.push(curr);
    return acc;
  }, [] as { metric: string, total: number }[]);

  const stats = [
    { label: 'Active Events', value: totalEvents, icon: CalendarDays, color: 'bg-teal-50 text-teal-600' },
    { label: 'Active Organizations', value: totalOrgs, icon: Building2, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Pledges Taken', value: totalPledges, icon: HeartHandshake, color: 'bg-green-50 text-green-600' },
    { label: 'Total Quiz Attempts', value: totalQuizAttempts, icon: CheckSquare, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="pb-16 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-2">Welcome to the COMMUNITREE &amp; EZONE Admin Panel. Here is your participation overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-4xl font-extrabold text-gray-900">{stat.value}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-teal-500"/> Projected Impact <span className="text-xs font-medium text-gray-400 normal-case">(estimated from pledges — not yet measured)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {impactSummary.length === 0 && (
            <p className="text-gray-400 italic">No pledges yet.</p>
          )}
          {impactSummary.map(impact => (
            <div key={impact.metric} className="bg-teal-500 text-white rounded-[1.5rem] p-6 shadow-lg shadow-teal-500/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <p className="text-teal-50 text-xs font-bold uppercase tracking-wider mb-2">{impact.metric.replace(/_/g, ' ')}</p>
              <h3 className="text-3xl font-extrabold">{impact.total.toLocaleString()}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
