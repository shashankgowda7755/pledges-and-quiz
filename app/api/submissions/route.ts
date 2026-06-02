import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  pledgeId: z.string(),
  userName: z.string().min(1),
  userEmail: z.string().email().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  agreed: z.boolean().optional(),
  orgId: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const email = data.userEmail || null;

    // Server-side guard: a deactivated pledge accepts no new entries.
    const pledge = await prisma.pledge.findUnique({ where: { id: data.pledgeId }, select: { isActive: true } });
    if (!pledge || !pledge.isActive) {
      return NextResponse.json({ error: 'This event is over. Entries are closed.' }, { status: 403 });
    }

    // Dedup only when an email was captured. Forms with email collection
    // turned off allow repeat submissions (no reliable unique key).
    if (email) {
      const existing = await prisma.submission.findUnique({
        where: {
          userEmail_pledgeId: { userEmail: email, pledgeId: data.pledgeId }
        }
      });
      if (existing) {
        return NextResponse.json({ id: existing.id });
      }
    }

    const submission = await prisma.submission.create({
      data: {
        pledgeId: data.pledgeId,
        userName: data.userName,
        userEmail: email,
        whatsapp: data.whatsapp || null,
        agreed: data.agreed ?? false,
        ...(data.orgId && { orgId: data.orgId })
      }
    });

    return NextResponse.json({ id: submission.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit' }, { status: 400 });
  }
}
