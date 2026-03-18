import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export async function GET() {
  try {
    const [totalPledges, totalOrgs, totalQuizAttempts, pledges] = await Promise.all([
      prisma.submission.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.quizAttempt.count(),
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

    return NextResponse.json({
      totalPledges,
      totalOrgs,
      totalQuizAttempts,
      impactSummary
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
