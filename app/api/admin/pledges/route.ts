import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const adminToken = req.cookies.get('admin_token');
  if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { slug, name, description, category, bgImageUrl, impactMetric, impactPerUnit, commitments, eventId, eventDate, certConfig, isCertificateOnly } = body;

    const certOnly = Boolean(isCertificateOnly);
    const commitmentList: string[] = Array.isArray(commitments) ? commitments : [];

    // Certificates skip pledge framing, so they don't need commitments.
    if (!slug || !name || !description || !bgImageUrl || !impactMetric || (!certOnly && commitmentList.length === 0)) {
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
        isCertificateOnly: certOnly,
        impactMetric,
        impactPerUnit: parseFloat(impactPerUnit),
        eventId: eventId || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        commitments: {
          create: commitmentList.map((text: string, i: number) => ({ text, order: i + 1 }))
        }
      }
    });

    return NextResponse.json({ ok: true, pledge: newPledge });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create pledge. Ensure the slug is unique.' }, { status: 500 });
  }
}
