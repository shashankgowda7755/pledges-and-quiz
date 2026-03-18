import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  orgName: z.string(),
  orgType: z.string(),
  contactName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  cause: z.string(),
  message: z.string()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const inquiry = await prisma.orgInquiry.create({
      data
    });

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 400 });
  }
}
