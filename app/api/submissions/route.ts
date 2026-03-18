import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  pledgeId: z.string(),
  userName: z.string().min(1),
  userEmail: z.string().email(),
  whatsapp: z.string().optional(),
  agreed: z.boolean().optional(),
  orgId: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const existing = await prisma.submission.findUnique({
      where: {
        userEmail_pledgeId: {
          userEmail: data.userEmail,
          pledgeId: data.pledgeId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ id: existing.id });
    }

    const submission = await prisma.submission.create({
      data: {
        pledgeId: data.pledgeId,
        userName: data.userName,
        userEmail: data.userEmail,
        whatsapp: data.whatsapp,
        agreed: data.agreed ?? false,
        ...(data.orgId && { orgId: data.orgId })
      }
    });

    return NextResponse.json({ id: submission.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit' }, { status: 400 });
  }
}
