import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const pledges = await prisma.pledge.findMany({
      where: { isActive: true },
      orderBy: [
        { eventDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    return NextResponse.json(pledges);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pledges' }, { status: 500 });
  }
}
