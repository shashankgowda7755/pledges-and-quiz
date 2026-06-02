import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// DPDP data-minimisation: personal data captured via pledges, quizzes, and org
// enquiries is permanently deleted 90 days (3 months) after submission.
// Newsletter subscribers are intentionally NOT purged — that is an ongoing,
// actively-consented service retained until the user unsubscribes.
const RETENTION_DAYS = 90;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed if not configured
  const header = req.headers.get('authorization') || req.headers.get('x-cron-secret') || '';
  return header === `Bearer ${secret}` || header === secret;
}

async function purge() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const where = { createdAt: { lt: cutoff } };

  const [submissions, quizAttempts, orgInquiries] = await prisma.$transaction([
    prisma.submission.deleteMany({ where }),
    prisma.quizAttempt.deleteMany({ where }),
    prisma.orgInquiry.deleteMany({ where }),
  ]);

  return {
    cutoff: cutoff.toISOString(),
    deleted: {
      submissions: submissions.count,
      quizAttempts: quizAttempts.count,
      orgInquiries: orgInquiries.count,
    },
  };
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await purge();
  return NextResponse.json({ ok: true, ...result });
}

// GET allowed too so simple cron pingers (cron-job.org etc.) can trigger it.
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await purge();
  return NextResponse.json({ ok: true, ...result });
}
