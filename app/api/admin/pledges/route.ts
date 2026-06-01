import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const adminToken = req.cookies.get('admin_token');
  if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { slug, name, description, category, bgImageUrl, impactMetric, impactPerUnit, commitments, eventId, certConfig, isCertificateOnly } = body;

    if (!slug || !name || !description || !bgImageUrl || !impactMetric || !commitments || commitments.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPledge = await prisma.pledge.create({
      data: {
        slug,
        name,
        description,
        category,
        bgImageUrl,
        certConfig: certConfig || null,
        isCertificateOnly: Boolean(isCertificateOnly),
        impactMetric,
        impactPerUnit: parseFloat(impactPerUnit),
        eventId: eventId || null,
        commitments: {
          create: commitments.map((text: string, i: number) => ({ text, order: i + 1 }))
        }
      }
    });

    return NextResponse.json({ ok: true, pledge: newPledge });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create pledge. Ensure the slug is unique.' }, { status: 500 });
  }
}
