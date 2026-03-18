import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const pledge = await prisma.pledge.findUnique({
      where: { slug },
      include: {
        organization: true,
        commitments: { orderBy: { order: 'asc' } },
      },
    });
    
    if (!pledge) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(pledge);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pledge' }, { status: 500 });
  }
}
